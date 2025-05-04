import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';

interface CartPreviewProps {
  items: CartItem[];
  onClick: () => void;
}

export function CartPreview({ items, onClick }: CartPreviewProps) {
  const total = items.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity;
    const additionalsTotal = (item.additionals?.reduce(
      (sum, add) => sum + (add.price * add.quantity),
      0
    ) || 0) * item.quantity;
    return sum + itemTotal + additionalsTotal;
  }, 0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        className="bg-[#25D366] text-white px-6 py-4 rounded-xl shadow-xl hover:bg-[#128C7E] transition-all duration-300 flex items-center gap-4"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-white text-menu-accent text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        </div>
        <div className="text-left border-l border-white/20 pl-4">
          <div className="text-sm font-medium mb-0.5">Finalizar Pedido</div>
          <div className="text-lg font-bold">R$ {total.toFixed(2)}</div>
        </div>
      </button>
    </div>
  );
}