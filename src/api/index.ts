import axios from 'axios';
import { Product, Order, Additional, Customer } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

const sampleAdditionals: Additional[] = [
  {
    id: '1',
    name: 'Bacon Extra',
    price: 4.00,
    category: 'others',
    available: true,
    maxQuantity: 2
  },
  {
    id: '2',
    name: 'Queijo Extra',
    price: 3.00,
    category: 'others',
    available: true,
    maxQuantity: 2
  },
  {
    id: '3',
    name: 'Ovo',
    price: 2.50,
    category: 'others',
    available: true,
    maxQuantity: 2
  },
  {
    id: '4',
    name: 'Catupiry',
    price: 4.00,
    category: 'others',
    available: true,
    maxQuantity: 2
  },
  {
    id: '5',
    name: 'Cheddar',
    price: 4.00,
    category: 'others',
    available: true,
    maxQuantity: 2
  },
  {
    id: '6',
    name: 'Calabresa Extra',
    price: 4.00,
    category: 'others',
    available: true,
    maxQuantity: 2
  },
  {
    id: '7',
    name: 'Molho Extra',
    price: 1.50,
    category: 'others',
    available: true,
    maxQuantity: 2
  },
  {
    id: '8',
    name: 'Batata Extra',
    price: 8.00,
    category: 'others',
    available: true,
    maxQuantity: 2
  }
];

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'X-Burger',
    description: 'Hambúrguer artesanal, queijo, alface, tomate e maionese da casa',
    price: 22.90,
    category: 'Lanches',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    available: true,
    preparationTime: 15,
    ingredients: ['Pão', 'Hambúrguer', 'Queijo', 'Alface', 'Tomate', 'Maionese'],
    allergens: [],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false
    },
    allowAdditionals: true,
    additionalCategories: ['others'],
    featured: true
  },
  {
    id: '2',
    name: 'X-Bacon',
    description: 'Hambúrguer artesanal, bacon crocante, queijo, alface, tomate e maionese da casa',
    price: 26.90,
    category: 'Lanches',
    imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800',
    available: true,
    preparationTime: 15,
    ingredients: ['Pão', 'Hambúrguer', 'Bacon', 'Queijo', 'Alface', 'Tomate', 'Maionese'],
    allergens: [],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false
    },
    allowAdditionals: true,
    additionalCategories: ['others']
  },
  {
    id: '3',
    name: 'Batata Frita Grande',
    description: 'Porção de batatas fritas crocantes com sal e orégano',
    price: 24.90,
    category: 'Porções',
    imageUrl: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800',
    available: true,
    preparationTime: 20,
    ingredients: ['Batata', 'Sal', 'Orégano'],
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true
    },
    allowAdditionals: true,
    additionalCategories: ['others']
  },
  {
    id: '4',
    name: 'Isca de Frango',
    description: 'Porção de iscas de frango empanadas e crocantes',
    price: 32.90,
    category: 'Porções',
    imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800',
    available: true,
    preparationTime: 25,
    ingredients: ['Frango', 'Farinha', 'Temperos'],
    allergens: ['Glúten'],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false
    },
    allowAdditionals: true,
    additionalCategories: ['others']
  },
  {
    id: '5',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mussarela, tomate e manjericão fresco',
    price: 45.90,
    category: 'Pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800',
    available: true,
    preparationTime: 30,
    ingredients: ['Massa', 'Molho de Tomate', 'Mussarela', 'Tomate', 'Manjericão'],
    allergens: ['Leite'],
    dietary: {
      vegetarian: true,
      vegan: false,
      glutenFree: false
    },
    allowAdditionals: true,
    additionalCategories: ['others'],
    featured: true
  },
  {
    id: '6',
    name: 'Pizza Calabresa',
    description: 'Molho de tomate, mussarela, calabresa e cebola',
    price: 48.90,
    category: 'Pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    available: true,
    preparationTime: 30,
    ingredients: ['Massa', 'Molho de Tomate', 'Mussarela', 'Calabresa', 'Cebola'],
    allergens: ['Leite'],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false
    },
    allowAdditionals: true,
    additionalCategories: ['others']
  },
  {
    id: '7',
    name: 'Combo Família',
    description: 'Pizza grande, porção de batata grande e 2 refrigerantes 2L',
    price: 89.90,
    category: 'Combos',
    imageUrl: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=800',
    available: true,
    preparationTime: 40,
    ingredients: ['Pizza', 'Batata Frita', 'Refrigerante'],
    allergens: ['Leite'],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false
    },
    allowAdditionals: false
  },
  {
    id: '8',
    name: 'Combo Duplo',
    description: '2 lanches, 1 porção de batata média e 2 refrigerantes 350ml',
    price: 64.90,
    category: 'Combos',
    imageUrl: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?w=800',
    available: true,
    preparationTime: 25,
    ingredients: ['Hambúrguer', 'Batata Frita', 'Refrigerante'],
    allergens: ['Glúten'],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false
    },
    allowAdditionals: false
  },
  {
    id: '9',
    name: 'Refrigerante 350ml',
    description: 'Coca-Cola, Guaraná ou Sprite',
    price: 6.90,
    category: 'Bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800',
    available: true,
    preparationTime: 1,
    ingredients: ['Refrigerante'],
    allergens: [],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: true
    },
    allowAdditionals: false
  },
  {
    id: '10',
    name: 'Refrigerante 2L',
    description: 'Coca-Cola, Guaraná ou Sprite',
    price: 12.90,
    category: 'Bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800',
    available: true,
    preparationTime: 1,
    ingredients: ['Refrigerante'],
    allergens: [],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: true
    },
    allowAdditionals: false
  }
];

