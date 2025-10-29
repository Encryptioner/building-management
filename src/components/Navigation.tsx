import { useState, useEffect } from 'react';
import type { SupportedLanguage } from '../locales/config';
import { isLanguageSupported } from '../locales/config';
import { getTranslations } from '../utils/i18n';
import LanguageSelector from './LanguageSelector';

type ActiveTab = 'bills' | 'residents';

interface NavigationProps {
  children: (activeTab: ActiveTab, language: SupportedLanguage) => React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  // Load language from localStorage or default to 'bn' (Bangla)
  const [language, setLanguage] = useState<SupportedLanguage>('bn');
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('bills');

  // Initialize language and active tab on client side only
  useEffect(() => {
    setIsClient(true);
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && isLanguageSupported(savedLang)) {
      setLanguage(savedLang);
    }

    const savedTab = localStorage.getItem('activeView') as ActiveTab;
    if (savedTab === 'bills' || savedTab === 'residents') {
      setActiveTab(savedTab);
    }
  }, []);

  const t = getTranslations(language);

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    if (isClient) {
      localStorage.setItem('preferred-language', newLanguage);
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (isClient) {
      localStorage.setItem('activeView', tab);
    }
    // Scroll to top on tab change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Building Management Title */}
          <div className="border-b border-gray-200 py-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
              {t.navigation.appTitle}
            </h1>
          </div>

          <div className="flex items-center justify-between h-16">
            {/* Tab Navigation */}
            <nav className="flex gap-1 sm:gap-2">
              <button
                onClick={() => handleTabChange('bills')}
                className={`px-3 sm:px-6 py-2 font-medium text-sm sm:text-base rounded-t-lg transition-all ${
                  activeTab === 'bills'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={t.navigation.bills}
              >
                {t.navigation.bills}
              </button>
              <button
                onClick={() => handleTabChange('residents')}
                className={`px-3 sm:px-6 py-2 font-medium text-sm sm:text-base rounded-t-lg transition-all ${
                  activeTab === 'residents'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={t.navigation.residents}
              >
                {t.navigation.residents}
              </button>
            </nav>

            {/* Language Selector */}
            <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {isClient && children(activeTab, language)}
      </main>
    </div>
  );
}
