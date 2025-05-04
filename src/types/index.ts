import React from 'react';

export interface Customer {
  id: string;
  name: string;
  email: string;
  cpf: string;
  photoUrl?: string;
  phone: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  isAdmin?: boolean;
  favorites: string[]; // IDs dos produtos favoritos
}

export interface SystemSettings {
  whatsApp: {
    number: string;
    messageTemplate: string;
    pickupAddress: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
    };
  };
  store: {
    subtitle: string;
    showProductImages: boolean;
    instagramUrl?: string;
    instagramUrl?: string;
    businessHours: {
      [key: string]: {
        open: string;
        close: string;
        closed?: boolean;
        closed?: boolean;
      };
    };
    specialDates: {
      date: string;
      description: string;
      open: string;
      close: string;
      closed?: boolean;
      closed?: boolean;
      description: string;
    }[];
  };
}

export interface Additional {
  id: string;
  name: string;
  price: number;
  category: 'fruits' | 'toppings' | 'syrups' | 'others';
  available: boolean;
  maxQuantity?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  available: boolean;
  preparationTime: number;
  ingredients: string[];
  allergens: string[];
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
  };
  allowAdditionals?: boolean;
  additionalCategories?: ('fruits' | 'toppings' | 'syrups' | 'others')[];
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  additionals?: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface Order {
  id: string;
  customerId?: string;
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryType: 'delivery' | 'pickup' | 'local';
  paymentMethod: 'credit' | 'debit' | 'pix' | 'cash';
  changeFor?: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
  tableNumber?: string;
  comandaNumber?: string; // Added comanda number field
  estimatedTime?: number;
  deliveryStatus?: {
    status: 'waiting' | 'assigned' | 'picked' | 'delivering' | 'delivered';
    driverName?: string;
    driverPhone?: string;
    currentLocation?: string;
    updatedAt: string;
  };
}

export type Category = 'Lanches' | 'Porções' | 'Pizzas' | 'Bebidas' | 'Combos';

export interface SystemPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
  language: 'pt-BR' | 'en-US';
  store?: {
    showProductImages: boolean;
  };
}

export interface AccessibilitySettings {
  screenReader: boolean;
  keyboardNavigation: boolean;
  animationSpeed: 'normal' | 'reduced' | 'none';
  contrastLevel: 'normal' | 'high' | 'maximum';
}