// Sample orders data
let sampleOrders: Order[] = [
  {
    id: '1',
    items: [
      {
        product: sampleProducts[0], // X-Burger
        quantity: 2,
        additionals: [
          { id: '1', name: 'Bacon Extra', price: 4.00, quantity: 1 },
          { id: '2', name: 'Queijo Extra', price: 3.00, quantity: 1 }
        ]
      }
    ],
    total: 53.70,
    customerName: 'Mesa 5',
    customerPhone: '',
    deliveryType: 'local',
    paymentMethod: 'credit',
    status: 'pending',
    createdAt: new Date().toISOString(),
    comandaNumber: '1',
    tableNumber: '5',
    estimatedTime: 15
  },
  {
    id: '2',
    items: [
      {
        product: sampleProducts[1], // X-Bacon
        quantity: 1,
        additionals: [
          { id: '2', name: 'Queijo Extra', price: 3.00, quantity: 2 }
        ]
      }
    ],
    total: 32.90,
    customerName: 'João Silva',
    customerPhone: '(45) 99999-1111',
    deliveryType: 'delivery',
    paymentMethod: 'pix',
    status: 'delivering',
    createdAt: new Date().toISOString(),
    estimatedTime: 20,
    address: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 101',
      neighborhood: 'Centro',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85801-000'
    }
  },
  {
    id: '3',
    items: [
      {
        product: sampleProducts[4], // Pizza Margherita
        quantity: 2,
        additionals: [
          { id: '4', name: 'Catupiry', price: 4.00, quantity: 1 }
        ]
      }
    ],
    total: 99.80,
    customerName: 'Maria Santos',
    customerPhone: '(45) 99999-2222',
    deliveryType: 'delivery',
    paymentMethod: 'credit',
    status: 'completed',
    createdAt: new Date().toISOString(),
    estimatedTime: 30,
    address: {
      street: 'Avenida Brasil',
      number: '456',
      neighborhood: 'São Cristóvão',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85802-000'
    }
  },
  {
    id: '4',
    items: [
      {
        product: sampleProducts[2], // Batata Frita Grande
        quantity: 2
      },
      {
        product: sampleProducts[3], // Isca de Frango
        quantity: 1
      }
    ],
    total: 82.70,
    customerName: 'Mesa 3',
    customerPhone: '',
    deliveryType: 'local',
    paymentMethod: 'debit',
    status: 'preparing',
    createdAt: new Date().toISOString(),
    comandaNumber: '2',
    tableNumber: '3',
    estimatedTime: 25
  },
  {
    id: '5',
    items: [
      {
        product: sampleProducts[7], // Combo Duplo
        quantity: 1
      }
    ],
    total: 64.90,
    customerName: 'Pedro Oliveira',
    customerPhone: '(45) 99999-3333',
    deliveryType: 'pickup',
    paymentMethod: 'cash',
    status: 'ready',
    createdAt: new Date().toISOString(),
    estimatedTime: 25
  },
  {
    id: '6',
    items: [
      {
        product: sampleProducts[5], // Pizza Calabresa
        quantity: 1,
        additionals: [
          { id: '4', name: 'Catupiry', price: 4.00, quantity: 1 },
          { id: '5', name: 'Cheddar', price: 4.00, quantity: 1 }
        ]
      }
    ],
    total: 56.90,
    customerName: 'Ana Costa',
    customerPhone: '(45) 99999-4444',
    deliveryType: 'delivery',
    paymentMethod: 'credit',
    status: 'delivering',
    createdAt: new Date().toISOString(),
    estimatedTime: 30,
    address: {
      street: 'Rua Paraná',
      number: '789',
      neighborhood: 'Country',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85803-000'
    }
  },
  {
    id: '7',
    items: [
      {
        product: sampleProducts[6], // Combo Família
        quantity: 1
      }
    ],
    total: 89.90,
    customerName: 'Lucas Ferreira',
    customerPhone: '(45) 99999-5555',
    deliveryType: 'pickup',
    paymentMethod: 'pix',
    status: 'completed',
    createdAt: new Date().toISOString(),
    estimatedTime: 40
  },
  {
    id: '8',
    items: [
      {
        product: sampleProducts[0], // X-Burger
        quantity: 3,
        additionals: [
          { id: '1', name: 'Bacon Extra', price: 4.00, quantity: 1 }
        ]
      }
    ],
    total: 80.70,
    customerName: 'Mesa 7',
    customerPhone: '',
    deliveryType: 'local',
    paymentMethod: 'credit',
    status: 'pending',
    createdAt: new Date().toISOString(),
    comandaNumber: '3',
    tableNumber: '7',
    estimatedTime: 15
  },
  {
    id: '9',
    items: [
      {
        product: sampleProducts[4], // Pizza Margherita
        quantity: 1
      },
      {
        product: sampleProducts[5], // Pizza Calabresa
        quantity: 1
      }
    ],
    total: 94.80,
    customerName: 'Mariana Lima',
    customerPhone: '(45) 99999-6666',
    deliveryType: 'delivery',
    paymentMethod: 'credit',
    status: 'preparing',
    createdAt: new Date().toISOString(),
    estimatedTime: 30,
    address: {
      street: 'Rua São Paulo',
      number: '321',
      neighborhood: 'Centro',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85804-000'
    }
  },
  {
    id: '10',
    items: [
      {
        product: sampleProducts[2], // Batata Frita Grande
        quantity: 2
      }
    ],
    total: 49.80,
    customerName: 'Mesa 2',
    customerPhone: '',
    deliveryType: 'local',
    paymentMethod: 'debit',
    status: 'preparing',
    createdAt: new Date().toISOString(),
    comandaNumber: '4',
    tableNumber: '2',
    estimatedTime: 20
  },
  {
    id: '11',
    items: [
      {
        product: sampleProducts[1], // X-Bacon
        quantity: 2,
        additionals: [
          { id: '2', name: 'Queijo Extra', price: 3.00, quantity: 1 }
        ]
      }
    ],
    total: 56.80,
    customerName: 'Carlos Santos',
    customerPhone: '(45) 99999-7777',
    deliveryType: 'delivery',
    paymentMethod: 'pix',
    status: 'completed',
    createdAt: new Date().toISOString(),
    estimatedTime: 15,
    address: {
      street: 'Rua Rio de Janeiro',
      number: '147',
      neighborhood: 'Alto Alegre',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85805-000'
    }
  },
  {
    id: '12',
    items: [
      {
        product: sampleProducts[7], // Combo Duplo
        quantity: 1
      }
    ],
    total: 64.90,
    customerName: 'Fernanda Costa',
    customerPhone: '(45) 99999-8888',
    deliveryType: 'pickup',
    paymentMethod: 'credit',
    status: 'ready',
    createdAt: new Date().toISOString(),
    estimatedTime: 25
  },
  {
    id: '13',
    items: [
      {
        product: sampleProducts[3], // Isca de Frango
        quantity: 2
      }
    ],
    total: 65.80,
    customerName: 'Mesa 4',
    customerPhone: '',
    deliveryType: 'local',
    paymentMethod: 'credit',
    status: 'pending',
    createdAt: new Date().toISOString(),
    comandaNumber: '5',
    tableNumber: '4',
    estimatedTime: 25
  },
  {
    id: '14',
    items: [
      {
        product: sampleProducts[6], // Combo Família
        quantity: 1
      }
    ],
    total: 89.90,
    customerName: 'Roberto Silva',
    customerPhone: '(45) 99999-9999',
    deliveryType: 'delivery',
    paymentMethod: 'credit',
    status: 'delivering',
    createdAt: new Date().toISOString(),
    estimatedTime: 40,
    address: {
      street: 'Rua Minas Gerais',
      number: '258',
      neighborhood: 'Cancelli',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85806-000'
    }
  },
  {
    id: '15',
    items: [
      {
        product: sampleProducts[5], // Pizza Calabresa
        quantity: 1,
        additionals: [
          { id: '4', name: 'Catupiry', price: 4.00, quantity: 1 }
        ]
      }
    ],
    total: 52.90,
    customerName: 'Amanda Oliveira',
    customerPhone: '(45) 99999-0000',
    deliveryType: 'pickup',
    paymentMethod: 'pix',
    status: 'completed',
    createdAt: new Date().toISOString(),
    estimatedTime: 30
  },
  {
    id: '16',
    items: [
      {
        product: sampleProducts[0], // X-Burger
        quantity: 1
      },
      {
        product: sampleProducts[2], // Batata Frita Grande
        quantity: 1
      }
    ],
    total: 47.80,
    customerName: 'Mesa 6',
    customerPhone: '',
    deliveryType: 'local',
    paymentMethod: 'debit',
    status: 'preparing',
    createdAt: new Date().toISOString(),
    comandaNumber: '6',
    tableNumber: '6',
    estimatedTime: 20
  },
  {
    id: '17',
    items: [
      {
        product: sampleProducts[4], // Pizza Margherita
        quantity: 2
      }
    ],
    total: 91.80,
    customerName: 'Beatriz Lima',
    customerPhone: '(45) 99998-1111',
    deliveryType: 'delivery',
    paymentMethod: 'credit',
    status: 'completed',
    createdAt: new Date().toISOString(),
    estimatedTime: 30,
    address: {
      street: 'Rua Santa Catarina',
      number: '369',
      complement: 'Bloco B, Apto 202',
      neighborhood: 'Maria Luiza',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85807-000'
    }
  },
  {
    id: '18',
    items: [
      {
        product: sampleProducts[1], // X-Bacon
        quantity: 2
      }
    ],
    total: 53.80,
    customerName: 'Ricardo Santos',
    customerPhone: '(45) 99998-2222',
    deliveryType: 'pickup',
    paymentMethod: 'cash',
    status: 'ready',
    createdAt: new Date().toISOString(),
    estimatedTime: 15
  },
  {
    id: '19',
    items: [
      {
        product: sampleProducts[3], // Isca de Frango
        quantity: 1
      },
      {
        product: sampleProducts[2], // Batata Frita Grande
        quantity: 1
      }
    ],
    total: 57.80,
    customerName: 'Camila Oliveira',
    customerPhone: '(45) 99998-3333',
    deliveryType: 'delivery',
    paymentMethod: 'credit',
    status: 'delivering',
    createdAt: new Date().toISOString(),
    estimatedTime: 25,
    address: {
      street: 'Rua Pernambuco',
      number: '753',
      neighborhood: 'Coqueiral',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85808-000'
    }
  },
  {
    id: '20',
    items: [
      {
        product: sampleProducts[7], // Combo Duplo
        quantity: 1
      }
    ],
    total: 64.90,
    customerName: 'Diego Ferreira',
    customerPhone: '(45) 99998-4444',
    deliveryType: 'pickup',
    paymentMethod: 'pix',
    status: 'completed',
    createdAt: new Date().toISOString(),
    estimatedTime: 25
  }
];

