import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, MapPin, Receipt, ChefHat, Truck, Check, Search, Calendar,
  Filter, AlertCircle, Home, Loader2, CreditCard, ChevronLeft, ChevronRight,
  CircleDollarSign
} from 'lucide-react';
import { getCustomerOrders, getOrders } from '../api';
import { useAuth } from '../hooks/useAuth';
import { Order } from '../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { OrderDetailsDialog } from '../components/OrderDetailsDialog';

interface MyOrdersProps {
  onRepeatOrder: (items: Order['items']) => void;
}

const ITEMS_PER_PAGE = 10;

export default function MyOrders({ onRepeatOrder }: MyOrdersProps) {
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading } = useAuth();
  const [filters, setFilters] = useState({
    currentPage: 1,
    searchQuery: '',
    dateRange: [null, null] as [Date | null, Date | null],
    priceRange: { min: '', max: '' },
    sortBy: 'date' as 'date' | 'value' | 'status' | 'priority',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading: ordersLoading, error } = useQuery({
    queryKey: ['orders', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      return currentUser.isAdmin ? getOrders() : getCustomerOrders(currentUser.id);
    },
    enabled: !!currentUser,
    refetchInterval: 30000
  });

  // Show loading state while checking authentication
  if (authLoading) {
    return ( 
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-menu-accent animate-spin mx-auto" />
          <p className="text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-menu-accent mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-gray-400 mb-6">Faça login para ver seus pedidos</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-menu-accent text-white rounded-lg hover:bg-menu-accent/90 transition-colors duration-300"
          >
            <Home className="w-5 h-5" /> Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while fetching orders
  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-menu-accent animate-spin mx-auto" />
          <p className="text-gray-400">Carregando pedidos...</p>
        </div>
      </div>
    );
  }
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Em preparo',
          icon: ChefHat,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'ready':
        return {
          label: 'Pronto para retirada',
          icon: Check,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'delivering':
        return {
          label: 'Em entrega',
          icon: Truck,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'completed':
        return {
          label: 'Entregue',
          icon: Check,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          label: 'Status desconhecido',
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const calculateOrderStats = (orders: Order[]) => {
    const total = orders.length;
    const totalValue = orders.reduce((sum, order) => sum + order.total, 0);

    return {
      total,
      totalValue,
    };
  };

  const filterOrders = (orders: Order[]) => {
    return orders.filter(order => {
      // Date filter
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const orderDate = new Date(order.createdAt);
        return orderDate >= filters.dateRange[0] && orderDate <= filters.dateRange[1];
      }

      // Price range filter
      if (filters.priceRange.min && order.total < parseFloat(filters.priceRange.min)) return false;
      if (filters.priceRange.max && order.total > parseFloat(filters.priceRange.max)) return false;

      // Search query
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        return (
          order.id.toLowerCase().includes(searchLower) ||
          order.items.some(item => 
            item.product.name.toLowerCase().includes(searchLower)
          )
        );
      }

      return true;
    });
  };

  // Sort orders
  const sortOrders = (orders: Order[]) => {
    return [...orders].sort((a, b) => {
      const multiplier = filters.sortOrder === 'desc' ? -1 : 1;
      
      switch (filters.sortBy) {
        case 'date':
          return multiplier * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'value':
          return multiplier * (b.total - a.total);
        case 'status':
          return multiplier * (b.status.localeCompare(a.status));
        case 'priority':
          return multiplier * ((b.status === 'pending' ? 1 : 0) - (a.status === 'pending' ? 1 : 0));
        default:
          return 0;
      }
    });
  };

  const filteredOrders = sortOrders(filterOrders(orders));
  const stats = calculateOrderStats(filteredOrders);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (filters.currentPage - 1) * ITEMS_PER_PAGE,
    filters.currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-header-content">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="page-title">Meus Pedidos</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-content">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Buscar pedidos..."
                className="w-full form-input pl-10"
              />
            </div>
            {/* Date Filter */}
            <div className="flex items-center gap-2 col-span-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <DatePicker
                selectsRange={true}
                startDate={filters.dateRange[0]}
                endDate={filters.dateRange[1]}
                onChange={(update) => setFilters(prev => ({ ...prev, dateRange: update }))}
                className="form-input"
                placeholderText="Selecione o período"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div className="col-span-2 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Valor Mínimo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                  <input
                    type="number"
                    value={filters.priceRange.min}
                    onChange={e => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: { ...prev.priceRange, min: e.target.value }
                    }))}
                    className="form-input pl-10"
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Valor Máximo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                  <input
                    type="number"
                    value={filters.priceRange.max}
                    onChange={e => setFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: e.target.value }
                    }))}
                    className="form-input pl-10"
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="col-span-2 flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Ordenar por</label>
                <select
                  value={filters.sortBy}
                  onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as typeof filters.sortBy }))}
                  className="form-input"
                >
                  <option value="date">Data</option>
                  <option value="value">Valor</option>
                  <option value="status">Status</option>
                  <option value="priority">Prioridade</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Ordem</label>
                <select
                  value={filters.sortOrder}
                  onChange={e => setFilters(prev => ({ ...prev, sortOrder: e.target.value as typeof filters.sortOrder }))}
                  className="form-input"
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Panel - Compact version below filters */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card p-3 flex items-center justify-between">
            <div className="text-sm text-gray-400">Total de Pedidos</div>
            <div className="text-lg font-bold text-menu-accent">{stats.total}</div>
          </div>

          <div className="card p-3 flex items-center justify-between">
            <div className="text-sm text-gray-400">Valor Total</div>
            <div className="text-lg font-bold text-menu-accent">
              R$ {stats.totalValue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {ordersLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-menu-accent animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Carregando pedidos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Erro ao carregar pedidos
            </h3>
            <p className="text-gray-400">
              Ocorreu um erro ao carregar seus pedidos. Por favor, tente novamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-menu-accent text-white rounded-lg hover:bg-menu-accent/90 transition-colors duration-300"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Orders List */}
        {!ordersLoading && !error && (
          <div className="space-y-6">
            {paginatedOrders.map(order => {
              return (
                <div
                  key={order.id}
                  className="card card-hover p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        Pedido #{order.id.slice(-4)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-menu-accent">
                      R$ {order.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 text-xs bg-menu-accent/10 text-menu-accent rounded-lg hover:bg-menu-accent/20 transition-colors"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
                  disabled={filters.currentPage === 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-gray-400">
                  Página {filters.currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, totalPages) }))}
                  disabled={filters.currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!ordersLoading && !error && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-400">
              {filters.searchQuery
                ? 'Tente ajustar os filtros para ver mais pedidos'
                : 'Você ainda não fez nenhum pedido'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-menu-accent text-white rounded-lg hover:bg-menu-accent/90 transition-colors duration-300"
            >
              Fazer Pedido
            </button>
          </div>
        )}

        {/* Order Details Dialog */}
        {selectedOrder && (
          <OrderDetailsDialog
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onRepeatOrder={(items) => {
              onRepeatOrder(items);
              setSelectedOrder(null);
            }}
          />
        )}
      </main>
    </div>
  );
}