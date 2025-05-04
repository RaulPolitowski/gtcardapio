import React from 'react';
import { Leaf, Wheat, Carrot } from 'lucide-react';

interface DietaryFilterProps {
  filters: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
  };
  onChange: (filters: { vegetarian: boolean; vegan: boolean; glutenFree: boolean }) => void;
}

export function DietaryFilter({ filters, onChange }: DietaryFilterProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onChange({ ...filters, vegetarian: !filters.vegetarian })}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
          filters.vegetarian
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Carrot className="w-4 h-4" />
        Vegetariano
      </button>
      <button
        onClick={() => onChange({ ...filters, vegan: !filters.vegan })}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
          filters.vegan
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Leaf className="w-4 h-4" />
        Vegano
      </button>
      <button
        onClick={() => onChange({ ...filters, glutenFree: !filters.glutenFree })}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
          filters.glutenFree
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Wheat className="w-4 h-4" />
        Sem Glúten
      </button>
    </div>
  );
}