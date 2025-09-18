// components/LanguageSelectionModal.tsx
import React, { useState } from 'react';
import { Button } from './ui/button';
import { useLanguage } from '../hooks/useLanguage';
import { X, Check, Search, ArrowLeft } from 'lucide-react';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentLanguage, supportedLanguages, handleLanguageChange } =
    useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleLanguageSelect = (languageCode: string): void => {
    handleLanguageChange(languageCode);
    onClose(); // Close modal after selection
  };

  // Filter languages based on search query
  const filteredLanguages = supportedLanguages.filter(
    language =>
      language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      language.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Full Screen Modal - Mobile Style */}
      <div className="fixed inset-0 bg-white z-[60] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-12 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Language</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {filteredLanguages.map(language => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{language.flag}</span>
                    <span className="text-base font-medium text-gray-900">
                      {language.name}
                    </span>
                  </div>
                  {currentLanguage === language.code && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </button>
            ))}

            {filteredLanguages.length === 0 && searchQuery && (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-500">No languages found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LanguageSelectionModal;
