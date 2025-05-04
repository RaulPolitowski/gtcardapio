import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPin, Check, Truck, ChefHat, ArrowLeft, Receipt, ClipboardList } from 'lucide-react';
import { getOrders } from '../api';

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    refetchInterval: 10000 // Atualiza a cada 10 segundos
  });

  const order = orders.find(o => o.id === orderId);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Pedido não encontrado</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (order.status) {
      case 'pending':
        return {
          title: 'Pedido Recebido',
          description: 'Seu pedido foi recebido e está aguardando confirmação.',
          icon: Receipt,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          progress: 20
        };
      case 'preparing':
        return {
          title: 'Em Preparo',
          description: 'Seu pedido está sendo preparado com todo cuidado.',
          icon: ChefHat,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          progress: 40
        };
      case 'ready':
        return {
          title: 'Pronto para Entrega',
          description: order.deliveryType === 'delivery' 
            ? 'Seu pedido está pronto e aguardando o entregador.'
            : 'Seu pedido está pronto para retirada.',
          icon: Check,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          progress: 60
        };
      case 'delivering':
        return {
          title: 'Em Entrega',
          description: 'Seu pedido está a caminho.',
          icon: Truck,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          progress: 80
        };
      case 'completed':
        return {
          title: 'Entregue',
          description: 'Seu pedido foi entregue. Bom apetite!',
          icon: Check,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          progress: 100
        };
      default:
        return {
          title: 'Status Desconhecido',
          description: 'Não foi possível determinar o status do pedido.',
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          progress: 0
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-medium">Acompanhar Pedido</h1>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-sm">Meus Pedidos</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Status do Pedido */}
          <div className="p-6 border-b">
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-3 ${statusInfo.bgColor} rounded-xl`}>
                <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  Pedido #{order.id.slice(-4)}
                </h1>
                <p className="text-gray-600">
                  {statusInfo.description}
                </p>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${statusInfo.progress}%` }}
              />
            </div>

            {/* Etapas do Pedido */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              {['Recebido', 'Em Preparo', 'Pronto', 'Entregue'].map((step, index) => (
                <div
                  key={step}
                  className={`text-center ${
                    (statusInfo.progress / 100) * 4 > index
                      ? statusInfo.color
                      : 'text-gray-400'
                  }`}
                >
                  <div className="font-medium text-sm">{step}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Informações do Pedido */}
          <div className="p-6">
            <h2 className="font-semibold mb-4">Detalhes do Pedido</h2>
            
            <div className="space-y-4">
              {/* Tempo Estimado */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Tempo Estimado</p>
                  <p className="text-gray-600">
                    {order.estimatedTime} minutos
                  </p>
                </div>
              </div>

              {/* Endereço de Entrega */}
              {order.deliveryType === 'delivery' && order.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Endereço de Entrega</p>
                    <p className="text-gray-600">
                      {order.address.street}, {order.address.number}
                      {order.address.complement && ` - ${order.address.complement}`}
                      <br />
                      {order.address.neighborhood}, {order.address.city}
                    </p>
                  </div>
                </div>
              )}

              {/* Itens do Pedido */}
              <div className="mt-6">
                <h3 className="font-medium mb-3">Itens do Pedido</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <div>
                        <p className="font-medium">
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
                      <p className="text-gray-600">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-green-600">
                      R$ {order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}