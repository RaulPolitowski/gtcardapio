import React, { useState } from 'react';
import { Menu as MenuIcon, Search, User, ClipboardList, Settings, LogOut, UserCircle, Phone, Mail, MapPin, Edit, Instagram } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { BusinessHours } from './BusinessHours';
import { CartIcon } from './CartIcon';
import { Product, Category, CartItem, Customer } from '../types';
import { getProducts } from '../api';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { useEffect } from 'react';

const FEATURED_CATEGORY = 'Destaques';

interface MenuProps {
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  cart: CartItem[];
  onCartClick: () => void;
  onLoginClick?: () => void;
  currentUser?: Customer | null;
  systemSettings?: SystemSettings;
  onLogout?: () => void;
}

export function Menu({ 
  onSelectProduct, 
  onQuickAdd, 
  cart,
  onCartClick,
  onLoginClick,
  systemSettings,
  currentUser,
  onLogout
}: MenuProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showFeatured, setShowFeatured] = useState(true);
  const { preferences } = useSystemSettings();
  const showImages = preferences.store?.showProductImages ?? true;

  // Close sidebar on window resize if in desktop mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      setIsHovering(true);
      setIsSidebarOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleCategoryClick = (category: Category | null) => {
    setSelectedCategory(category);
    // Only close on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  // First, filter products based on search query
  const searchFilteredProducts = products.filter(product => 
    !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Then, group products by category
  const productsByCategory = searchFilteredProducts.reduce((groups, product) => {
    const category = product.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<Category, Product[]>);

  return (
    <div className="min-h-screen pb-20">
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-72 bg-[#1A1A1A] shadow-2xl transition-all duration-300 ease-in-out z-[101] overflow-y-auto`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className="p-6 border-b border-white/10">
            {currentUser ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {currentUser.photoUrl ? (
                      <img 
                        src={currentUser.photoUrl} 
                        alt={currentUser.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-menu-accent"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-menu-accent to-menu-400 rounded-full flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="text-lg font-medium text-white">Olá, {currentUser.name.split(' ')[0]}!</div>
                      <div className="text-xs text-gray-400">{currentUser.email}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <MenuIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm text-gray-400">
                  {currentUser.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{currentUser.phone}</span>
                    </div>
                  )}
                  {currentUser.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
                      <div>
                        {currentUser.address.street}, {currentUser.address.number}
                        {currentUser.address.complement && ` - ${currentUser.address.complement}`}
                        <br />
                        {currentUser.address.neighborhood}, {currentUser.address.city}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <Link
                    to="/profile"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center gap-2 text-menu-accent hover:text-menu-400 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Perfil
                  </Link>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsSidebarOpen(false);
                    }}
                    className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF4500] to-[#FF6B00] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">GT</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">Menu</h2>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <MenuIcon className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="mb-6">
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">Categorias</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === null 
                      ? 'bg-[#FF4500] text-white' 
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <span>Todos os Produtos</span>
                </button>
                {Object.keys(productsByCategory).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category as Category)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category 
                        ? 'bg-[#FF4500] text-white' 
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{category}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">Pedidos</h3>
              <div className="space-y-1">
                {currentUser ? (
                  <Link
                    to="/orders"
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <ClipboardList className="w-5 h-5" />
                    <span>Meus Pedidos</span>
                  </Link>
                ) : (
                  <>
                  <button
                    onClick={() => {
                      onLoginClick?.();
                      setIsSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <ClipboardList className="w-5 h-5" />
                    <span>Faça login para ver seus pedidos</span>
                  </button>
                  </>
                )}
              </div>
            </div>

            {currentUser && (
              <div className="mb-6">
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">Favoritos</h3>
                <div className="space-y-1">
                  {currentUser.favorites.length > 0 ? (
                    products
                      .filter(p => currentUser.favorites.includes(p.id))
                      .map(product => (
                        <button
                          key={product.id}
                          onClick={() => {
                            onSelectProduct(product);
                            setIsSidebarOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          <span>{product.name}</span>
                        </button>
                      ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      Nenhum produto favorito
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentUser?.isAdmin && (
              <div className="mb-6">
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">Administração</h3>
                <div className="space-y-1">
                  <Link
                    to="/admin"
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Painel Admin</span>
                  </Link>
                </div>
              </div>
            )}
          </nav>

          {/* Login Button for Non-Authenticated Users */}
          {!currentUser && (
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => {
                  onLoginClick?.();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-menu-accent hover:bg-menu-accent/10 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Entrar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Header with Logo and Store Info */}
      <header className="bg-[#1A1A1A] text-white p-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  onMouseEnter={handleMouseEnter}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <MenuIcon className="w-6 h-6 text-white" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400 mb-1">German Tech Sistemas</span>
                    <h1 className="text-3xl sm:text-4xl font-bold font-title bg-gradient-to-r from-[#FF4500] via-[#FF6B00] to-[#FF8C00] bg-clip-text text-transparent animate-gradient">
                      Cardápio Digital
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Sabor e tecnologia em cada pedido</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <BusinessHours />
                {systemSettings?.store?.instagramUrl && (
                  <a
                    href={systemSettings.store.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full transition-all duration-300 bg-gradient-to-br from-[#405DE6] via-[#C13584] to-[#F77737] text-white hover:opacity-90"
                    title="Siga-nos no Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                <CartIcon items={cart} onClick={onCartClick} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-3 relative z-10">
        <div className="search-bar flex items-center">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar produto..."
            className="flex-1"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-0 z-20 bg-[#1A1A1A] shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`category-button ${
                  selectedCategory === null ? 'active' : ''
                }`}
              >
                <span className="font-medium whitespace-nowrap">Todos</span>
              </button>
              <button
                onClick={() => setSelectedCategory('Destaques')}
                className={`category-button ${
                  selectedCategory === 'Destaques' ? 'active' : ''
                }`}
              >
                <span className="font-medium whitespace-nowrap">★ Destaques</span>
              </button>
              {Object.keys(productsByCategory).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as Category)}
                  className={`category-button ${
                    selectedCategory === category ? 'active' : ''
                  }`}
                >
                  <span className="font-medium whitespace-nowrap">{category}</span>
                </button>
              ))}
           </div>
         </div>
       </div>

      {/* Products */}
      <div className="px-4 py-6 pb-24">
        <div className="space-y-6" id="products-container">
          {/* Featured Products */}
          {(selectedCategory === 'Destaques' || !selectedCategory) && searchFilteredProducts.some(p => p.featured) && (
            <div className="space-y-4 scroll-mt-20">
              <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
                <span className="text-menu-accent">★</span> {FEATURED_CATEGORY}
              </h2>
              <div className="space-y-4">
                {searchFilteredProducts
                  .filter(product => product.featured)
                  .map(product => (
                    <div
                      key={product.id}
                      className={`product-card hover:bg-card-hover relative ${
                        showImages ? 'flex items-center p-4' : 'flex items-center justify-between p-4'
                      }`}
                      onClick={() => onSelectProduct(product)}
                    >
                      {showImages && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-28 h-28 rounded-xl object-cover"
                        />
                      )}
                      <div className={`flex-1 ${showImages ? 'ml-4' : ''}`}>
                        <h3 className="font-bold text-white">{product.name}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-bold text-menu-accent">
                            R$ {product.price.toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickAdd(product);
                            }}
                            className="add-button hover:bg-menu-400"
                          >
                            Adicionar
                          </button>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 text-menu-accent text-sm font-medium bg-menu-accent/10 px-2 py-1 rounded-full">
                        ★ Destaque
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {Object.entries(productsByCategory)
            // Filter categories if one is selected
            .filter(([category]) => {
              if (selectedCategory === 'Destaques') return false;
              return !selectedCategory || category === selectedCategory;
            })
            .map(([category, products]) => (
            <div
              key={category}
              className="space-y-4 scroll-mt-20"
              id={`category-${category.toLowerCase()}`}
            >
              <h2 className="text-xl font-bold text-white/90">{category}</h2>
              <div className="space-y-4">
                {products.map(product => (
                  <div
                    key={product.id}
                    className={`product-card hover:bg-card-hover ${
                      showImages ? 'flex items-center p-4' : 'flex items-center justify-between p-4'
                    }`}
                    onClick={() => onSelectProduct(product)}
                  >
                    {showImages && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-28 h-28 rounded-xl object-cover"
                      />
                    )}
                    <div className={`flex-1 ${showImages ? 'ml-4' : ''}`}>
                      <h3 className="font-bold text-white">{product.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-menu-accent">
                          R$ {product.price.toFixed(2)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickAdd(product);
                          }}
                          className="add-button hover:bg-menu-400"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!Object.keys(productsByCategory).length && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <Search className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-400">
                Tente buscar com outros termos ou selecione outra categoria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Menu;