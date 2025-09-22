// components/settings/SwitchAccountModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useWardrobe } from '../../contexts/WardrobeContext';
import { signOut } from '../../lib/supabaseClient';
import { X, ChevronLeft, Plus, Check, UserCircle } from 'lucide-react';

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedAccount {
  id: string;
  email: string;
  avatar?: string;
  full_name?: string;
  isActive: boolean;
}

const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, setUser } = useWardrobe();
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  // Detect if we're on desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Load saved accounts from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saved-accounts');
      if (saved) {
        const accounts = JSON.parse(saved);
        setSavedAccounts(accounts);
      } else {
        // If no saved accounts, create one for current user
        if (user) {
          const currentAccount: SavedAccount = {
            id: user.id,
            email: user.email || '',
            avatar: user.avatar,
            full_name: user.user_metadata?.full_name,
            isActive: true,
          };
          setSavedAccounts([currentAccount]);
          localStorage.setItem(
            'saved-accounts',
            JSON.stringify([currentAccount])
          );
        }
      }
    }
  }, [user]);

  const handleSwitchAccount = async (account: SavedAccount) => {
    // Here you would implement the actual account switching logic
    // For now, we'll just update the UI to show the selected account
    const updatedAccounts = savedAccounts.map(acc => ({
      ...acc,
      isActive: acc.id === account.id,
    }));
    setSavedAccounts(updatedAccounts);
    localStorage.setItem('saved-accounts', JSON.stringify(updatedAccounts));

    console.log('Switching to account:', account.email);
    // You would implement actual authentication switching here
    onClose();
  };

  const handleAddAccount = () => {
    // Trigger the auth dialog to add a new account
    window.dispatchEvent(new CustomEvent('showAuth'));
    onClose();
  };

  const handleRemoveAccount = () => {
    console.log('Navigate to remove account page');
    // You can implement a separate modal or page for removing accounts
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) return email;

    const visibleStart = localPart.slice(0, 3);
    const visibleEnd = localPart.slice(-2);
    const masked = '*'.repeat(Math.max(0, localPart.length - 5));

    return `${visibleStart}${masked}${visibleEnd}@${domain}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-0 right-0 h-full z-50 bg-white shadow-2xl transform transition-all duration-300 ease-out ${
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              Switch Accounts
            </h2>
          </div>
          {isDesktop && (
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto h-full">
          {/* Description */}
          <div className="p-6 pb-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              You can switch to the following accounts that you have already
              used to sign in.
            </p>
          </div>

          {/* Accounts List */}
          <div className="px-6 space-y-3">
            {savedAccounts.map(account => (
              <button
                key={account.id}
                onClick={() => handleSwitchAccount(account)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors relative"
              >
                {/* Avatar */}
                <div className="relative">
                  {account.avatar ? (
                    <img
                      src={account.avatar}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover bg-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircle className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  {/* Google badge (if applicable) */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-200">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"></div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 text-base">
                    {maskEmail(account.email)}
                  </p>
                  {account.full_name && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {account.full_name}
                    </p>
                  )}
                </div>

                {/* Active indicator */}
                {account.isActive && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}

            {/* Add Account Button */}
            <button
              onClick={handleAddAccount}
              className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 text-base">
                  Add Account
                </p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-auto p-6 border-t border-gray-100">
            <button
              onClick={handleRemoveAccount}
              className="w-full text-center py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-base font-medium">Remove an Account</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SwitchAccountModal;
