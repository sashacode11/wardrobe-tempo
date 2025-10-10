// 📁 src/config/settingsConfig.ts
import {
  Globe,
  Moon,
  Sun,
  Bell,
  Shield,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import type { SettingSection } from './index';

export const settingsConfig = (dependencies: {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  notifications: boolean;
  handleNotificationsChange: () => void;
  currentLanguageData: any;
  setShowLanguageModal: (show: boolean) => void;
  setShowFeedbackModal: (show: boolean) => void;
  handleHelpSupport: () => void;
  handlePrivacySettings: () => void;
}): SettingSection[] => {
  const {
    isDarkMode,
    toggleDarkMode,
    notifications,
    handleNotificationsChange,
    currentLanguageData,
    setShowLanguageModal,
    setShowFeedbackModal,
    handleHelpSupport,
    handlePrivacySettings,
  } = dependencies;

  return [
    {
      id: 'general',
      title: 'General',
      order: 1,
      items: [
        {
          id: 'language',
          title: 'Language',
          icon: Globe,
          value: `${currentLanguageData.flag} ${currentLanguageData.name}`,
          onClick: () => setShowLanguageModal(true),
          showOn: ['mobile'],
        },
      ],
    },
    {
      id: 'appearance',
      title: 'Appearance',
      order: 2,
      items: [
        {
          id: 'theme',
          title: 'Dark Mode',
          description: 'Switch between light and dark themes',
          icon: isDarkMode ? Moon : Sun,
          value: isDarkMode ? 'Dark' : 'Light',
          onClick: toggleDarkMode,
          showOn: ['all'],
          hasToggle: true,
          toggleValue: isDarkMode,
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      order: 3,
      items: [
        {
          id: 'notifications',
          title: 'Notifications',
          description: 'Manage your notification preferences',
          icon: Bell,
          value: notifications ? 'Enabled' : 'Disabled',
          onClick: handleNotificationsChange,
          showOn: ['all'],
          hasToggle: true,
          toggleValue: notifications,
        },
      ],
    },
    {
      id: 'support',
      title: 'Support',
      order: 4,
      items: [
        // {
        //   id: 'help',
        //   title: 'Help & Support',
        //   icon: HelpCircle,
        //   onClick: handleHelpSupport,
        //   showOn: ['all'],
        // },
        {
          id: 'contact',
          title: 'Contact Us',
          icon: MessageCircle,
          onClick: () => setShowFeedbackModal(true),
          showOn: ['all'],
        },
        {
          id: 'privacy',
          title: 'Privacy Center',
          icon: Shield,
          onClick: handlePrivacySettings,
          showOn: ['all'],
        },
      ],
    },
  ];
};
