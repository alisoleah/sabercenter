import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { productsApi } from '../api/products.api';

interface Category {
  id: string;
  name: string;
  icon: string;
  productCount?: number;
}

interface CategoryGridProps {
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

export function CategoryGrid({ onCategorySelect, selectedCategory }: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await productsApi.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback data for testing/offline mode matches the user's reference
        setCategories([
          { id: '1', name: 'Large Appliances', icon: '<path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" /><path d="M14 20h2" /><path d="M8 20h2" /><path d="M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />', productCount: 45 },
          { id: '2', name: 'Laptops', icon: '<rect width="16" height="10" x="4" y="3" rx="2" /><path d="M2 17l2-2h16l2 2" />', productCount: 24 },
          { id: '3', name: 'Kitchen & Dining', icon: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />', productCount: 156 },
          { id: '4', name: 'Kids Appliances', icon: '<path d="M9 17v1a3 3 0 1 0 6 0v-1" /><path d="M9 17h6" /><path d="M4.4 7a6.5 6.5 0 0 1 15.2 0" /><path d="M5 21v-7" /><path d="M19 21v-7" /><path d="M12 11V3" />', productCount: 32 },
          { id: '5', name: 'Home Decor', icon: '<path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M10 9a3 3 0 1 1-6 0" /><path d="M9 21v-8h6v8" />', productCount: 89 },
          { id: '6', name: 'Fashion', icon: '<path d="M20.38 3.4a2 2 0 0 0-1.79-1.11c-.55 0-1.05.26-1.55.7L12 9 6.96 2.99a2 2 0 0 0-3.34 1.11L3 8.35v11.66A2 2 0 0 0 5 22h14a2 2 0 0 0 2-1.99V8.35l-.62-4.95Z" />', productCount: 210 },
          { id: '7', name: 'Electronics', icon: '<rect width="18" height="12" x="3" y="6" rx="2" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M12 12v3" /><path d="M8 12v3" /><path d="M16 12v3" />', productCount: 142 },
          { id: '8', name: 'Air Conditioners', icon: '<path d="M4 10h16" /><path d="M4 14h16" /><path d="M4 18h16" /><path d="M2 6h20" /><path d="M20 6v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6" />', productCount: 12 },
          { id: '9', name: 'Watches', icon: '<circle cx="12" cy="12" r="6" /><polyline points="12 10 12 12 13 13" /><path d="M12 2v4" /><path d="M12 18v4" />', productCount: 56 },
          { id: '10', name: 'TVs', icon: '<rect width="16" height="10" x="4" y="5" rx="2" /><path d="M12 15v4" /><path d="M8 19h8" />', productCount: 18 },
          { id: '11', name: 'Small Appliances', icon: '<path d="M8 2h8" /><path d="M9 2v2" /><path d="M15 2v2" /><rect width="18" height="12" x="3" y="6" rx="2" /><path d="M8 18h8" />', productCount: 32 },
          { id: '12', name: 'Personal & Health Care', icon: '<path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="12" x="3" y="8" rx="2" /><path d="M3 14h18" />', productCount: 78 },
          { id: '13', name: 'Perfumes', icon: '<path d="M10 2v2" /><path d="M14 2v2" /><path d="M7 8h10" /><path d="M12 4v4" /><rect width="10" height="12" x="7" y="8" rx="3" />', productCount: 120 },
          { id: '14', name: 'Office Utilities', icon: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />', productCount: 45 },
          { id: '15', name: 'Mobiles', icon: '<rect width="10" height="16" x="7" y="4" rx="2" /><path d="M11 17h2" />', productCount: 68 },
          { id: '16', name: 'Mobile Accessories', icon: '<path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M12 16v.01" /><path d="M12 2a10 10 0 0 1 10 10v2a2 2 0 0 1-2 2h-4v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4H2a2 2 0 0 1-2-2v-2a10 10 0 0 1 10-10Z" />', productCount: 230 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const renderIcon = (iconString: string) => {
    // Check if it's a URL (http/https)
    if (iconString && (iconString.startsWith('http') || iconString.startsWith('/'))) {
      return <img src={iconString} alt="Category Icon" className="w-full h-full object-contain" />;
    }

    // Otherwise, assume it's SVG content provided by admin/seed
    // We wrap it in the standard SVG container defined by the CSS
    return (
      <svg
        viewBox="0 0 24 24"
        dangerouslySetInnerHTML={{ __html: iconString }}
      />
    );
  };

  const { t, i18n } = useTranslation();

  // Helper to map API category names to translation keys
  const getCategoryName = (name: string) => {
    const keyMap: { [key: string]: string } = {
      'Large Appliances': 'nav.large_appliances',
      'Small Appliances': 'nav.small_appliances',
      'Mobiles': 'nav.mobiles',
      'Laptops': 'nav.laptops',
      'TVs': 'nav.tvs',
      'Air Conditioners': 'nav.air_conditioners',
      'Kitchen & Dining': 'nav.kitchen_dining',
      'Kids Appliances': 'nav.kids_appliances',
      'Home Decor': 'nav.home_decor',
      'Fashion': 'nav.fashion',
      'Electronics': 'nav.electronics',
      'Watches': 'nav.watches',
      'Mobile Accessories': 'nav.mobile_accessories',
      'Office Utilities': 'nav.office_utilities',
      'Perfumes': 'nav.perfumes',
      'Personal & Health Care': 'nav.personal_care',
      'Flash Deals': 'nav.flash_deals'
    };

    return keyMap[name] ? t(keyMap[name]) : name;
  };

  if (isLoading) {
    return (
      <div className="categories-wrapper">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="cat-card animate-pulse">
            <div className="icon-box bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <style>{`
        :root {
            --brand-color: #0046be;
            --bg-color: #f5f7fa;
            --card-bg: #ffffff;
            --text-color: #333333;
            --hover-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }

        .categories-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 20px;
            padding: 20px 0;
        }

        .cat-card {
            background: var(--card-bg);
            border-radius: 8px;
            padding: 25px 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.03);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 1px solid transparent;
        }

        .cat-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--hover-shadow);
            border-color: rgba(0, 70, 190, 0.1);
        }

        .cat-card.selected {
             border-color: var(--brand-color);
             box-shadow: 0 0 0 1px var(--brand-color);
        }

        .icon-box {
            width: 70px;
            height: 70px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .icon-box svg {
            width: 100%;
            height: 100%;
            stroke: var(--brand-color);
            stroke-width: 1.5;
            stroke-linecap: round;
            stroke-linejoin: round;
            fill: none;
        }

        .cat-name {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-color);
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .cat-count {
            font-size: 11px;
            color: #888;
            margin-top: 5px;
        }
      `}</style>



      <div className="categories-wrapper">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategorySelect?.(category.name)}
            className={`cat-card ${selectedCategory === category.name ? 'selected' : ''}`}
          >
            <div className="icon-box">
              {renderIcon(category.icon)}
            </div>
            <div className="cat-name">
              {getCategoryName(category.name)}
            </div>
            <div className="cat-count">
              {t('common.item_count', { count: category.productCount || 0 })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
