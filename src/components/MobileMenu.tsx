// components/MobileMenu.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Settings,
  Plus,
  Package,
  Shirt,
  Headphones,
  User,
  LogOut,
  Camera,
  Edit3,
} from 'lucide-react';

interface MobileMenuProps {
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  user: any;
  setShowSettings: (show: boolean) => void;
  setCurrentView: (view: string) => void;
  handleAddItemClick: () => void;
  setActiveTab: (tab: string) => void;
  setShowAuthDialog: (show: boolean) => void;
  handleSignOut: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  showMobileMenu,
  setShowMobileMenu,
  user,
  setShowSettings,
  setCurrentView,
  handleAddItemClick,
  setActiveTab,
  setShowAuthDialog,
  handleSignOut,
}) => {
  if (!showMobileMenu) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={() => setShowMobileMenu(false)}
      />

      {/* Mobile Menu */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l border-border z-50 md:hidden
          transform transition-transform duration-300 ease-in-out
          ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="py-4 px-2">
            <div className="flex items-center justify-between border-b border-border">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                {user && (
                  <div className="p-2">
                    <div className="bg-muted/50 dark:bg-card rounded-lg p-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="font-semibold text-foreground">
                            {user.user_metadata?.full_name || 'User'}
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Icon */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="p-2 ml-2"
              >
                <Settings className="h-6 w-6 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {user ? (
              <div className="space-y-6">
                <div>
                  <div className="grid grid-cols-4 gap-4">
                    <button
                      onClick={handleAddItemClick}
                      className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-card dark:bg-muted rounded-xl shadow-sm border border-border flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200 relative">
                        <Plus className="h-5 w-5 text-foreground" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        Add Item
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('outfit');
                        setShowMobileMenu(false);
                      }}
                      className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-card dark:bg-muted rounded-xl shadow-sm border border-border flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200 relative">
                        <Package className="h-5 w-5 text-foreground" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        Create Outfit
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('my-outfits');
                        setShowMobileMenu(false);
                      }}
                      className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-card dark:bg-muted rounded-xl shadow-sm border border-border flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200 relative">
                        <Shirt className="h-5 w-5 text-foreground" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        My Outfits
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                      }}
                      className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-card dark:bg-muted rounded-xl shadow-sm border border-border flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200 relative">
                        <Headphones className="h-5 w-5 text-foreground" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        Customer Service
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowAuthDialog(true);
                    setShowMobileMenu(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowAuthDialog(true);
                    setShowMobileMenu(false);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          {user && (
            <div className="p-4 border-t border-border mt-auto">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
