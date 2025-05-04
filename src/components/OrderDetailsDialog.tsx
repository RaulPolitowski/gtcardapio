import React from 'react';
import { X, CreditCard } from 'lucide-react';
import { Order } from '../types';

interface OrderDetailsDialogProps {
  order: Order;
  onClose: () => void;
  onRepeatOrder?: (items: Order['items']) => void;
}

export function OrderDetailsDialog({ order, onClose, onRepeatOrder }: OrderDetailsDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card-light rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Pedido #{order.id.slice(-4)}</h2>
              <p className="text-sm text-gray-400">
                {new Date(order.createdAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
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

        <div className="p-6 space-y-6">
          {/* Items */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4">Itens do Pedido</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {item.quantity}x {item.product.name}
                    </p>
                    {item.additionals?.map(add => (
                      <p key={add.id} className="text-sm text-gray-500 ml-4">
                        + {add.quantity}x {add.name}
                      </p>
                    ))}
                    {item.notes && (
                      <p className="text-sm text-gray-500 ml-4">
                        Obs: {item.notes}
                      </p>
                    )}
                  </div>
                  <p className="text-menu-accent">
                    R$ {(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
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

          {/* Total */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total do Pedido</span>
              <span className="text-xl font-bold text-menu-accent">
                R$ {order.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              onClick={() => onRepeatOrder?.(order.items)}
              className="px-4 py-2 bg-menu-accent text-white rounded-lg hover:bg-menu-accent/90 transition-colors"
            >
              Repetir Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}