// Sample customers data
export const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(45) 99999-1111',
    cpf: '123.456.789-00',
    address: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 101',
      neighborhood: 'Centro',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85801-000'
    },
    favorites: []
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(45) 99999-2222',
    cpf: '987.654.321-00',
    address: {
      street: 'Avenida Brasil',
      number: '456',
      neighborhood: 'São Cristóvão',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85802-000'
    },
    favorites: []
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@email.com',
    phone: '(45) 99999-3333',
    cpf: '456.789.123-00',
    address: {
      street: 'Rua Paraná',
      number: '789',
      complement: 'Casa',
      neighborhood: 'Country',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85803-000'
    },
    favorites: []
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@email.com',
    phone: '(45) 99999-4444',
    cpf: '789.123.456-00',
    favorites: []
  },
  {
    id: '5',
    name: 'Lucas Ferreira',
    email: 'lucas@email.com',
    phone: '(45) 99999-5555',
    cpf: '321.654.987-00',
    address: {
      street: 'Rua São Paulo',
      number: '321',
      neighborhood: 'Centro',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85804-000'
    },
    favorites: []
  },
  {
    id: '6',
    name: 'Mariana Lima',
    email: 'mariana@email.com',
    phone: '(45) 99999-6666',
    cpf: '654.987.321-00',
    favorites: []
  },
  {
    id: '7',
    name: 'Carlos Santos',
    email: 'carlos@email.com',
    phone: '(45) 99999-7777',
    cpf: '147.258.369-00',
    address: {
      street: 'Rua Rio de Janeiro',
      number: '147',
      neighborhood: 'Alto Alegre',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85805-000'
    },
    favorites: []
  },
  {
    id: '8',
    name: 'Fernanda Costa',
    email: 'fernanda@email.com',
    phone: '(45) 99999-8888',
    cpf: '258.369.147-00',
    favorites: []
  },
  {
    id: '9',
    name: 'Roberto Silva',
    email: 'roberto@email.com',
    phone: '(45) 99999-9999',
    cpf: '369.147.258-00',
    address: {
      street: 'Rua Minas Gerais',
      number: '258',
      neighborhood: 'Cancelli',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85806-000'
    },
    favorites: []
  },
  {
    id: '10',
    name: 'Amanda Oliveira',
    email: 'amanda@email.com',
    phone: '(45) 99999-0000',
    cpf: '741.852.963-00',
    favorites: []
  },
  {
    id: '11',
    name: 'Beatriz Lima',
    email: 'beatriz@email.com',
    phone: '(45) 99998-1111',
    cpf: '852.963.741-00',
    address: {
      street: 'Rua Santa Catarina',
      number: '369',
      complement: 'Bloco B, Apto 202',
      neighborhood: 'Maria Luiza',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85807-000'
    },
    favorites: []
  },
  {
    id: '12',
    name: 'Ricardo Santos',
    email: 'ricardo@email.com',
    phone: '(45) 99998-2222',
    cpf: '963.741.852-00',
    favorites: []
  },
  {
    id: '13',
    name: 'Camila Oliveira',
    email: 'camila@email.com',
    phone: '(45) 99998-3333',
    cpf: '159.357.456-00',
    address: {
      street: 'Rua Pernambuco',
      number: '753',
      neighborhood: 'Coqueiral',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85808-000'
    },
    favorites: []
  },
  {
    id: '14',
    name: 'Diego Ferreira',
    email: 'diego@email.com',
    phone: '(45) 99998-4444',
    cpf: '357.159.753-00',
    favorites: []
  },
  {
    id: '15',
    name: 'Juliana Costa',
    email: 'juliana@email.com',
    phone: '(45) 99998-5555',
    cpf: '753.159.357-00',
    address: {
      street: 'Rua Bahia',
      number: '951',
      complement: 'Casa 2',
      neighborhood: 'Parque São Paulo',
      city: 'Cascavel',
      state: 'PR',
      zipCode: '85809-000'
    },
    favorites: []
  }
];

