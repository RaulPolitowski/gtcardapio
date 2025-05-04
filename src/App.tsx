import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { lazy, Suspense } from 'react';
import CustomerPortal from './pages/CustomerPortal';
import Menu from './components/Menu';
import { Cart } from './components/Cart';
import { CartPreview } from './components/CartPreview';
import { ProductDetails } from './components/ProductDetails';
import { LoginModal } from './components/LoginModal';
import Admin from './pages/Admin';
import { useCart } from './hooks/useCart';
import { useAuth } from './hooks/useAuth';
import { Product } from './types';
import { useSystemSettings } from './hooks/useSystemSettings';
import { CheckCircle2 } from 'lucide-react';

// Lazy load MyOrders component
const MyOrders = lazy(() => import('./pages/MyOrders'));

// QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  }
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  const { cart, addToCart, quickAdd, removeFromCart, updateQuantity, clearCart } = useCart();
  const { currentUser, login, logout } = useAuth();
  const { preferences, systemSettings } = useSystemSettings();
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  const handleRepeatOrder = (items: typeof cart) => {
    clearCart(); // Clear current cart first
    items.forEach(item => {
      addToCart(item.product, item.additionals, item.notes);
    });
    setShowCart(true); // Show cart
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (additionals?: { id: string; name: string; price: number; quantity: number; }[], notes?: string) => {
    if (selectedProduct) {
      addToCart(selectedProduct, additionals, notes);
      setSelectedProduct(null);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Routes>
              <Route 
                path="/admin" 
                element={currentUser?.isAdmin ? <Admin /> : <Navigate to="/" replace />} 
              />
              <Route 
                path="/orders" 
                element={
                  currentUser ? (
                    <Suspense fallback={
                      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-menu-accent/30 border-t-menu-accent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-gray-400">Carregando pedidos...</p>
                        </div>
                      </div>
                    }>
                      <MyOrders onRepeatOrder={handleRepeatOrder} />
                    </Suspense>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route path="/profile" element={currentUser ? <CustomerPortal customer={currentUser} onLogout={logout} /> : <Navigate to="/" />} />
              <Route
                path="/"
                element={
                  <>
                    <Menu 
                      cart={cart}
                      onCartClick={() => setShowCart(true)}
                      onSelectProduct={(product) => setSelectedProduct(product)}
                      onQuickAdd={quickAdd}
                      currentUser={currentUser}
                      onLoginClick={() => setShowLogin(true)}
                      onLogout={logout}
                      systemSettings={systemSettings}
                    />

                    {showCart && (
                      <Cart
                        items={cart}
                        onClose={() => setShowCart(false)}
                        onRemove={removeFromCart}
                        onUpdateQuantity={updateQuantity}
                        onCheckout={() => {
                          clearCart();
                          setShowCart(false);
                        }}
                        currentUser={currentUser}
                      />
                    )}

                    {selectedProduct && (
                      <ProductDetails
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                        onAdd={handleAddToCart}
                        onLoginClick={() => setShowLogin(true)}
                        onLoginClick={() => setShowLogin(true)}
                      />
                    )}

                    {showLogin && (
                      <LoginModal
                        onClose={() => setShowLogin(false)}
                        onLogin={(user) => {
                          login(user);
                          setShowLoginSuccess(true);
                          setShowLogin(false);
                          setTimeout(() => setShowLoginSuccess(false), 3000);
                        }}
                      />
                    )}

                    {/* Login Success Toast */}
                    {showLoginSuccess && (
                      <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl z-[60] animate-fade-in flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Login realizado com sucesso!</p>
                          <p className="text-sm text-white/80">Bem-vindo de volta</p>
                        </div>
                      </div>
                    )}

                    {!showCart && cart.length > 0 && (
                      <CartPreview
                        items={cart}
                        onClick={() => setShowCart(true)}
                      />
                    )}
                  </>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;