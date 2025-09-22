import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

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
