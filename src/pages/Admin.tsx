import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { getProducts, createProduct, updateProduct, deleteProduct, sampleCustomers, sampleOrders } from '../api';
import { 
  Pencil, Trash2, Plus, Clock, AlertTriangle,
  Leaf, Wheat, Image, Filter, X, ArrowLeft, MessageSquare, 
  Settings as SettingsIcon, Store, Package, BarChart2,
  Search, Phone, Mail, Download, ChevronLeft, ChevronRight,
  DollarSign, TrendingUp, CheckCircle2, Send, Truck, Calendar,
  User, Eye
} from 'lucide-react';
import { DashboardDialog } from '../components/DashboardDialog';
import { SystemSettings } from '../types';
import type { Product, Category } from '../types';
import { AdminDetailsDialog } from '../components/AdminDetailsDialog';
import { Order, Customer } from '../types';

const categories: Category[] = ['Lanches', 'Porções', 'Pizzas', 'Bebidas', 'Combos'];

type AdminTab = 'dashboard' | 'customers' | 'orders' | 'products' | 'whatsapp' | 'store';

interface DashboardStats {
  dailyOrders: number;
  dailyRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  newCustomers: number;
  deliveryPercentage: number;
  pickupPercentage: number;
}

function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { preferences, updateShowProductImages } = useSystemSettings();
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customersPerPage, setCustomersPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('month');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | ''>('');
  const [filterAvailable, setFilterAvailable] = useState<boolean | ''>('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTodayOrdersDialog, setShowTodayOrdersDialog] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<'today' | 'week' | 'month'>('month');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [dialogData, setDialogData] = useState<{ data: Order[] | Customer[]; period: [Date | null, Date | null] }>({
    data: [],
    period: [null, null]
  });
  const ITEMS_PER_PAGE = 10;
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    dailyOrders: 32,
    dailyRevenue: 1250.00,
    monthlyOrders: 856,
    monthlyRevenue: 32450.00,
    newCustomers: 15,
    deliveryPercentage: 65,
    pickupPercentage: 35
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('systemSettings');
    const defaultSettings = {
      whatsApp: {
        number: '',
        messageTemplate: 'Olá! Seu pedido foi recebido:\\n\\n{items}\\n\\nTotal: R$ {total}\\n\\nObrigado pela preferência!',
        pickupAddress: {
          street: '',
          number: '',
          neighborhood: ''
        }
      },
      store: {
        subtitle: 'Sabor e tecnologia em cada pedido',
        showProductImages: true,
        businessHours: {
          'Segunda-feira': { open: '10:00', close: '22:00' },
          'Terça-feira': { open: '10:00', close: '22:00' },
          'Quarta-feira': { open: '10:00', close: '22:00' },
          'Quinta-feira': { open: '10:00', close: '22:00' },
          'Sexta-feira': { open: '10:00', close: '23:00' },
          'Sábado': { open: '10:00', close: '23:00' },
          'Domingo': { open: '12:00', close: '20:00' }
        },
        specialDates: []
      }
    };
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const handleSaveSettings = () => {
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    setFeedbackMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      setFeedbackMessage({ type: 'success', text: 'Produto criado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
    onError: () => {
      setFeedbackMessage({ type: 'error', text: 'Erro ao criar produto. Por favor, tente novamente.' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, product }: { id: string; product: Omit<Product, 'id'> }) =>
      updateProduct(id, product),
    onSuccess: () => {
      setFeedbackMessage({ type: 'success', text: 'Produto atualizado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
    onError: () => {
      setFeedbackMessage({ type: 'error', text: 'Erro ao atualizar produto. Por favor, tente novamente.' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      setFeedbackMessage({ type: 'success', text: 'Produto excluído com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
    onError: () => {
      setFeedbackMessage({ type: 'error', text: 'Erro ao excluir produto. Por favor, tente novamente.' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  });

  const handleEditProduct = (product: Product) => {
    setIsEditing(true);
    setEditingProduct({
      ...product,
      dietary: product.dietary || { vegetarian: false, vegan: false, glutenFree: false }
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingProduct({});
    setShowAdvancedOptions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct.name || !editingProduct.category || !editingProduct.price) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const product = {
      name: editingProduct.name || '',
      description: editingProduct.description || '',
      price: Number(editingProduct.price) || 0,
      category: editingProduct.category as Category || 'Lanches',
      imageUrl: editingProduct.imageUrl || '',
      available: editingProduct.available ?? true,
      preparationTime: Number(editingProduct.preparationTime) || 5,
      ingredients: editingProduct.ingredients || [],
      allergens: editingProduct.allergens || [],
      dietary: editingProduct.dietary || {
        vegetarian: false,
        vegan: false,
        glutenFree: false
      },
      allowAdditionals: editingProduct.allowAdditionals ?? false,
      additionalCategories: editingProduct.additionalCategories || []
    };

    if (isEditing && editingProduct.id) {
      updateMutation.mutate({ id: editingProduct.id, product });
    } else {
      createMutation.mutate(product);
    }
  };

  // Filter products based on category and availability
  const filteredProducts = products.filter(product => {
    if (filterCategory && product.category !== filterCategory) return false;
    if (filterAvailable !== '' && product.available !== filterAvailable) return false;
    return true;
  });

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
            <h1 className="page-title">Painel Administrativo</h1>
          </div>
        </div>
      </header>

      <main className="page-content">
        {/* Tabs */}
        <div className="border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <nav className="flex gap-2 md:gap-8 min-w-max pb-1">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-sm md:text-base font-medium transition-colors whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'border-menu-accent text-menu-accent'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4 md:w-5 md:h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('products')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-sm md:text-base font-medium transition-colors whitespace-nowrap ${
                currentTab === 'products'
                  ? 'border-menu-accent text-menu-accent'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 md:w-5 md:h-5" />
              Produtos
            </button>
            <button
              onClick={() => setCurrentTab('whatsapp')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-sm md:text-base font-medium transition-colors whitespace-nowrap ${
                currentTab === 'whatsapp'
                  ? 'border-menu-accent text-menu-accent'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
              WhatsApp
            </button>
            <button
              onClick={() => setCurrentTab('store')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-sm md:text-base font-medium transition-colors whitespace-nowrap ${
                currentTab === 'store'
                  ? 'border-menu-accent text-menu-accent'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4 md:w-5 md:h-5" />
              Loja
            </button>
          </nav>
        </div>

        {feedbackMessage && (
          <div className={`p-4 rounded-lg ${
            feedbackMessage.type === 'success' 
              ? 'bg-green-900/50 text-green-200 border border-green-500/50' 
              : 'bg-red-900/50 text-red-200 border border-red-500/50'
          }`}>
            {feedbackMessage.text}
          </div>
        )}

        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card">
                <button
                  onClick={() => {
                    // Get today's date range
                    const today = new Date();
                    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
                    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
                    
                    // Filter orders for today and sort by most recent
                    const todayOrders = sampleOrders.filter(order => {
                      const orderDate = new Date(order.createdAt);
                      return orderDate >= startOfDay && orderDate <= endOfDay;
                    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    
                    setDialogData(prev => ({
                      type: "orders",
                      data: todayOrders,
                      period: [startOfDay, endOfDay]
                    }));
                    setShowDetailsDialog(true);
                  }}
                  className="w-full h-full text-left hover:bg-card-hover/50 transition-colors duration-300 rounded-lg"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-400 text-sm">Pedidos no Período</h3>
                      <Clock className="w-5 h-5 text-menu-accent" />
                    </div>
                    <div className="text-2xl font-bold text-white">{dashboardStats.dailyOrders}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      R$ {dashboardStats.dailyRevenue.toFixed(2)}
                    </div>
                    <div className="mt-4 text-xs text-menu-accent flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Ver detalhes
                    </div>
                  </div>
                </button>
              </div>

              <div className="card">
                <button
                  onClick={() => {
                    const today = new Date();
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                    // Filter customers registered this month and sort by most recent
                    const monthCustomers = sampleCustomers
                      .filter(customer => {
                        // In a real app, you would use customer.createdAt
                        // For demo purposes, we'll show all customers
                        return true;
                      })
                      .sort((a, b) => b.id.localeCompare(a.id)); // Sort by ID for demo
                    
                    setDialogData(prev => ({
                      type: "customers",
                      data: monthCustomers,
                      period: [startOfMonth, endOfMonth]
                    }));
                    setShowDetailsDialog(true);
                  }}
                  className="w-full h-full text-left hover:bg-card-hover/50 transition-colors duration-300 rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-400 text-sm">Novos Clientes</h3>
                      <User className="w-5 h-5 text-menu-accent" />
                    </div>
                    <div className="text-2xl font-bold text-white">{dashboardStats.newCustomers}</div>
                    <div className="text-sm text-gray-400 mt-1">no período</div>
                    <div className="mt-4 text-xs text-menu-accent flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Ver detalhes
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm">Faturamento</h3>
                  <DollarSign className="w-5 h-5 text-menu-accent" />
                </div>
                <div className="text-2xl font-bold text-white">
                  R$ {dashboardStats.monthlyRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Ticket Médio: R$ {(dashboardStats.monthlyRevenue / dashboardStats.monthlyOrders).toFixed(2)}
                </div>
              </div>          
            </div>
          
            {/* Orders Dialog */}
            {showDetailsDialog && (
  <AdminDetailsDialog
    type={dialogData.type} // Definido dinamicamente
    data={dialogData.data}
    period={dialogData.period}
    onClose={() => setShowDetailsDialog(false)}
  />
)}
            
          </div>
        )}

        {currentTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditingProduct({});
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Novo Produto
              </button>
            </div>

            {/* Products List */}
            {!isEditing && (
              <div className="card overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white">Lista de Produtos</h2>
                    <div className="flex gap-2">
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value as Category | '')}
                        className="form-input text-sm"
                      >
                        <option value="">Todas as categorias</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {filteredProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-card-hover rounded-lg">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-medium text-white">{product.name}</h3>
                            <p className="text-sm text-gray-400">{product.category}</p>
                            <p className="text-sm font-medium text-menu-accent">
                              R$ {product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              handleEditProduct(product);
                              setEditingProduct(product);
                            }}
                            className="p-2 text-gray-400 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir este produto?')) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Product Form */}
            {isEditing && (
              <div className="card p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white">
                    {editingProduct.id ? 'Editar Produto' : 'Novo Produto'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="form-label">Nome do Produto</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name || ''}
                        onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                        className="form-input"
                        placeholder="Digite o nome do produto"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="form-label">Descrição</label>
                      <textarea
                        value={editingProduct.description || ''}
                        onChange={e => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                        className="form-input"
                        rows={3}
                        placeholder="Digite a descrição do produto"
                      />
                    </div>

                    <div>
                      <label className="form-label">Preço</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={editingProduct.price || ''}
                          onChange={e => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                          className="form-input pl-10"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Categoria</label>
                      <select
                        required
                        value={editingProduct.category || ''}
                        onChange={e => setEditingProduct(prev => ({ ...prev, category: e.target.value as Category }))}
                        className="form-input"
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="form-label">URL da Imagem</label>
                      <input
                        type="url"
                        value={editingProduct.imageUrl || ''}
                        onChange={e => setEditingProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="form-input"
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>

                    <div>
                      <label className="form-label">Tempo de Preparo (minutos)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={editingProduct.preparationTime || ''}
                        onChange={e => setEditingProduct(prev => ({ ...prev, preparationTime: parseInt(e.target.value) }))}
                        className="form-input"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.available ?? true}
                          onChange={e => setEditingProduct(prev => ({ ...prev, available: e.target.checked }))}
                          className="form-checkbox"
                        />
                        <span className="text-sm text-gray-300">Disponível</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {editingProduct.id ? 'Atualizar' : 'Criar'} Produto
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {currentTab === 'whatsapp' && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Configurações do WhatsApp</h2>
            <div className="space-y-6">
              <div>
                <label className="form-label">Número do WhatsApp</label>
                <input
                  type="tel"
                  value={systemSettings.whatsApp.number}
                  onChange={e => setSystemSettings(prev => ({
                    ...prev,
                    whatsApp: { ...prev.whatsApp, number: e.target.value }
                  }))}
                  className="form-input"
                  placeholder="Ex: 5511999999999"
                />
                <p className="mt-1 text-sm text-gray-400">
                  Digite o número com código do país e DDD, sem espaços ou caracteres especiais
                </p>
              </div>

              <div>
                <label className="form-label">Mensagem do Pedido</label>
                <p className="text-sm text-gray-400 mb-2">
                  Variáveis disponíveis:
                </p>
                <ul className="text-sm text-gray-400 space-y-1 mb-2">
                  <li><code>{`{items}`}</code> - Lista de itens do pedido</li>
                  <li><code>{`{total}`}</code> - Valor total do pedido</li>
                  <li><code>{`{customerName}`}</code> - Nome do cliente</li>
                  <li><code>{`{orderNumber}`}</code> - Número do pedido</li>
                </ul>
                <textarea
                  value={systemSettings.whatsApp.messageTemplate}
                  onChange={e => setSystemSettings(prev => ({
                    ...prev,
                    whatsApp: { ...prev.whatsApp, messageTemplate: e.target.value }
                  }))}
                  className="form-input"
                  rows={6}
                  placeholder="Digite a mensagem..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="btn btn-primary"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

{currentTab === 'store' && (
  <div className="card p-6">
    <h2 className="text-lg font-semibold text-white mb-6">Configurações da Loja</h2>
    <div className="space-y-6">
      <div>
        <label className="form-label">Subtítulo da Loja</label>
        <input
          type="text"
          value={systemSettings.store.subtitle}
          onChange={e => setSystemSettings(prev => ({
            ...prev,
            store: { ...prev.store, subtitle: e.target.value }
          }))}
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">URL do Instagram</label>
        <input
          type="url"
          value={systemSettings.store.instagramUrl}
          onChange={e => setSystemSettings(prev => ({
            ...prev,
            store: { ...prev.store, instagramUrl: e.target.value }
          }))}
          className="form-input"
          placeholder="https://www.instagram.com/seu_perfil"
        />
      </div>

      <div>
        <label className="form-label">Horário de Funcionamento</label>
        <div className="space-y-3">
          {Object.entries(systemSettings.store.businessHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4">
              <span className="w-32 text-sm">{day}</span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={hours.open}
                  onChange={e => setSystemSettings(prev => ({
                    ...prev,
                    store: {
                      ...prev.store,
                      businessHours: {
                        ...prev.store.businessHours,
                        [day]: { ...hours, open: e.target.value }
                      }
                    }
                  }))}
                  className="form-input"
                />
                <span>até</span>
                <input
                  type="time"
                  value={hours.close}
                  onChange={e => setSystemSettings(prev => ({
                    ...prev,
                    store: {
                      ...prev.store,
                      businessHours: {
                        ...prev.store.businessHours,
                        [day]: { ...hours, close: e.target.value }
                      }
                    }
                  }))}
                  className="form-input"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={e => setSystemSettings(prev => ({
                      ...prev,
                      store: {
                        ...prev.store,
                        businessHours: {
                          ...prev.store.businessHours,
                          [day]: { ...hours, closed: e.target.checked }
                        }
                      }
                    }))}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
}

export default Admin;
