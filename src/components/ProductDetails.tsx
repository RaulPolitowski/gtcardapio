import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Plus, Minus, Heart } from 'lucide-react';
import { Product, Additional } from '../types';
import { getAdditionals, toggleFavorite } from '../api';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
  onAdd: (additionals?: { id: string; name: string; price: number; quantity: number; }[], notes?: string) => void;
  onLoginClick?: () => void;
}

export function ProductDetails({ product, onClose, onAdd, onLoginClick }: ProductDetailsProps) {
  const [notes, setNotes] = useState('');
  const [selectedAdditionals, setSelectedAdditionals] = useState<Record<string, number>>({});
  const { preferences } = useSystemSettings();
  const showImages = preferences.store?.showProductImages ?? true;
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(currentUser?.favorites?.includes(product.id) || false);
  const [showNotification, setShowNotification] = useState(false);

  // Update isFavorite when currentUser changes
  useEffect(() => {
    setIsFavorite(currentUser?.favorites?.includes(product.id) || false);
  }, [currentUser, product.id]);

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      onLoginClick?.();
      return;
    }
    
    try {
      const updatedUser = await toggleFavorite(currentUser.id, product.id);
      login(updatedUser); // Update current user with new favorites
      setIsFavorite(!isFavorite); // Immediately update UI
      
      // Show notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert UI state if there was an error
      setIsFavorite(currentUser.favorites.includes(product.id));
    }
  };

  const { data: additionals = [] } = useQuery({
    queryKey: ['additionals'],
    queryFn: getAdditionals,
    enabled: product.allowAdditionals
  });

  const groupedAdditionals = additionals.reduce((acc, additional) => {
    if (!product.additionalCategories?.includes(additional.category)) {
      return acc;
    }
    return {
      ...acc,
      [additional.category]: [...(acc[additional.category] || []), additional]
    };
  }, {} as Record<string, Additional[]>);

  const categoryTitles = {
    fruits: 'Frutas',
    toppings: 'Coberturas',
    syrups: 'Caldas',
    others: 'Adicionais'
  };

  const handleAddAdditional = (additional: Additional) => {
    const currentQuantity = selectedAdditionals[additional.id] || 0;
    if (!additional.maxQuantity || currentQuantity < additional.maxQuantity) {
      setSelectedAdditionals(prev => ({
        ...prev,
        [additional.id]: (prev[additional.id] || 0) + 1
      }));
    }
  };

  const handleRemoveAdditional = (additionalId: string) => {
    setSelectedAdditionals(prev => {
      const newAdditionals = { ...prev };
      const currentQuantity = newAdditionals[additionalId];
      if (currentQuantity > 1) {
        newAdditionals[additionalId] = currentQuantity - 1;
      } else {
        delete newAdditionals[additionalId];
      }
      return newAdditionals;
    });
  };

  const calculateTotal = () => {
    const additionalsCost = Object.entries(selectedAdditionals).reduce(
      (sum, [additionalId, quantity]) => {
        const additional = additionals.find(a => a.id === additionalId);
        return sum + (additional?.price || 0) * quantity;
      },
      0
    );
    return product.price + additionalsCost;
  };

  const handleAddToCart = () => {
    const selectedAdditionalsArray = Object.entries(selectedAdditionals).map(([id, quantity]) => {
      const additional = additionals.find(a => a.id === id);
      return {
        id,
        name: additional?.name || '',
        price: additional?.price || 0,
        quantity
      };
    });
    onAdd(selectedAdditionalsArray, notes.trim() || undefined);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm touch-none"
      onClick={(e) => {
        // Only close if clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchEnd={(e) => {
        // Only close if touching the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md bg-card-light rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto text-white touch-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          {showImages && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg mb-4 relative"
            />
          )}
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className={`p-2 rounded-full transition-colors duration-300 ${
                isFavorite 
                  ? 'text-red-500 hover:bg-red-500/10' 
                  : 'text-gray-400 hover:bg-white/10'
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
          <p className="text-gray-400 mb-4">{product.description}</p>
          <p className="text-menu-accent font-semibold text-xl">
            R$ {product.price.toFixed(2)}
          </p>
        </div>

        {product.allowAdditionals && Object.keys(groupedAdditionals).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Personalize seu item</h3>
            {Object.entries(groupedAdditionals).map(([category, categoryAdditionals]) => (
              <div key={category} className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  {categoryTitles[category as keyof typeof categoryTitles] || category}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {categoryAdditionals.map(additional => (
                    <div
                      key={additional.id}
                      className="bg-card-hover rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{additional.name}</p>
                        <p className="text-xs text-gray-400">
                          + R$ {additional.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemoveAdditional(additional.id)}
                          className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                          disabled={!selectedAdditionals[additional.id]}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-4 text-center text-sm">
                          {selectedAdditionals[additional.id] || 0}
                        </span>
                        <button
                          onClick={() => handleAddAdditional(additional)}
                          className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full rounded-lg bg-card-hover border-gray-700 text-white placeholder-gray-500 focus:border-menu-accent focus:ring-menu-accent/20"
            rows={3}
            placeholder="Alguma observação especial?"
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-2xl font-bold text-menu-accent">
              R$ {calculateTotal().toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            className="px-6 py-3 bg-menu-accent text-white font-semibold rounded-lg hover:bg-menu-accent/90 transition-all duration-300"
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
      
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-menu-accent text-white px-6 py-4 rounded-lg shadow-xl z-[60] animate-fade-in">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 fill-current" />
            <div>
              <p className="font-medium">Item adicionado aos favoritos!</p>
              <button 
                onClick={() => navigate('/profile')}
                className="text-sm text-white/80 hover:text-white underline mt-1"
              >
                Ver meus favoritos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}