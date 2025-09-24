// components/LanguageSelector.jsx - Simplified Desktop Only
import React from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const LanguageSelector = ({ className = '' }) => {
  const {
    currentLanguage,
    showLanguageMenu,
    supportedLanguages,
    currentLanguageData,
    handleLanguageChange,
    toggleLanguageMenu,
    isLanguageActive,
  } = useLanguage();

  return (
    <div className={`relative ${className}`} data-language-selector>
      <button
        onClick={toggleLanguageMenu}
        className="flex items-center gap-2 py-2 text-muted-foreground hover:text-blue-800 hover:font-bold rounded-lg transition-colors duration-200"
        type="button"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {currentLanguageData.shortCode}
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            showLanguageMenu ? 'rotate-180' : ''
          }`}
        />
      </button>

      {showLanguageMenu && (
        <div className="absolute top-full right-0 mt-1 bg-muted border border-border rounded-lg shadow-lg z-20 min-w-[140px]">
          <div className="py-1">
            {supportedLanguages.map(language => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-3 py-2 text-sm  flex items-center gap-2 ${
                  isLanguageActive(language.code)
                    ? 'text-blue-600'
                    : 'text-muted-foreground hover:bg-background/40'
                }`}
              >
                <span className="text-base">{language.flag}</span>
                {language.name}
                {isLanguageActive(language.code) && (
                  <Check className="h-3 w-3 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
