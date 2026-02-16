import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bannersApi, Banner } from '../api/banners.api';

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchBanners();
  }, [i18n.language]);

  const fetchBanners = async () => {
    try {
      const data = await bannersApi.getActiveBanners();
      // If we had a real backend with multi-language support, we would pass the language param
      // or the backend would return localized data. 
      // For now, if no data or we want to force fallback to test translations:
      if (!data || data.length === 0) throw new Error('No banners found');
      setBanners(data);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      // Fallback to localized default banner
      setBanners([
        {
          id: '1',
          title: t('hero.title'),
          subtitle: t('hero.subtitle'),
          ctaText: t('hero.cta'),
          ctaLink: '/products',
          imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=1920&q=80',
          bgGradient: 'from-[#003366] to-[#004488]',
          isActive: true,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg bg-gradient-to-r from-[#003366] to-[#004488] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-500 ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
        >
          <div className={`h-full bg-gradient-to-r ${banner.bgGradient} flex items-center`}>
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-white space-y-4">
                  <h2 className="text-white">
                    {banner.title}
                  </h2>
                  <p className="text-white/90 text-lg">
                    {banner.subtitle}
                  </p>
                  {banner.ctaText && (
                    <button
                      onClick={() => banner.ctaLink && window.location.href !== banner.ctaLink}
                      className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white px-8 py-3 rounded-lg transition-colors"
                    >
                      {banner.ctaText}
                    </button>
                  )}
                </div>
                <div className="hidden md:block">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-auto object-contain max-h-[400px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
