import React, { useState } from 'react';
import { X, LogIn, CreditCard, Banknote, Utensils, Check, Clock, Receipt, AlertCircle, MapPin } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutModalProps {
  items: CartItem[];
  onClose: () => void;
  onSubmit: (orderData: {
    customerName: string;
    customerPhone: string;
    address?: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    deliveryType: 'delivery' | 'pickup' | 'local';
    paymentMethod: 'credit' | 'debit' | 'pix' | 'cash';
    changeFor?: number;
    notes?: string;
    tableNumber?: string;
    comandaNumber?: string;
  }) => Promise<boolean>;
}

export function CheckoutModal({ items, onClose, onSubmit }: CheckoutModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: 'SP',
      zipCode: ''
    },
    deliveryType: 'local' as const,
    paymentMethod: 'credit' as const,
    changeFor: undefined as number | undefined,
    notes: '',
    tableNumber: '',
    comandaNumber: ''
  });

  const total = items.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity;
    const additionalsTotal = (item.additionals?.reduce(
      (sum, add) => sum + (add.price * add.quantity),
      0
    ) || 0) * item.quantity;
    return sum + itemTotal + additionalsTotal;
  }, 0);

  const estimatedTime = items.reduce(
    (total, item) => total + (item.product.preparationTime * item.quantity),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (formData.deliveryType === 'local' && !formData.comandaNumber) {
      alert('Por favor, informe o número da comanda');
      return;
    }

    if (formData.deliveryType === 'delivery') {
      if (!formData.address.street || !formData.address.number || !formData.address.neighborhood || !formData.address.city || !formData.address.zipCode) {
        alert('Por favor, preencha todos os campos do endereço para delivery');
        return;
      }
    }

    if (formData.paymentMethod === 'cash' && (!formData.changeFor || formData.changeFor < total)) {
      alert('Por favor, informe um valor válido para o troco');
      return;
    }

    try {
      const orderData = {
        ...formData,
        items: items,
        total,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        estimatedTime
      };

      const success = await onSubmit(orderData);
      if (success) {
        setStep('success');
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao realizar o pedido. Tente novamente.');
    }
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-[bounce_1s_ease-in-out]">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Pedido Confirmado!
            </h2>
            <p className="text-gray-600 mb-6">
              Seu pedido foi recebido com sucesso
            </p>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-700 mb-4">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  Tempo estimado: {estimatedTime} min
                </span>
              </div>
              
              <div className="space-y-3">
                {formData.deliveryType === 'local' ? (
                  <div className="flex items-center justify-center gap-2">
                    <Receipt className="w-5 h-5 text-green-600" />
                    <p className="text-gray-700">
                      Seu pedido será preparado e entregue na
                      <span className="font-semibold block">
                        Comanda {formData.comandaNumber}
                        {formData.tableNumber && ` - Mesa ${formData.tableNumber}`}
                      </span>
                    </p>
                  </div>
                ) : formData.deliveryType === 'delivery' ? (
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <p className="text-gray-700">
                      Seu pedido será entregue em:
                      <span className="font-semibold block">
                        {formData.address.street}, {formData.address.number}
                        {formData.address.complement && ` - ${formData.address.complement}`}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <p className="text-gray-700">
                      Seu pedido estará pronto para retirada em breve
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 pt-2 border-t border-green-100">
                  {formData.paymentMethod === 'cash' ? (
                    <Banknote className="w-5 h-5 text-green-600" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-green-600" />
                  )}
                  <p className="text-gray-700">
                    Pagamento: {' '}
                    <span className="font-medium">
                      {formData.paymentMethod === 'credit' && 'Cartão de Crédito'}
                      {formData.paymentMethod === 'debit' && 'Cartão de Débito'}
                      {formData.paymentMethod === 'pix' && 'PIX'}
                      {formData.paymentMethod === 'cash' && 'Dinheiro'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Observações</span>
              </div>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Acompanhe o status do seu pedido pelo app</li>
                <li>• Em caso de dúvidas, entre em contato conosco</li>
                {formData.deliveryType === 'delivery' && (
                  <li>• Tempo de entrega pode variar conforme a região</li>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <a
                href="/orders"
                className="block w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Ver Meus Pedidos
              </a>
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Voltar ao Cardápio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Finalizar Pedido</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Resumo do Pedido</h3>
            {items.map(item => (
              <div key={`${item.product.id}-${item.notes}-${JSON.stringify(item.additionals)}`} className="py-2">
                <div className="flex justify-between">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.additionals && item.additionals.length > 0 && (
                  <div className="ml-4">
                    {item.additionals.map(additional => (
                      <div key={additional.id} className="flex justify-between text-sm text-gray-600">
                        <span>+ {additional.quantity}x {additional.name}</span>
                        <span>R$ {(additional.price * additional.quantity * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {item.notes && (
                  <p className="text-sm text-gray-500 ml-4">Obs: {item.notes}</p>
                )}
              </div>
            ))}
            <div className="border-t mt-2 pt-2 font-bold flex justify-between">
              <span>Total</span>
              <span className="text-green-600">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Atendimento
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.deliveryType === 'local'}
                    onChange={() => setFormData(prev => ({ ...prev, deliveryType: 'local' }))}
                    className="mr-2"
                  />
                  <Utensils className="w-4 h-4 mr-1" />
                  Local
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.deliveryType === 'delivery'}
                    onChange={() => setFormData(prev => ({ ...prev, deliveryType: 'delivery' }))}
                    className="mr-2"
                  />
                  <MapPin className="w-4 h-4 mr-1" />
                  Delivery
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.deliveryType === 'pickup'}
                    onChange={() => setFormData(prev => ({ ...prev, deliveryType: 'pickup' }))}
                    className="mr-2"
                  />
                  <MapPin className="w-4 h-4 mr-1" />
                  Retirar no Local
                </label>
              </div>
            </div>

            {formData.deliveryType === 'local' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número da Comanda
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.comandaNumber}
                    onChange={e => setFormData(prev => ({ ...prev, comandaNumber: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                    placeholder="Ex: 123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número da Mesa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.tableNumber}
                    onChange={e => setFormData(prev => ({ ...prev, tableNumber: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                    placeholder="Ex: 15"
                  />
                </div>
              </div>
            )}

            {formData.deliveryType === 'delivery' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address.zipCode}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rua
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address.street}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address.number}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, number: e.target.value }
                    }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.address.complement}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, complement: e.target.value }
                    }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address.neighborhood}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, neighborhood: e.target.value }
                    }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address.city}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-4">
                {(['credit', 'debit', 'pix', 'cash'] as const).map(method => (
                  <label key={method} className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.paymentMethod === method}
                      onChange={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                      className="mr-2"
                    />
                    {method === 'cash' ? (
                      <Banknote className="w-4 h-4 mr-1" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-1" />
                    )}
                    {method === 'credit' && 'Cartão de Crédito'}
                    {method === 'debit' && 'Cartão de Débito'}
                    {method === 'pix' && 'PIX'}
                    {method === 'cash' && 'Dinheiro'}
                  </label>
                ))}
              </div>
            </div>

            {formData.paymentMethod === 'cash' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Troco para quanto?
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={total}
                  required
                  value={formData.changeFor || ''}
                  onChange={e => setFormData(prev => ({ ...prev, changeFor: parseFloat(e.target.value) }))}
                  className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
                {formData.changeFor && formData.changeFor > total && (
                  <p className="text-sm text-gray-600 mt-1">
                    Troco: R$ {(formData.changeFor - total).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                rows={3}
                placeholder="Alguma observação adicional para o pedido?"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02]"
            >
              Confirmar Pedido
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}