import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Clock, MapPin, Heart, LogOut, Settings, Camera, Loader2 } from 'lucide-react';
import { getCustomerOrders, updateCustomerProfile } from '../api';
import type { Customer, Order } from '../types';

interface CustomerPortalProps {
  customer: Customer;
  onLogout: () => void;
}

function CustomerPortal({ customer, onLogout }: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'favorites'>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(customer);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { data: orders } = useQuery({
    queryKey: ['customerOrders', customer.id],
    queryFn: () => getCustomerOrders(customer.id)
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<Customer>) => updateCustomerProfile(customer.id, data),
    onSuccess: () => {
      setFeedbackMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setIsEditing(false);
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
    onError: (error) => {
      setFeedbackMessage({ 
        type: 'error', 
        text: 'Erro ao atualizar perfil. Por favor, tente novamente.' 
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      setIsUploading(true);
      
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          photoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);

      // Here you would typically upload to your storage service
      // For now, we'll just update the profile with the base64 string
      // In a real app, replace this with your actual upload logic
      
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erro ao fazer upload da foto. Tente novamente.');
      setIsUploading(false);
    }
  };

  const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="border-b border-white/10">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-menu-accent/10 flex items-center justify-center">
                  {profileData.photoUrl ? (
                    <img 
                      src={profileData.photoUrl} 
                      alt={profileData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-menu-accent" />
                  )}
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-menu-accent rounded-full flex items-center justify-center text-white hover:bg-menu-accent/90 transition-colors"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
                <p className="text-gray-400">{customer.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-300"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium ${
                activeTab === 'orders'
                  ? 'border-menu-accent text-menu-accent'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Meus Pedidos
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium ${
                activeTab === 'favorites'
                  ? 'border-menu-accent text-menu-accent'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              Favoritos
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium ${
                activeTab === 'profile'
                  ? 'border-menu-accent text-menu-accent'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              Meu Perfil
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="section-title">Histórico de Pedidos</h2>
              {orders?.map(order => (
                <div key={order.id} className="card card-hover p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-sm text-gray-400">
                        Pedido #{order.id.slice(-4)}
                      </span>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                          {order.status === 'pending' && 'Em preparo'}
                          {order.status === 'confirmed' && 'Confirmado'}
                          {order.status === 'completed' && 'Entregue'}
                          {order.status === 'cancelled' && 'Cancelado'}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-menu-accent">
                      R$ {order.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {order.deliveryType === 'delivery' && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>Entrega: {order.address?.street}, {order.address?.number}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {(!orders || orders.length === 0) && (
                <div className="text-center py-12 text-gray-400">
                  Você ainda não fez nenhum pedido
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="section-title">Meus Dados</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-menu-accent hover:text-menu-accent/80"
                  >
                    Editar
                  </button>
                )}
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="form-input disabled:bg-card-hover/50"
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className="form-input disabled:bg-card-hover/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="form-input bg-card-hover/50"
                    />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Endereço Principal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="form-label">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={profileData.address?.zipCode || ''}
                        onChange={e => setProfileData(prev => ({
                          ...prev,
                          address: { ...prev.address, zipCode: e.target.value }
                        }))}
                        disabled={!isEditing}
                        className="form-input disabled:bg-card-hover/50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label">
                        Rua
                      </label>
                      <input
                        type="text"
                        value={profileData.address?.street || ''}
                        onChange={e => setProfileData(prev => ({
                          ...prev,
                          address: { ...prev.address, street: e.target.value }
                        }))}
                        disabled={!isEditing}
                        className="form-input disabled:bg-card-hover/50"
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Número
                      </label>
                      <input
                        type="text"
                        value={profileData.address?.number || ''}
                        onChange={e => setProfileData(prev => ({
                          ...prev,
                          address: { ...prev.address, number: e.target.value }
                        }))}
                        disabled={!isEditing}
                        className="form-input disabled:bg-card-hover/50"
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={profileData.address?.complement || ''}
                        onChange={e => setProfileData(prev => ({
                          ...prev,
                          address: { ...prev.address, complement: e.target.value }
                        }))}
                        disabled={!isEditing}
                        className="form-input disabled:bg-card-hover/50"
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={profileData.address?.neighborhood || ''}
                        onChange={e => setProfileData(prev => ({
                          ...prev,
                          address: { ...prev.address, neighborhood: e.target.value }
                        }))}
                        disabled={!isEditing}
                        className="form-input disabled:bg-card-hover/50"
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={profileData.address?.city || ''}
                        onChange={e => setProfileData(prev => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        disabled={!isEditing}
                        className="form-input disabled:bg-card-hover/50"
                      />
                    </div>
                  </div>
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

                {isEditing && (
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData(customer);
                      }}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="section-title">Produtos Favoritos</h2>
              {customer.favorites.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  Você ainda não tem produtos favoritos
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Favorite products would be displayed here */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerPortal