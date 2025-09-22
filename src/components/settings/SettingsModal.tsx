// components/SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useLanguage } from '../../hooks/useLanguage';
import { useWardrobe } from '../../contexts/WardrobeContext';
import { signOut } from '../../lib/supabaseClient';
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
  LogOut,
  UserPlus,
  Globe,
  Edit3,
  Camera,
} from 'lucide-react';
import LanguageSelectionModal from '../LanguageSelectionModal';
import { PersonalInformation } from './PersonalInformation';
import { PrivacySettings } from './PrivacySettings';
import SwitchAccountModal from './SwitchAccountModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const { currentLanguage, currentLanguageData } = useLanguage();
  const { user, setUser } = useWardrobe();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [autoBackup, setAutoBackup] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<
    'main' | 'profile-settings' | 'personal' | 'privacy' | 'data'
  >('main');
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);

  // Detect if we're on desktop
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

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
  };

  const handleClearCache = (): void => {
    const cacheKeys = ['wardrobe-cache', 'outfit-cache', 'user-preferences'];
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('Cache cleared');
  };

  const handleBackToSettings = (): void => {
    setCurrentView('profile-settings');
  };

  // Reset view when modal closes - add this useEffect
  useEffect(() => {
    if (!isOpen) {
      setCurrentView('main');
    }
  }, [isOpen]);

  // Update these existing functions to use navigation
  const handleAccountSettings = (): void => {
    console.log('Profile Settings clicked!');
    console.log('Current currentView before:', currentView);
    setCurrentView('profile-settings');
    console.log('Should have set currentView to profile-settings');
  };
  console.log('Current currentView is:', currentView);

  const handlePrivacySettings = (): void => {
    setCurrentView('privacy');
  };

  const handleHelpSupport = (): void => {
    console.log('Navigate to help & support');
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut();
      setUser(null);
      onClose(); // Close the settings modal
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSwitchAccount = (): void => {
    // // First sign out the current user, then trigger auth dialog
    // handleSignOut().then(() => {
    //   // Trigger the auth dialog to show
    //   window.dispatchEvent(new CustomEvent('showAuth'));
    // });

    setShowSwitchAccountModal(true);
  };

  if (!isOpen) return null;

  // Show different views based on currentView
  // if (currentView === 'profile-settings') {
  //   return (
  //     <>
  //       <div
  //         className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
  //         onClick={onClose}
  //       />
  //       <div
  //         className={`fixed top-0 right-0 h-full z-50 bg-white shadow-2xl transform transition-all duration-300 ease-out ${
  //           isDesktop
  //             ? `w-96 rounded-xl border translate-y-0 opacity-100`
  //             : `w-full max-w-md translate-x-0`
  //         }`}
  //       >
  //         <ProfileSettings
  //           onBack={handleBackToMain}
  //           onNavigateToSection={handleNavigateToSection}
  //         />
  //       </div>
  //       <LanguageSelectionModal
  //         isOpen={showLanguageModal}
  //         onClose={() => setShowLanguageModal(false)}
  //       />
  //     </>
  //   );
  // }

  if (currentView === 'personal') {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={onClose}
        />
        <div
          className={`fixed top-0 right-0 h-full z-50 bg-white shadow-2xl transform transition-all duration-300 ease-out ${
            isDesktop
              ? `w-96 rounded-xl border translate-y-0 opacity-100`
              : `w-full max-w-md translate-x-0`
          }`}
        >
          <PersonalInformation onBack={handleBackToSettings} />
        </div>
      </>
    );
  }

  if (currentView === 'privacy') {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={onClose}
        />
        <div
          className={`fixed top-0 right-0 h-full z-50 bg-white shadow-2xl transform transition-all duration-300 ease-out ${
            isDesktop
              ? `w-96 rounded-xl border translate-y-0 opacity-100`
              : `w-full max-w-md translate-x-0`
          }`}
        >
          <PrivacySettings onBack={handleBackToSettings} />
        </div>
      </>
    );
  }

  // if (currentView === 'data') {
  //   return (
  //     <>
  //       <div
  //         className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
  //         onClick={onClose}
  //       />
  //       <div
  //         className={`fixed top-0 right-0 h-full z-50 bg-white shadow-2xl transform transition-all duration-300 ease-out ${
  //           isDesktop
  //             ? `w-96 rounded-xl border translate-y-0 opacity-100`
  //             : `w-full max-w-md translate-x-0`
  //         }`}
  //       >
  //         <DataManagement onBack={handleBackToSettings} />
  //       </div>
  //     </>
  //   );
  // }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Settings Panel - Responsive positioning */}
      <div
        className={`fixed top-0 right-0 h-full z-50 bg-white shadow-2xl transform transition-all duration-300 ease-out ${
          isDesktop
            ? `w-96  rounded-xl border ${
                isOpen
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-4 opacity-0'
              }`
            : ` w-full max-w-md ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
              }`
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
        <div className="flex-1 overflow-y-auto p-6 space-y-8 h-full pb-20">
          {/* User Profile Section */}
          {user && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-2">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover bg-gray-200"
                    />
                    <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full shadow-sm">
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-lg">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <button
                      onClick={() => setCurrentView('personal')}
                      className="text-blue-600 text-sm font-medium mt-1 flex items-center gap-1 hover:text-blue-700"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
              {/* Account Actions */}
              <button
                onClick={handleSwitchAccount}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Switch Account
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          )}

          {/* General Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">General</h3>

            {/* Language Section - Mobile only */}
            <div className="block sm:hidden">
              <button
                onClick={() => setShowLanguageModal(true)}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Language</p>
                    <p className="text-sm text-gray-500">
                      {currentLanguageData.flag} {currentLanguageData.name}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>

            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-gray-600" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-500">
                    {isDarkMode ? 'Dark' : 'Light'}
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

          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-500">
                    {notifications ? 'Enabled' : 'Disabled'}
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

          {/* Data Section */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Data</h3>

            <button
              onClick={handleClearCache}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Clear Cache</p>
                  <p className="text-sm text-gray-500">Free up storage space</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Export Data</p>
                  <p className="text-sm text-gray-500">Download your data</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div> */}

          {/* Others Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Others</h3>

            <button
              onClick={handleHelpSupport}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  Help & Support
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={handlePrivacySettings}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  Privacy Center
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Sign Out and App Info */}
          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-600">Sign Out</span>
            </button>

            {/* App Info */}
            <div className="text-center border-t pt-4 border-gray-100 pb-20">
              <p className="text-sm text-gray-500">Vesti v1.2.0</p>
              <p className="text-xs text-gray-400 mt-1">
                Your current version is up to date.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />

      <SwitchAccountModal
        isOpen={showSwitchAccountModal}
        onClose={() => setShowSwitchAccountModal(false)}
      />
    </>
  );
};

export default SettingsModal;
