import React from 'react';
import { Clock, Check } from 'lucide-react';
import { Order } from '../types';

interface KitchenOrderProps {
  order: Order;
  onComplete: (orderId: string) => void;
}

export function KitchenOrder({ order, onComplete }: KitchenOrderProps) {
  const totalPreparationTime = order.items.reduce(
    (total, item) => total + (item.product.preparationTime * item.quantity),
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">Pedido #{order.id.slice(-4)}</h3>
          <p className="text-sm text-gray-500">{order.customerName}</p>
        </div>
        <div className="flex items-center gap-1 text-amber-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{totalPreparationTime}min</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between items-start">
            <div>
              <div className="font-medium">{item.quantity}x {item.product.name}</div>
              {item.additionals && item.additionals.length > 0 && (
                <div className="ml-4">
                  {item.additionals.map(additional => (
                    <div key={additional.id} className="text-sm text-gray-600">
                      + {additional.quantity}x {additional.name}
                    </div>
                  ))}
                </div>
              )}
              {item.notes && (
                <p className="text-sm text-red-600">Obs: {item.notes}</p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {item.product.preparationTime}min
            </div>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="mb-4 p-2 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Observações:</strong> {order.notes}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <p className="text-sm font-medium">
            {order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
          </p>
          {order.deliveryType === 'delivery' && order.address && (
            <p className="text-sm text-gray-500">
              {order.address.street}, {order.address.number}
              {order.address.complement && ` - ${order.address.complement}`}
            </p>
          )}
        </div>
        <button
          onClick={() => onComplete(order.id)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
        >
          <Check className="w-4 h-4" />
          Concluir
        </button>
      </div>
    </div>
  );
}