// hooks/useLanguage.js
import { useState, useEffect } from 'react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', shortCode: 'EN' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', shortCode: 'VI' },
  { code: 'zh', name: '中文', flag: '🇨🇳', shortCode: '中' },
];

const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'user-language-preference';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Initialize from localStorage or default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || DEFAULT_LANGUAGE;
    }
    return DEFAULT_LANGUAGE;
  });

  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Save language preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, currentLanguage);
    }
  }, [currentLanguage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (!event.target.closest('[data-language-selector]')) {
        setShowLanguageMenu(false);
      }
    };

    if (showLanguageMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLanguageMenu]);

  const handleLanguageChange = languageCode => {
    setCurrentLanguage(languageCode);
    setShowLanguageMenu(false);

    // Here you can add integration with i18n libraries
    // For example:
    // i18n.changeLanguage(languageCode);

    // You can also emit a custom event for other components to listen to
    window.dispatchEvent(
      new CustomEvent('languageChanged', {
        detail: { language: languageCode },
      })
    );
  };

  const getCurrentLanguageData = () => {
    return (
      SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) ||
      SUPPORTED_LANGUAGES[0]
    );
  };

  const toggleLanguageMenu = () => {
    setShowLanguageMenu(!showLanguageMenu);
  };

  return {
    // Current state
    currentLanguage,
    showLanguageMenu,

    // Language data
    supportedLanguages: SUPPORTED_LANGUAGES,
    currentLanguageData: getCurrentLanguageData(),

    // Actions
    handleLanguageChange,
    toggleLanguageMenu,
    setShowLanguageMenu,

    // Utility functions
    isLanguageActive: code => code === currentLanguage,
  };
};
