import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  category: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function ProductCarousel({ category, products, onSelectProduct, onQuickAdd }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Configuração de rolagem suave
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.offsetWidth;
      const scrollAmount = direction === 'left' ? -containerWidth * 0.8 : containerWidth * 0.8;
      
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Manipulador de rolagem por toque
  const handleTouchScroll = (e: React.TouchEvent) => {
    if (scrollRef.current) {
      const touch = e.touches[0];
      const startX = touch.clientX;
      let lastX = startX;
      
      const handleTouchMove = (e: TouchEvent) => {
        const currentX = e.touches[0].clientX;
        const diff = lastX - currentX;
        scrollRef.current?.scrollBy({ left: diff, behavior: 'auto' });
        lastX = currentX;
      };
      
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white/90 font-display">{category}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-[#FF3D00]/10 hover:bg-[#FF3D00]/20 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-[#FF3D00]/10 hover:bg-[#FF3D00]/20 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="relative group">
        {/* Indicadores de rolagem */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#121212] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#121212] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide scroll-smooth overscroll-x-contain touch-pan-x"
          onTouchStart={handleTouchScroll}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {products.map(product => (
            <div key={product.id} className="flex-none w-[300px]">
              <ProductCard
                product={product}
                quantity={0}
                onAdd={() => product.allowAdditionals ? onSelectProduct(product) : onQuickAdd(product)}
                onRemove={() => {}}
                onShowDetails={() => onSelectProduct(product)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}