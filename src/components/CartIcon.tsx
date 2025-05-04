import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';
import { useState } from 'react';

interface CartIconProps {
  items: CartItem[];
  onClick: () => void;
}

export function CartIcon({ items, onClick }: CartIconProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative p-2 rounded-full transition-all duration-300 bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:opacity-90"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-emerald-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/75 text-white text-sm rounded-lg whitespace-nowrap backdrop-blur-sm">
          {totalItems > 0 ? 'Finalizar Pedido' : 'Seu carrinho está vazio'}
        </div>
      )}
    </div>
  );
}