import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
        document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-sm font-medium"
            title={i18n.language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
        >
            <Globe className="w-4 h-4" />
            <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
        </button>
    );
}
