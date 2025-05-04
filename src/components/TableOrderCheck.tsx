import React, { useState } from 'react';
import { X, Receipt, Clock, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getTableOrders } from '../api';

interface TableOrderCheckProps {
  onClose: () => void;
}

export function TableOrderCheck({ onClose }: TableOrderCheckProps) {
  const [comandaNumber, setComandaNumber] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { data: orders = [], refetch } = useQuery({
    queryKey: ['tableOrders', comandaNumber],
    queryFn: () => getTableOrders(comandaNumber),
    enabled: false
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    refetch();
  };

  const calculateTotal = (orders: any[]) => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-sm w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold">Consultar Comanda</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número da Comanda
              </label>
              <input
                type="text"
                value={comandaNumber}
                onChange={(e) => setComandaNumber(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="Digite o número"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              Consultar
            </button>
          </form>

          {hasSearched && orders.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-green-800">Total da Comanda</span>
                  <span className="text-lg font-bold text-green-700">
                    R$ {calculateTotal(orders).toFixed(2)}
                  </span>
                </div>
                <span className="text-xs text-green-600">
                  {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>

              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <span className="font-medium text-green-600">
                        R$ {order.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="text-sm">
                          <div className="flex justify-between">
                            <span>{item.quantity}x {item.product.name}</span>
                          </div>
                          {item.additionals?.map((add: any) => (
                            <div key={add.id} className="text-xs text-gray-500 ml-4">
                              + {add.quantity}x {add.name}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 rounded-lg p-3 text-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-amber-700">
                    <p className="font-medium mb-1">Observações</p>
                    <ul className="space-y-0.5">
                      <li>• Pagamento no caixa</li>
                      <li>• Confira os itens antes de pagar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-4">
              <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Nenhum pedido encontrado
              </p>
            </div>
          ) : null}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Voltar ao cardápio
          </button>
        </div>
      </div>
    </div>
  );
}