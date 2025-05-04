import React from 'react';
import { Clock, MapPin, Check, Truck, ChefHat } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingModalProps {
  order: Order;
  onClose: () => void;
}

export function OrderTrackingModal({ order, onClose }: OrderTrackingModalProps) {
  const getStatusInfo = () => {
    switch (order.status) {
      case 'pending':
        return {
          title: 'Pedido Recebido',
          description: 'Seu pedido foi recebido e está aguardando confirmação.',
          icon: Clock,
          color: 'text-yellow-600',
          progress: 20
        };
      case 'preparing':
        return {
          title: 'Em Preparo',
          description: 'Seu pedido está sendo preparado com todo cuidado.',
          icon: ChefHat,
          color: 'text-blue-600',
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
          progress: 60
        };
      case 'delivering':
        return {
          title: 'Em Entrega',
          description: 'Seu pedido está a caminho.',
          icon: Truck,
          color: 'text-purple-600',
          progress: 80
        };
      case 'completed':
        return {
          title: 'Entregue',
          description: 'Seu pedido foi entregue. Bom apetite!',
          icon: Check,
          color: 'text-green-600',
          progress: 100
        };
      default:
        return {
          title: 'Status Desconhecido',
          description: 'Não foi possível determinar o status do pedido.',
          icon: Clock,
          color: 'text-gray-600',
          progress: 0
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Acompanhar Pedido</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
            <h3 className="text-lg font-semibold">{statusInfo.title}</h3>
          </div>
          <p className="text-gray-600">{statusInfo.description}</p>
        </div>

        {/* Barra de Progresso */}
        <div className="h-2 bg-gray-200 rounded-full mb-6">
          <div
            className="h-full bg-green-600 rounded-full transition-all duration-500"
            style={{ width: `${statusInfo.progress}%` }}
          />
        </div>

        <div className="space-y-4">
          {/* Tempo Estimado */}
          {order.estimatedTime && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Tempo Estimado</p>
                <p className="text-gray-600">{order.estimatedTime} minutos</p>
              </div>
            </div>
          )}

          {/* Informações de Entrega */}
          {order.deliveryType === 'delivery' && order.deliveryStatus && (
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Status da Entrega</p>
                <p className="text-gray-600">
                  {order.deliveryStatus.status === 'waiting' && 'Aguardando entregador'}
                  {order.deliveryStatus.status === 'assigned' && 'Entregador designado'}
                  {order.deliveryStatus.status === 'picked' && 'Pedido coletado'}
                  {order.deliveryStatus.status === 'delivering' && 'Em rota de entrega'}
                  {order.deliveryStatus.status === 'delivered' && 'Entregue'}
                </p>
                {order.deliveryStatus.driverName && (
                  <p className="text-sm text-gray-500">
                    Entregador: {order.deliveryStatus.driverName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Endereço de Entrega */}
          {order.deliveryType === 'delivery' && order.address && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
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
        </div>
      </div>
    </div>
  );
}