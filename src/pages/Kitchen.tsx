import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KitchenOrder } from '../components/KitchenOrder';
import { getOrders, updateOrderStatus } from '../api';

function Kitchen() {
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    refetchInterval: 10000 // Atualiza a cada 10 segundos
  });

  const completeMutation = useMutation({
    mutationFn: (orderId: string) => updateOrderStatus(orderId, 'completed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const pendingOrders = orders.filter(order => order.status === 'pending');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pedidos em Preparo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingOrders.map(order => (
          <KitchenOrder
            key={order.id}
            order={order}
            onComplete={(orderId) => completeMutation.mutate(orderId)}
          />
        ))}
        
        {pendingOrders.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            Nenhum pedido em preparo no momento
          </div>
        )}
      </div>
    </div>
  );
}

export default Kitchen;