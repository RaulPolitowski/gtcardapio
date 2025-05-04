import React from 'react';
import { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, MapPin, Truck, Check } from 'lucide-react';
import { CartItem, Customer } from '../types';
import { createOrder } from '../api';
import { useQueryClient } from '@tanstack/react-query';

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onRemove: (productId: string, notes?: string, additionals?: CartItem['additionals']) => void;
  onUpdateQuantity: (productId: string, quantity: number, notes?: string, additionals?: CartItem['additionals']) => void;
  onCheckout: () => void;
  currentUser?: Customer | null;
}

function Cart({ items, onClose, onRemove, onUpdateQuantity, onCheckout, currentUser }: CartProps) {
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: currentUser?.address?.street || '',
    number: currentUser?.address?.number || '',
    complement: currentUser?.address?.complement || '',
    neighborhood: currentUser?.address?.neighborhood || ''
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'debit' | 'pix'>('cash');
  const [changeAmount, setChangeAmount] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    if (!cep || cep.length !== 8) return;
    
    setIsLoadingAddress(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setDeliveryAddress(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Handler para o campo de CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      fetchAddressByCep(cep);
    }
  };

  // Formatar mensagem detalhada para WhatsApp
  const formatMessage = () => {
    let message = `Olá, Gostaria de fazer um pedido\n\n*Cliente:* ${customerName}\n\n*Itens do Pedido:*`;

    // Adicionar itens
    items.forEach(item => {
      message += `\n• ${item.quantity}x ${item.product.name} → Subtotal: R$ ${(item.product.price * item.quantity).toFixed(2)}`;
      
      // Adicionar adicionais
      if (item.additionals?.length) {
        item.additionals.forEach(add => {
          message += `\n→ Adicionais: ${add.name}`;
        });
      }
      
      // Adicionar observações do item
      if (item.notes) {
        message += `\n→ Obs: ${item.notes}`;
      }
    });

    // Adicionar subtotal
    message += `\n\n*Resumo do Pedido:*\nTotal: R$ ${total.toFixed(2)}`;

    // Adicionar tipo de entrega
    message += `\n\n*Entrega:* ${deliveryType === 'delivery' 
      ? `Delivery\nEndereço: ${deliveryAddress.street}, ${deliveryAddress.number}${
        deliveryAddress.complement ? ` - ${deliveryAddress.complement}` : ''
      }\nBairro: ${deliveryAddress.neighborhood}` 
      : 'Retirada no Local'
    }`;

    // Adicionar forma de pagamento apenas para delivery
    if (deliveryType === 'delivery') {
      message += `\n\n*Pagamento:* ${
        paymentMethod === 'credit' ? 'Cartão de Crédito' :
        paymentMethod === 'debit' ? 'Cartão de Débito' :
        paymentMethod === 'pix' ? 'PIX' :
        'Dinheiro'
      }`;
      
      if (paymentMethod === 'cash' && changeAmount) {
        message += `\nTroco para: R$ ${changeAmount}`;
      }
    }

    // Adicionar observações gerais do pedido
    if (orderNotes) {
      message += `\n\n*Observações Gerais:*\n${orderNotes}`;
    }

    return message;
  };

  const total = items.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity;
    const additionalsTotal = (item.additionals?.reduce(
      (sum, add) => sum + (add.price * add.quantity),
      0
    ) || 0) * item.quantity;
    return sum + itemTotal + additionalsTotal;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card-light text-white shadow-xl p-6 z-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Carrinho Vazio</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
          <p className="text-gray-400">Adicione itens ao seu carrinho</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 right-0 w-full max-w-md bg-card-light text-white shadow-xl z-50 flex flex-col h-[100dvh] overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Revisar Pedido</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 mb-[140px] scrollbar-hide">
          {/* Items List */}
          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div
                key={`${item.product.id}-${item.notes}-${JSON.stringify(item.additionals)}`}
                className="flex items-start gap-4 py-4 border-b border-white/10"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-white">{item.product.name}</h3>
                  {item.additionals && item.additionals.length > 0 && (
                    <div className="mt-1">
                      {item.additionals.map(additional => (
                        <span key={additional.id} className="text-sm text-gray-400 block">
                          + {additional.quantity}x {additional.name} (R$ {(additional.price * additional.quantity).toFixed(2)})
                        </span>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <p className="text-sm text-gray-400">Obs: {item.notes}</p>
                  )}
                  <p className="font-medium text-menu-accent mt-1">
                    R$ {(
                      item.product.price * item.quantity +
                      (item.additionals?.reduce((sum, add) => sum + (add.price * add.quantity), 0) || 0) * item.quantity
                    ).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.notes, item.additionals)}
                      className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.notes, item.additionals)}
                      className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(item.product.id, item.notes, item.additionals)}
                  className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Customer Information */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => {
                  setCustomerName(e.target.value);
                  setFormError('');
                }}
                ref={nameInputRef}
                className={`w-full rounded-lg bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:border-[#FF4500] focus:ring-[#FF4500]/20 ${
                  formError ? 'border-red-500 ring-1 ring-red-500' : ''
                }`}
                required
                placeholder="Digite seu nome"
              />
              {formError && (
                <p className="mt-1 text-sm text-red-400">
                  {formError}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Type Selection */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Como você quer receber seu pedido?
            </label>
            <div className="inline-flex p-1 bg-card-hover rounded-lg">
              <button
                onClick={() => setDeliveryType('pickup')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all duration-300 ${
                  deliveryType === 'pickup'
                    ? 'bg-menu-accent text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Retirar no Local
              </button>
              <button
                onClick={() => setDeliveryType('delivery')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all duration-300 ${
                  deliveryType === 'delivery'
                    ? 'bg-menu-accent text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Delivery
              </button>
            </div>
          </div>

          {/* Pickup Address Info */}
          {deliveryType === 'pickup' && (
            <div className="mb-6 p-4 bg-card-hover rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-menu-accent flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-white mb-1">Local de Retirada</h4>
                  <p className="text-gray-400">Rua Santos Dumont, 2005</p>
                  <p className="text-gray-400">Prédio German Tech Sistemas</p>
                  <p className="text-gray-400">Centro</p>
                  <a href="https://maps.google.com/?q=Rua+Santos+Dumont,2005,Centro" target="_blank" rel="noopener noreferrer" className="text-menu-accent hover:text-menu-accent/80 text-sm mt-2 inline-block">Ver no Google Maps</a>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {deliveryType === 'delivery' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bairro *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Digite o CEP"
                    onChange={handleCepChange}
                    className="w-full rounded-lg bg-card-hover border-gray-700 text-white placeholder-gray-500 focus:border-menu-accent focus:ring-menu-accent/20 mb-4"
                  />
                  {isLoadingAddress && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-menu-accent/30 border-t-menu-accent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={deliveryAddress.neighborhood}
                  onChange={e => setDeliveryAddress(prev => ({
                    ...prev,
                    neighborhood: e.target.value
                  }))}
                  className="w-full rounded-lg bg-card-hover border-gray-700 text-white placeholder-gray-500 focus:border-menu-accent focus:ring-menu-accent/20"
                  required
                  placeholder="Digite seu bairro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Rua *
                </label>
                <input
                  type="text"
                  value={deliveryAddress.street}
                  onChange={e => setDeliveryAddress(prev => ({
                    ...prev,
                    street: e.target.value
                  }))}
                  className="w-full rounded-lg bg-card-hover border-gray-700 text-white placeholder-gray-500 focus:border-menu-accent focus:ring-menu-accent/20"
                  required
                  placeholder="Digite sua rua"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.number}
                    onChange={e => setDeliveryAddress(prev => ({
                      ...prev,
                      number: e.target.value
                    }))}
                    className="w-full rounded-lg bg-card-hover border-gray-700 text-white placeholder-gray-500 focus:border-menu-accent focus:ring-menu-accent/20"
                    required
                    placeholder="Nº"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.complement}
                    onChange={e => setDeliveryAddress(prev => ({
                      ...prev,
                      complement: e.target.value
                    }))}
                    className="w-full rounded-lg bg-card-hover border-gray-700 text-white placeholder-gray-500 focus:border-menu-accent focus:ring-menu-accent/20"
                    placeholder="Apto, Casa, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {deliveryType === 'delivery' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pagamento
              </label>
              <div className="inline-flex flex-wrap gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                    paymentMethod === 'cash'
                      ? 'bg-menu-accent text-white shadow-sm'
                      : 'bg-card-hover text-gray-400 hover:text-white hover:bg-card-hover/80'
                  }`}
                >
                  Dinheiro
                </button>
                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                    paymentMethod === 'credit'
                      ? 'bg-menu-accent text-white shadow-sm'
                      : 'bg-card-hover text-gray-400 hover:text-white hover:bg-card-hover/80'
                  }`}
                >
                  Crédito
                </button>
                <button
                  onClick={() => setPaymentMethod('debit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                    paymentMethod === 'debit'
                      ? 'bg-menu-accent text-white shadow-sm'
                      : 'bg-card-hover text-gray-400 hover:text-white hover:bg-card-hover/80'
                  }`}
                >
                  Débito
                </button>
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                    paymentMethod === 'pix'
                      ? 'bg-menu-accent text-white shadow-sm'
                      : 'bg-card-hover text-gray-400 hover:text-white hover:bg-card-hover/80'
                  }`}
                >
                  PIX
                </button>
              </div>

              {paymentMethod === 'cash' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Troco para quanto?
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={changeAmount}
                      onChange={(e) => setChangeAmount(e.target.value)}
                      className="w-full rounded-lg bg-card-hover border-gray-700 text-white placeholder-gray-500 focus:border-menu-accent focus:ring-menu-accent/20 pl-8"
                      placeholder="0.00"
                      min={total}
                      step="0.01"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                  </div>
                  {parseFloat(changeAmount) > 0 && parseFloat(changeAmount) >= total && (
                    <p className="mt-1 text-sm text-gray-400">
                      Troco: R$ {(parseFloat(changeAmount) - total).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Order Notes */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Observações do Pedido
            </label>
            <textarea
              value={orderNotes}
              onChange={e => setOrderNotes(e.target.value)}
              className="w-full rounded-lg bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:border-[#FF4500] focus:ring-[#FF4500]/20"
              rows={3}
              placeholder="Alguma observação para o pedido?"
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-card-light max-w-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <span className="text-2xl font-bold text-menu-accent">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-900/50 text-red-200 rounded-lg text-sm mb-4 border border-red-500/50">
              {formError}
            </div>
          )}

          <button
            onClick={() => {
              // Validar nome
              if (!customerName.trim()) {
                setFormError('Por favor, informe seu nome para continuar');
                nameInputRef.current?.focus();
                return;
              }

              // Validar endereço para delivery
              if (deliveryType === 'delivery') {
                if (!deliveryAddress.neighborhood || !deliveryAddress.street || !deliveryAddress.number) {
                  setFormError('Por favor, preencha o endereço de entrega');
                  return;
                }
                
                if (paymentMethod === 'cash' && (!changeAmount || parseFloat(changeAmount) < total)) {
                  setFormError('Por favor, informe um valor válido para o troco');
                  return;
                }
              }
              
              const message = formatMessage();

              // Enviar para WhatsApp
              const whatsappNumber = '45998498928';
              const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

              // Se o usuário estiver logado, salvar o pedido
              if (currentUser) {
                const orderData = {
                  customerId: currentUser.id,
                  items,
                  total,
                  customerName,
                  customerPhone,
                  address: deliveryType === 'delivery' ? deliveryAddress : undefined,
                  deliveryType,
                  paymentMethod,
                  changeFor: paymentMethod === 'cash' ? parseFloat(changeAmount) : undefined,
                  notes: orderNotes
                };

                createOrder(orderData).then(() => {
                  // Atualizar a lista de pedidos
                  queryClient.invalidateQueries({ queryKey: ['orders'] });
                  
                  window.open(whatsappUrl, '_blank');
                  setShowSuccess(true);
                });
              } else {
                // Se não estiver logado, apenas enviar para WhatsApp
                window.open(whatsappUrl, '_blank');
                setShowSuccess(true);
              }
            }}
            className="w-full py-3 bg-menu-accent text-white font-semibold rounded-lg hover:bg-menu-accent/90 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Enviar Pedido no WhatsApp
          </button>
        </div>
      </div>
      
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Pedido Enviado!
            </h3>
            <p className="text-gray-600 mb-6">
              Agradecemos a preferência! Seu pedido foi enviado com sucesso e em breve você receberá uma confirmação no WhatsApp.
            </p>
            {deliveryType === 'pickup' && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Local de Retirada</h4>
                <p className="text-gray-600">Rua Santos Dumont, 2005</p>
                <p className="text-gray-600">Prédio German Tech Sistemas</p>
                <p className="text-gray-600 mb-3">Centro</p>
                <a 
                  href="https://maps.google.com/?q=Rua+Santos+Dumont,2005,Centro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm inline-flex items-center gap-1"
                >
                  <MapPin className="w-4 h-4" />
                  Ver no Google Maps
                </a>
              </div>
            )}
            {currentUser && (
              <p className="text-sm text-gray-500 mb-4">
                Você pode acompanhar seu pedido na seção "Meus Pedidos"
              </p>
            )}
            <button
              onClick={() => {
                setShowSuccess(false);
                onCheckout(); // Limpar o carrinho somente quando fechar a mensagem
                onClose();
              }}
              className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export { Cart };