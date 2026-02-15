import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Shield } from 'lucide-react';

interface FooterProps {
  onAdminClick?: () => void;
}

export function Footer({ onAdminClick }: FooterProps = {}) {
  return (
    <footer className="bg-[#003366] text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white mb-4">SaberStore Egypt</h3>
            <p className="text-white/70 mb-4">
              Your trusted partner for home appliances and electronics with flexible installment plans.
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
            <h3 className="text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Flash Deals</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Installment Plans</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Return Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Warranty Info</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#FF6600]" />
                <span className="text-white/70">16000</span>
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
              © 2024 SaberStore Egypt. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Privacy Policy</a>
              {onAdminClick && (
                <button
                  onClick={onAdminClick}
                  className="text-white/70 hover:text-white text-sm transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" />
                  Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}