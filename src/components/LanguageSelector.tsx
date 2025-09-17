// components/LanguageSelector.jsx
import React from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const LanguageSelector = ({
  variant = 'desktop', // 'desktop' | 'mobile' | 'settings'
  className = '',
}) => {
  const {
    currentLanguage,
    showLanguageMenu,
    supportedLanguages,
    currentLanguageData,
    handleLanguageChange,
    toggleLanguageMenu,
    isLanguageActive,
  } = useLanguage();

  // Desktop variant (for header)
  if (variant === 'desktop') {
    return (
      <div className={`relative ${className}`} data-language-selector>
        <button
          onClick={toggleLanguageMenu}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors duration-200"
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
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px]">
            <div className="py-1">
              {supportedLanguages.map(language => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                    isLanguageActive(language.code)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700'
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
  }

  // Mobile variant (for settings or bottom nav)
  if (variant === 'mobile') {
    return (
      <div className={`${className}`} data-language-selector>
        <button
          onClick={toggleLanguageMenu}
          className="flex items-center justify-between w-full p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-gray-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Language</div>
              <div className="text-sm text-gray-500">
                {currentLanguageData.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">{currentLanguageData.flag}</span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                showLanguageMenu ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {showLanguageMenu && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            {supportedLanguages.map(language => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left p-4 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 ${
                  isLanguageActive(language.code) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{language.flag}</span>
                  <span
                    className={`font-medium ${
                      isLanguageActive(language.code)
                        ? 'text-blue-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {language.name}
                  </span>
                </div>
                {isLanguageActive(language.code) && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Settings variant (list item style)
  if (variant === 'settings') {
    return (
      <div className={`space-y-2 ${className}`} data-language-selector>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Language</h3>
        <div className="space-y-1">
          {supportedLanguages.map(language => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                isLanguageActive(language.code)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                </div>
                {isLanguageActive(language.code) && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default LanguageSelector;