// Generate additional orders to reach 32 total
const generateAdditionalOrders = () => {
  const additionalOrders: Order[] = [];
  const startId = 21; // Start from 21 since we already have 20 orders
  
  for (let i = startId; i <= 32; i++) {
    // Generate random date within last 24 hours
    const date = new Date();
    date.setHours(date.getHours() - Math.random() * 24);
    
    // Random product selection (1-3 items)
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = Array(numItems).fill(null).map(() => {
      const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const hasAdditionals = product.allowAdditionals && Math.random() > 0.5;
      
      return {
        product,
        quantity,
        additionals: hasAdditionals ? [
          {
            id: sampleAdditionals[Math.floor(Math.random() * sampleAdditionals.length)].id,
            name: 'Bacon Extra',
            price: 4.00,
            quantity: 1
          }
        ] : undefined
      };
    });
    
    // Calculate total
    const total = items.reduce((sum, item) => {
      const itemTotal = item.product.price * item.quantity;
      const additionalsTotal = (item.additionals?.reduce(
        (sum, add) => sum + (add.price * add.quantity),
        0
      ) || 0) * item.quantity;
      return sum + itemTotal + additionalsTotal;
    }, 0);

    const order: Order = {
      id: i.toString(),
      items,
      total,
      customerName: `Cliente ${i}`,
      customerPhone: `(45) 99999-${(1000 + i).toString()}`,
      deliveryType: Math.random() > 0.5 ? 'delivery' : 'pickup',
      paymentMethod: ['credit', 'debit', 'pix', 'cash'][Math.floor(Math.random() * 4)] as Order['paymentMethod'],
      status: ['pending', 'preparing', 'ready', 'delivering', 'completed'][Math.floor(Math.random() * 5)] as Order['status'],
      createdAt: date.toISOString(),
      estimatedTime: 20 + Math.floor(Math.random() * 20),
      address: Math.random() > 0.5 ? {
        street: 'Rua Exemplo',
        number: (100 + i).toString(),
        neighborhood: 'Centro',
        city: 'Cascavel',
        state: 'PR',
        zipCode: '85800-000'
      } : undefined
    };
    additionalOrders.push(order);
  }
  return additionalOrders;
};

