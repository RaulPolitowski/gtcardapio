import { Plus } from 'lucide-react';
import { useSystemSettings } from '../hooks/useSystemSettings';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onShowDetails: () => void;
}

export function ProductCard({ product, quantity, onAdd, onRemove, onShowDetails }: ProductCardProps) {
  const { preferences } = useSystemSettings();
  const showImages = preferences.store?.showProductImages ?? true;

  return (
    <div 
      className={`bg-card-light rounded-xl border border-white/10 overflow-hidden cursor-pointer group hover:border-menu-accent/30 transition-all duration-300 relative ${
        showImages ? '' : 'flex items-center gap-4 p-4'
      }`}
      onClick={onShowDetails}
      title="Clique para ver mais detalhes"
    >
      {showImages ? (
        <>
          <div className="relative">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="p-4 text-white">
            <h3 className="font-medium mb-1 text-white/90">{product.name}</h3>
            <p className="text-sm text-white/60 mb-2 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-menu-accent">R$ {product.price.toFixed(2)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                disabled={!product.available}
                className="flex items-center gap-2 px-4 py-2 bg-menu-accent text-white rounded-lg hover:bg-menu-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar
                </span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1">
            <h3 className="font-medium text-white/90">{product.name}</h3>
            <p className="text-sm text-white/60 mt-1 line-clamp-2">{product.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="font-bold text-menu-accent">R$ {product.price.toFixed(2)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              disabled={!product.available}
              className="flex items-center gap-1 px-3 py-1.5 bg-menu-accent text-white text-sm rounded-lg hover:bg-menu-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </>
      )}
      <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Clique para detalhes
      </div>
    </div>
  );
}