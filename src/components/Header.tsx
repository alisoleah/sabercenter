import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Phone, MapPin, Search, Menu, X } from 'lucide-react';
import { productsApi } from '../api/products.api';
import { Product } from '../types';

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onLoginClick?: () => void;
  currentUser?: { name: string; phone: string; role?: string } | null;
  onLogout?: () => void;
  onProductClick?: (product: Product) => void;
  onAdminClick?: () => void;
  onShopClick?: () => void;
  onCategoryClick?: (category: string) => void;
}

export function Header({ cartItemCount = 0, onCartClick, onLoginClick, currentUser, onLogout, onProductClick, onAdminClick, onShopClick, onCategoryClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = [
    'Large Appliances',
    'Small Appliances',
    'Mobiles',
    'Laptops',
    'TVs',
    'Air Conditioners',
    'Flash Deals'
  ];

  // Search with debouncing
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await productsApi.searchProducts(searchQuery, 8);
        setSearchResults(response.data || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      onProductClick?.(searchResults[0]);
      setShowResults(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    onProductClick?.(product);
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <header className="bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
      {/* Top bar */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">16000</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Find Store</span>
              </div>
            </div>
            <div className="flex gap-4">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline font-medium">{currentUser.name}</span>
                  </div>
                  {/* Option B: Admin Panel button (visible for admins) */}
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={onAdminClick}
                      className="text-sm bg-[#FF6600] hover:bg-[#FF6600]/90 transition-colors px-3 py-1 rounded-lg font-medium"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={onLogout}
                    className="text-sm hover:text-[#FF6600] transition-colors px-3 py-1 rounded-lg border border-white/20 hover:border-[#FF6600]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button onClick={onLoginClick} className="text-sm hover:text-[#FF6600] transition-colors flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Login / Register</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <h1 className="text-white cursor-pointer" onClick={onShopClick}>
              SaberStore
            </h1>

            {/* Search bar */}
            <div ref={searchRef} className="hidden md:flex items-center bg-white rounded-lg flex-1 max-w-xl relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
                <input
                  type="text"
                  placeholder="Search for products, brands..."
                  className="flex-1 px-4 py-2 rounded-l-lg outline-none text-[#1A1A1A]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                />
                <button
                  type="submit"
                  className="bg-[#FF6600] px-6 py-2 rounded-r-lg hover:bg-[#FF6600]/90 transition-colors"
                  disabled={isSearching}
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-contain rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.brand}</p>
                            <p className="text-sm font-bold text-[#FF6600]">{product.cashPrice.toLocaleString()} EGP</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">No products found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          <button
            onClick={onCartClick}
            className="relative bg-[#FF6600] hover:bg-[#FF6600]/90 transition-colors rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#00C851] text-white rounded-full w-6 h-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
            <span className="hidden md:inline">Cart</span>
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-4">
        <div className="flex items-center bg-white rounded-lg">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 px-4 py-2 rounded-l-lg outline-none text-[#1A1A1A]"
          />
          <button className="bg-[#FF6600] px-4 py-2 rounded-r-lg">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden md:block bg-[#003366]/80 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto py-3">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => onCategoryClick?.(category)}
                className={`text-sm whitespace-nowrap hover:text-[#FF6600] transition-colors bg-transparent border-0 cursor-pointer ${index === categories.length - 1 ? 'text-[#FF6600]' : ''
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-[#002244] border-t border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              {categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onCategoryClick?.(category);
                  }}
                  className={`text-sm py-2 px-4 rounded-lg hover:bg-white/10 transition-colors text-left bg-transparent border-0 cursor-pointer ${index === categories.length - 1 ? 'text-[#FF6600] bg-white/5' : ''
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}