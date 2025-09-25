// components/SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useLanguage } from '../../hooks/useLanguage';
import { useWardrobe } from '../../contexts/WardrobeContext';
import { signOut } from '../../lib/supabaseClient';
import {
  X,
  Moon,
  Sun,
  ChevronRight,
  LogOut,
  UserPlus,
  Edit3,
  Camera,
} from 'lucide-react';
import LanguageSelectionModal from '../LanguageSelectionModal';
import { PersonalInformation } from './PersonalInformation';
import { PrivacySettings } from './PrivacySettings';
import SwitchAccountModal from './SwitchAccountModal';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { settingsConfig } from '@/types/settingsConfig';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const { currentLanguage, currentLanguageData } = useLanguage();
  const { user, setUser } = useWardrobe();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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

  // Handler functions
  const handleNotificationsChange = (): void => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);
    localStorage.setItem(
      'notifications-enabled',
      JSON.stringify(newNotifications)
    );
  };

  const handleBackToSettings = (): void => {
    setCurrentView('main');
  };

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
      onClose();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSwitchAccount = (): void => {
    setShowSwitchAccountModal(true);
  };

  // Reset view when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentView('main');
    }
  }, [isOpen]);

  // Get settings configuration with dependencies
  const currentSettingsConfig = settingsConfig({
    isDarkMode,
    toggleDarkMode,
    notifications,
    handleNotificationsChange,
    currentLanguageData,
    setShowLanguageModal,
    handleHelpSupport,
    handlePrivacySettings,
  });

  // Reusable SettingButton component
  const SettingButton = ({ item, className = '' }) => {
    const Icon = item.icon;

    return (
      <button
        onClick={item.onClick}
        disabled={item.disabled}
        className={`w-full flex items-center justify-between p-2 bg-muted rounded-lg hover:bg-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {item.title}
            </p>
            {item.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.value && !item.hasToggle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.value}
            </p>
          )}

          {item.hasToggle ? (
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                item.toggleValue
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  item.toggleValue ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}

          {item.badge && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </div>
      </button>
    );
  };

  // Responsive visibility check
  const shouldShowItem = item => {
    if (item.showOn.includes('all')) return true;
    if (item.showOn.includes('mobile') && !isDesktop) return true;
    if (item.showOn.includes('desktop') && isDesktop) return true;
    return false;
  };

  if (!isOpen) return null;

  if (currentView === 'personal') {
    return (
      <>
        <div
          className="fixed inset-0 bg-muted/50 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={onClose}
        />
        <div
          className={`fixed top-0 right-0 h-full z-50 bg-muted shadow-2xl transform transition-all duration-300 ease-out ${
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
          className={`fixed top-0 right-0 h-full z-50 bg-muted shadow-2xl transform transition-all duration-300 ease-out ${
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-muted/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Settings Panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 bg-muted shadow-2xl transform transition-all duration-300 ease-out text-foreground ${
          isDesktop
            ? `w-96 rounded-xl border ${
                isOpen
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-4 opacity-0'
              }`
            : `w-full max-w-md ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-8 h-full pb-20">
          {/* User Profile Section */}
          {user && (
            <div className="space-y-4">
              <div className="rounded-xl p-2">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border border-border"
                    />
                    <button className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-full shadow-sm text-white">
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-lg">
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
                className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium">Switch Account</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          )}

          {/* Dynamic Settings Sections */}
          {currentSettingsConfig
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <div key={section.id} className="space-y-2">
                <h3 className="text-sm text-muted-foreground font-semibold">
                  {section.title}
                </h3>

                <div className="space-y-2">
                  {section.items.filter(shouldShowItem).map(item => {
                    // Special handling for theme toggle (if you want to keep the special styling)
                    // if (item.id === 'theme') {
                    //   return (
                    //     <div
                    //       key={item.id}
                    //       className="flex items-center justify-between text-foreground p-2 bg-muted rounded-lg"
                    //     >
                    //       <div className="flex items-center gap-3">
                    //         <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    //         <div>
                    //           <p className="font-medium">Dark Mode</p>
                    //           <p className="text-sm text-gray-500 dark:text-gray-400">
                    //             {isDarkMode ? 'Dark' : 'Light'}
                    //           </p>
                    //         </div>
                    //       </div>
                    //       <button
                    //         onClick={toggleDarkMode}
                    //         className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-background rounded-md transition-colors duration-200 flex items-center"
                    //         type="button"
                    //         aria-label={
                    //           isDarkMode
                    //             ? 'Switch to light mode'
                    //             : 'Switch to dark mode'
                    //         }
                    //       >
                    //         {isDarkMode ? (
                    //           <Moon className="h-4.5 w-4.5" />
                    //         ) : (
                    //           <Sun className="h-4.5 w-4.5" />
                    //         )}
                    //       </button>
                    //     </div>
                    //   );
                    // }

                    // Regular setting items
                    return <SettingButton key={item.id} item={item} />;
                  })}
                </div>
              </div>
            ))}

          {/* Sign Out and App Info */}
          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-600 dark:text-red-400">
                Sign Out
              </span>
            </button>

            {/* App Info */}
            <div className="text-center border-t pt-4 border-gray-100 dark:border-gray-700 pb-20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vesti v1.2.0
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
