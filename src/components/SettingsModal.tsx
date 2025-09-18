// components/SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useLanguage } from '../hooks/useLanguage';
import {
  X,
  Check,
  Moon,
  Sun,
  Bell,
  Database,
  Download,
  Trash2,
  User,
  Shield,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, supportedLanguages, handleLanguageChange } =
    useLanguage();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [autoBackup, setAutoBackup] = useState<boolean>(true);

  // Check current theme on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNotifications = localStorage.getItem('notifications-enabled');
      const savedAutoBackup = localStorage.getItem('auto-backup-enabled');

      if (savedNotifications !== null) {
        setNotifications(JSON.parse(savedNotifications));
      }
      if (savedAutoBackup !== null) {
        setAutoBackup(JSON.parse(savedAutoBackup));
      }
    }
  }, []);

  const handleThemeChange = (): void => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleNotificationsChange = (): void => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);
    localStorage.setItem(
      'notifications-enabled',
      JSON.stringify(newNotifications)
    );
  };

  const handleAutoBackupChange = (): void => {
    const newAutoBackup = !autoBackup;
    setAutoBackup(newAutoBackup);
    localStorage.setItem('auto-backup-enabled', JSON.stringify(newAutoBackup));
  };

  const handleExportData = (): void => {
    console.log('Exporting user data...');
    // TODO: Implement export functionality
    // You can integrate with your Supabase data export here
  };

  const handleClearCache = (): void => {
    // Clear app-specific cache
    const cacheKeys = ['wardrobe-cache', 'outfit-cache', 'user-preferences'];
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('Cache cleared');
    // You could show a toast notification here
  };

  const handleAccountSettings = (): void => {
    console.log('Navigate to account settings');
    // TODO: Navigate to account settings page or open account modal
  };

  const handlePrivacySettings = (): void => {
    console.log('Navigate to privacy settings');
    // TODO: Navigate to privacy settings page or open privacy modal
  };

  const handleHelpSupport = (): void => {
    console.log('Navigate to help & support');
    // TODO: Navigate to help page or open support modal
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Settings Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 h-full pb-20">
          {/* Language Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Language</h3>
            <div className="space-y-2">
              {supportedLanguages.map(language => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                    currentLanguage === language.code
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{language.flag}</span>
                      <span className="font-medium">{language.name}</span>
                    </div>
                    {currentLanguage === language.code && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Appearance Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-600">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <button
                onClick={handleThemeChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Push Notifications
                  </p>
                  <p className="text-sm text-gray-600">
                    Get notified about outfit suggestions
                  </p>
                </div>
              </div>
              <button
                onClick={handleNotificationsChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Data & Privacy Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              Data & Privacy
            </h3>

            {/* Auto Backup */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Auto Backup</p>
                  <p className="text-sm text-gray-600">
                    Automatically backup your wardrobe
                  </p>
                </div>
              </div>
              <button
                onClick={handleAutoBackupChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoBackup ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Export Data */}
            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="p-2 bg-gray-200 rounded-lg">
                <Download className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Export Data</p>
                <p className="text-sm text-gray-600">
                  Download your wardrobe data
                </p>
              </div>
            </button>

            {/* Clear Cache */}
            <button
              onClick={handleClearCache}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="p-2 bg-gray-200 rounded-lg">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Clear Cache</p>
                <p className="text-sm text-gray-600">Free up storage space</p>
              </div>
            </button>
          </div>

          {/* Account Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Account</h3>

            <button
              onClick={handleAccountSettings}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="p-2 bg-gray-200 rounded-lg">
                <User className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Account Settings</p>
                <p className="text-sm text-gray-600">
                  Manage your profile and preferences
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
            </button>

            <button
              onClick={handlePrivacySettings}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="p-2 bg-gray-200 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Privacy & Security</p>
                <p className="text-sm text-gray-600">
                  Control your data and privacy
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
            </button>
          </div>

          {/* About Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">About</h3>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">App Version</p>
                <p className="text-sm text-gray-600">1.2.0</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-600">Dec 2024</p>
              </div>
            </div>

            <button
              onClick={handleHelpSupport}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="p-2 bg-gray-200 rounded-lg">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Help & Support</p>
                <p className="text-sm text-gray-600">
                  Get help and contact support
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