// Add additional orders to reach 32 total
sampleOrders = [...sampleOrders, ...generateAdditionalOrders()];

// Products
export const getProducts = async (): Promise<Product[]> => {
  return Promise.resolve(sampleProducts);
};

// Additionals
export const getAdditionals = async (): Promise<Additional[]> => {
  return Promise.resolve(sampleAdditionals);
};

// Customer Authentication
export const loginCustomer = async (email: string, password: string): Promise<Customer> => {
  const customer = sampleCustomers.find(c => c.email === email);
  if (!customer) {
    throw new Error('Cliente não encontrado');
  }
  return customer;
};

export const registerCustomer = async (customerData: Omit<Customer, 'id' | 'favorites'>): Promise<Customer> => {
  const newCustomer: Customer = {
    id: Math.random().toString(36).substr(2, 9),
    favorites: [],
    ...customerData
  };
  sampleCustomers.push(newCustomer);
  return newCustomer;
};

export const updateCustomerProfile = async (customerId: string, data: Partial<Customer>): Promise<Customer> => {
  const customerIndex = sampleCustomers.findIndex(c => c.id === customerId);
  if (customerIndex === -1) {
    throw new Error('Erro ao atualizar perfil: Cliente não encontrado');
  }

  // Validate photo URL if provided
  if (data.photoUrl) {
    try {
      new URL(data.photoUrl);
    } catch (e) {
      if (!data.photoUrl.startsWith('data:image/')) {
        throw new Error('Erro ao atualizar perfil: URL da foto inválida');
      }
    }
  }

  sampleCustomers[customerIndex] = {
    ...sampleCustomers[customerIndex],
    ...data
  };

  return sampleCustomers[customerIndex];
};

