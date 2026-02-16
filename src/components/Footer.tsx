import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  onAdminClick?: () => void;
}

export function Footer({ onAdminClick }: FooterProps = {}) {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#003366] text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white mb-4">SaberStore Egypt</h3>
            <p className="text-white/70 mb-4">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">{t('footer.quick_links')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('footer.about_us')}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('footer.flash_deals')}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('footer.installment_plans')}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('footer.track_order')}</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white mb-4">{t('footer.customer_service')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('footer.contact_us')}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('footer.shipping_policy')}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('footer.return_policy')}</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t('footer.warranty_info')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">{t('footer.contact_us')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#FF6600]" />
                <span className="text-white/70">{t('common.phone')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#FF6600]" />
                <span className="text-white/70">support@saberstore.eg</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-[#FF6600] flex-shrink-0 mt-1" />
                <span className="text-white/70">Cairo, Egypt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm">
              {t('footer.rights_reserved')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">{t('footer.terms_of_service')}</a>
              <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">{t('footer.privacy_policy')}</a>
              {onAdminClick && (
                <button
                  onClick={onAdminClick}
                  className="text-white/70 hover:text-white text-sm transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" />
                  {t('common.admin_panel')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}