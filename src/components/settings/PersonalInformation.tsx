import { useWardrobe } from '@/contexts/WardrobeContext';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';
import { supabase } from '@/lib/supabaseClient';

// PersonalInformation.tsx - Personal Info Settings
export const PersonalInformation: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const { user, setUser } = useWardrobe(); // Get current user from context
  //   const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
  });
  // const { updateProfile, saving } = useProfileUpdate();
  const [saving, setSaving] = useState(false);

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
      console.log('Direct call - attempting to update profile');
      console.log('User ID:', user.id);
      console.log('Display name:', formData.displayName);

      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.displayName,
        },
      });

      console.log('Direct call result:', { data, error });

      if (error) {
        console.error('Direct call error:', error);
        alert(`Error: ${error.message}`);
        return;
      }

      if (data.user) {
        setUser(data.user);
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Direct call catch:', error);
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