export const toggleFavorite = async (customerId: string, productId: string): Promise<Customer> => {
  const customerIndex = sampleCustomers.findIndex(c => c.id === customerId);
  if (customerIndex === -1) {
    throw new Error('Usuário não encontrado');
  }

  const customer = sampleCustomers[customerIndex];
  if (!Array.isArray(customer.favorites)) {
    customer.favorites = [];
  }
  
  const index = customer.favorites.indexOf(productId);
  if (index === -1) {
    customer.favorites.push(productId);
  } else {
    customer.favorites.splice(index, 1);
  }

  try {
    localStorage.setItem('currentUser', JSON.stringify(customer));
  } catch (error) {
    console.error('Error updating favorites:', error);
    throw new Error('Erro ao atualizar favoritos');
  }

  return customer;
};

export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
  return sampleOrders.filter(order => order.customerId === customerId);
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const newProduct = {
    id: Math.random().toString(36).substr(2, 9),
    ...product
  };
  sampleProducts.push(newProduct);
  return newProduct;
};

export const updateProduct = async (id: string, product: Omit<Product, 'id'>): Promise<Product> => {
  const index = sampleProducts.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Produto não encontrado');
  }
  sampleProducts[index] = { id, ...product };
  return sampleProducts[index];
};

export const deleteProduct = async (id: string): Promise<void> => {
  const index = sampleProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    sampleProducts.splice(index, 1);
  }
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  return Promise.resolve(sampleOrders);
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> => {
  const newOrder: Order = {
    id: Math.random().toString(36).substr(2, 9),
    ...orderData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    estimatedTime: orderData.items.reduce(
      (total, item) => total + (item.product.preparationTime * item.quantity),
      0
    )
  };
  
  sampleOrders.push(newOrder);
  return newOrder;
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  const orderIndex = sampleOrders.findIndex(order => order.id === orderId);
  if (orderIndex === -1) {
    throw new Error('Pedido não encontrado');
  }

  sampleOrders[orderIndex] = {
    ...sampleOrders[orderIndex],
    status
  };

  return sampleOrders[orderIndex];
};

export const getTableOrders = async (comandaNumber: string): Promise<Order[]> => {
  return sampleOrders.filter(order => 
    order.deliveryType === 'local' && 
    order.comandaNumber === comandaNumber &&
    order.status !== 'completed'
  );
};

export { sampleOrders, sampleProducts, sampleAdditionals };