// components/ProfileSettings.tsx
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Palette,
  Download,
  Trash2,
  ChevronRight,
  Camera,
  Edit3,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWardrobe } from '@/contexts/WardrobeContext';
import { supabase } from '@/types/supabase';

interface ProfileSettingsProps {
  onBack: () => void;
  onNavigateToSection: (section: string) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  onBack,
  onNavigateToSection,
}) => {
  const { user } = useWardrobe(); // Add this import and usage

  // Remove manual data, use real user data
  const profileData = {
    name: user?.user_metadata?.full_name || 'User',
    email: user?.email || '',
    avatar: '/api/placeholder/80/80', // Keep placeholder for now
  };

  const settingsSections = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Name, email, and profile photo',
      icon: User,
      items: ['Display Name', 'Email', 'Profile Photo', 'Measurements'],
    },
    {
      id: 'preferences',
      title: 'Wardrobe Preferences',
      description: 'Size units, categories, and style preferences',
      icon: Palette,
      items: [
        'Size Units',
        'Default Categories',
        'Style Preferences',
        'Brands',
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Data privacy and account security',
      icon: Shield,
      items: [
        'Account Visibility',
        'Data Sharing',
        'Blocked Users',
        'Two-Factor Auth',
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Push notifications and email preferences',
      icon: Bell,
      items: [
        'Push Notifications',
        'Email Updates',
        'Outfit Reminders',
        'Social Updates',
      ],
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Profile Settings
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={profileData.avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover bg-gray-200"
              />
              <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full shadow-sm">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">
                {profileData.name}
              </h2>
              <p className="text-sm text-gray-600">{profileData.email}</p>
              <button className="text-blue-600 text-sm font-medium mt-1 flex items-center gap-1">
                <Edit3 className="h-3 w-3" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-3">
          {settingsSections.map(section => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onNavigateToSection(section.id)}
                className="w-full bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onNavigateToSection('data')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onNavigateToSection('data')}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

// PersonalInformation.tsx - Personal Info Settings
export const PersonalInformation: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const { user, setUser } = useWardrobe(); // Get current user from context
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
  });

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.user_metadata?.full_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update user metadata in Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.displayName,
        },
      });

      if (error) {
        console.error('Error updating profile:', error);
        alert('Error saving profile. Please try again.');
        return;
      }

      // Update local context with new user data
      if (data.user) {
        setUser(data.user);
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={e =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              placeholder="Email cannot be changed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email address cannot be changed from this screen
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </>
  );
};

// PrivacySettings.tsx - Privacy & Security Settings
export const PrivacySettings: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const [settings, setSettings] = useState({
    profileVisibility: 'friends',
    allowSearch: true,
    shareOutfits: false,
    dataSharing: false,
    twoFactor: false,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Privacy & Security
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Visibility */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Profile Visibility</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can see your profile?
            </label>
            <select
              value={settings.profileVisibility}
              onChange={e =>
                setSettings({ ...settings, profileVisibility: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="private">Just Me</option>
            </select>
          </div>
        </div>

        {/* Privacy Toggles */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-900">Privacy Settings</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Allow search</p>
              <p className="text-sm text-gray-600">
                Let others find you by email or username
              </p>
            </div>
            <button
              onClick={() => toggleSetting('allowSearch')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.allowSearch ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowSearch ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                Share outfits publicly
              </p>
              <p className="text-sm text-gray-600">
                Allow others to see and get inspired by your outfits
              </p>
            </div>
            <button
              onClick={() => toggleSetting('shareOutfits')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.shareOutfits ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.shareOutfits ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-gray-600">
                Add extra security to your account
              </p>
            </div>
            <button
              onClick={() => toggleSetting('twoFactor')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.twoFactor ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.twoFactor ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// DataManagement.tsx - Export and Delete Data
export const DataManagement: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      // Trigger download
      alert('Data export started! You will receive an email when ready.');
    }, 2000);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Data Management
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Export Data */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Export Your Data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Download a copy of all your wardrobe data including outfits, items,
            and photos.
          </p>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Preparing Export...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </div>

        {/* Clear Cache */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Clear Cache</h3>
          <p className="text-sm text-gray-600 mb-4">
            Clear temporary files and cached images to free up storage space.
          </p>
          <Button variant="outline" className="w-full">
            Clear Cache
          </Button>
        </div>

        {/* Delete Account */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
          <p className="text-sm text-red-700 mb-4">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="font-semibold text-gray-900 mb-2">
                Are you sure?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This will permanently delete your account and all your wardrobe
                data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileSettings;
