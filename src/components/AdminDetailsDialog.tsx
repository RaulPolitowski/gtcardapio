import React from 'react';
import { X, Clock, MapPin, CreditCard, Receipt, User, Phone, Mail, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Order, Customer } from '../types';

interface AdminDetailsDialogProps {
  type: 'orders' | 'customers';
  data: Order[] | Customer[];
  period: [Date | null, Date | null];
  onClose: () => void;
}

export function AdminDetailsDialog({ type, data, period, onClose }: AdminDetailsDialogProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const periodText = period[0] && period[1]
    ? `${formatDate(period[0])} até ${formatDate(period[1])}`
    : 'Todo o período';

  // Calculate pagination
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card-light rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                {type === 'orders' ? 'Detalhes dos Pedidos' : 'Novos Clientes'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                <Calendar className="w-4 h-4 inline-block mr-1" />
                {periodText}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {type === 'orders' ? (
            <div className="space-y-6">
              {(paginatedData as Order[]).map(order => (
                <div key={order.id} className="bg-card-hover rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Receipt className="w-4 h-4 text-menu-accent" />
                        <span className="font-medium text-white">Pedido #{order.id.slice(-4)}</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-menu-accent">
                      R$ {order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Items */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Itens</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span className="text-gray-400">
                              R$ {(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">Cliente</span>
                          </div>
                          <p className="text-white">{order.customerName}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">Pagamento</span>
                          </div>
                          <p className="text-white">
                            {order.paymentMethod === 'credit' && 'Cartão de Crédito'}
                            {order.paymentMethod === 'debit' && 'Cartão de Débito'}
                            {order.paymentMethod === 'pix' && 'PIX'}
                            {order.paymentMethod === 'cash' && 'Dinheiro'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {(paginatedData as Customer[]).map(customer => (
                <div key={customer.id} className="bg-card-hover rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-menu-accent/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-menu-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-2">{customer.name}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail className="w-4 h-4" />
                          <span>{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                      {customer.address && (
                        <div className="mt-2 flex items-start gap-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          <span>
                            {customer.address.street}, {customer.address.number}
                            {customer.address.complement && ` - ${customer.address.complement}`}
                            <br />
                            {customer.address.neighborhood}, {customer.address.city}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-white/10">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-400">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}