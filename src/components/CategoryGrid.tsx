import { useEffect, useState } from 'react';
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
              {category.name}
            </div>
            <div className="cat-count">
              {category.productCount || 0} items
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
