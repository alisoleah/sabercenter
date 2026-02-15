import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { HeroSlider } from '../components/HeroSlider';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CartModal } from '../components/CartModal';
import { CountdownTimer } from '../components/CountdownTimer';
import { CreditLimitChecker } from '../components/CreditLimitChecker';
import { CheckoutFlow } from '../components/CheckoutFlow';
import { BudgetFilter } from '../components/BudgetFilter';
import { ProductComparison } from '../components/ProductComparison';
import { LoginModal } from '../components/LoginModal';
import { mockProducts } from '../data/mockData';
import { Product, CartItem } from '../types';
import { calculateInstallment } from '../utils/installmentCalculator';

type Page = 'home' | 'credit-check' | 'checkout';

const Breadcrumbs = ({
  page,
  onNavigate
}: {
  page: Page;
  onNavigate: (page: Page) => void;
}) => {
  if (page === 'home') return null;

  return (
    <nav className="bg-[#F0F4F8] border-b border-[#E0E0E0]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => onNavigate('home')}
            className="text-[#003366] hover:text-[#FF6600] transition-colors"
          >
            Home
          </button>
          <span className="text-[#666666]">/</span>
          <span className="text-[#1A1A1A] font-medium">
            {page === 'credit-check' ? 'Credit Check' : 'Checkout'}
          </span>
        </div>
      </div>
    </nav>
  );
};

export function StoreFront() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [budgetFilter, setBudgetFilter] = useState<number>(0);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; phone: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = () => {
    setShowCart(false);
    setCurrentPage('checkout');
  };

  const handleCheckoutComplete = () => {
    setCartItems([]);
    setCurrentPage('home');
  };

  const handleToggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 products
      }
      return [...prev, product];
    });
  };

  const handleRemoveFromCompare = (productId: string) => {
    setCompareProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(''); // Deselect if clicking same category
    } else {
      setSelectedCategory(category);
    }
  };

  // Filter products by category and monthly budget
  const filteredProducts = useMemo(() => {
    let products = mockProducts;

    // Filter by category first
    if (selectedCategory) {
      products = products.filter((product) => product.category === selectedCategory);
    }

    // Then filter by budget if set
    if (budgetFilter === 0) return products;

    return products.filter((product) => {
      const installment = calculateInstallment(product.cashPrice, 0, 24, 0);
      return installment.monthlyPayment <= budgetFilter;
    });
  }, [budgetFilter, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setShowCart(true)}
        onLoginClick={() => setShowLogin(true)}
      />

      <Breadcrumbs page={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1">
        {currentPage === 'home' && (
          <div className="container mx-auto px-4 py-8 space-y-12">
            {/* Hero Slider */}
            <HeroSlider />

            {/* Budget Filter */}
            <BudgetFilter
              selectedBudget={budgetFilter}
              onBudgetChange={setBudgetFilter}
            />

            {/* Compare Bar */}
            {compareProducts.length > 0 && (
              <div className="bg-gradient-to-r from-[#003366] to-[#0055AA] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-white font-medium">
                    {compareProducts.length} product{compareProducts.length !== 1 ? 's' : ''} selected for comparison
                  </p>
                  <div className="flex gap-2">
                    {compareProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {product.brand}
                        <button
                          onClick={() => handleRemoveFromCompare(product.id)}
                          className="hover:text-[#FF6600]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowComparison(true)}
                  disabled={compareProducts.length < 2}
                  className="bg-[#FF6600] hover:bg-[#FF6600]/90 disabled:bg-[#666666] text-white px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Compare Now
                </button>
              </div>
            )}

            {/* Category Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#003366]">Shop by Category</h2>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="text-[#FF6600] hover:text-[#FF6600]/80 text-sm font-medium"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <CategoryGrid
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            </section>

            {/* Flash Deals Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#003366]">⚡ Flash Deals</h2>
                <CountdownTimer />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.slice(0, 4).map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onClick={setSelectedProduct}
                    />
                    <button
                      onClick={() => handleToggleCompare(product)}
                      className={`absolute top-4 left-4 z-20 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        compareProducts.find((p) => p.id === product.id)
                          ? 'bg-[#00C851] text-white'
                          : 'bg-white text-[#003366] border-2 border-[#003366] hover:bg-[#003366] hover:text-white'
                      }`}
                    >
                      {compareProducts.find((p) => p.id === product.id)
                        ? '✓ Added'
                        : '+ Compare'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Best Selling Installment Deals */}
            <section>
              <h2 className="text-[#003366] mb-6">💰 Best Installment Deals</h2>
              {budgetFilter > 0 && filteredProducts.length === 0 && (
                <div className="bg-[#F0F4F8] rounded-lg p-12 text-center">
                  <p className="text-[#666666] mb-2">
                    No products found within your budget
                  </p>
                  <p className="text-[#666666] text-sm mb-4">
                    Try increasing your monthly budget or browse all products
                  </p>
                  <button
                    onClick={() => setBudgetFilter(0)}
                    className="bg-[#003366] hover:bg-[#003366]/90 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Show All Products
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.slice(0, 8).map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onClick={setSelectedProduct}
                    />
                    <button
                      onClick={() => handleToggleCompare(product)}
                      className={`absolute top-4 left-4 z-20 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        compareProducts.find((p) => p.id === product.id)
                          ? 'bg-[#00C851] text-white'
                          : 'bg-white text-[#003366] border-2 border-[#003366] hover:bg-[#003366] hover:text-white'
                      }`}
                    >
                      {compareProducts.find((p) => p.id === product.id)
                        ? '✓ Added'
                        : '+ Compare'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Banner */}
            <section>
              <div className="bg-gradient-to-r from-[#003366] to-[#004488] rounded-lg p-12 text-center text-white">
                <h2 className="text-white mb-4">Get Your Credit Limit Now!</h2>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  Complete your KYC verification in minutes and unlock 0% installment plans on all products
                </p>
                <button
                  onClick={() => setCurrentPage('credit-check')}
                  className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Check Credit Limit
                </button>
              </div>
            </section>
          </div>
        )}

        {currentPage === 'credit-check' && (
          <div className="container mx-auto px-4 py-8">
            <button
              onClick={() => setCurrentPage('home')}
              className="mb-6 text-[#003366] hover:text-[#FF6600] transition-colors"
            >
              ← Back to Home
            </button>
            <CreditLimitChecker />
          </div>
        )}

        {currentPage === 'checkout' && (
          <div className="container mx-auto px-4 py-8">
            <CheckoutFlow
              items={cartItems}
              onComplete={handleCheckoutComplete}
              onBack={() => setCurrentPage('home')}
            />
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {showCart && (
        <CartModal
          items={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
        />
      )}

      {showComparison && (
        <ProductComparison
          products={compareProducts}
          onClose={() => setShowComparison(false)}
          onRemoveProduct={handleRemoveFromCompare}
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setCurrentPage('credit-check');
          }}
        />
      )}
    </div>
  );
}
