import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  supabase,
  signInWithGoogle,
  signInWithApple,
} from '../lib/supabaseClient';
import { Eye, EyeOff, X, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import LanguageSelector from '../components/LanguageSelector';

interface AuthDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAuthSuccess?: () => void;
  defaultTab?: 'login' | 'signup';
}

const AuthDialog: React.FC<AuthDialogProps> = ({
  open = false,
  onOpenChange = () => {},
  onAuthSuccess = () => {},
  defaultTab = 'login',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [signupStep, setSignupStep] = useState(1);
  const [loginStep, setLoginStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        onAuthSuccess();
        onOpenChange(false);
        resetForm();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError('');

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred with Google sign-in');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setOauthLoading(true);
    setError('');

    try {
      const { error } = await signInWithApple();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred with Apple sign-in');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setOauthLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred with Facebook sign-in');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleContinueToPassword = () => {
    setError('');
    if (!email) {
      setError('Please enter your email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    setSignupStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        toast.warning('Check your email for the confirmation link!');
        onOpenChange(false);
        resetForm();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSignupStep(1);
    setLoginStep(1);
    setError('');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'login' | 'signup');
    setSignupStep(1);
    setLoginStep(1);
    setError('');
  };

  const handleBackToEmail = () => {
    if (activeTab === 'login') {
      setLoginStep(1);
    } else {
      setSignupStep(1);
    }
    setError('');
  };

  const handleContinueToPasswordLogin = () => {
    setError('');
    if (!email) {
      setError('Please enter your email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    setLoginStep(2);
  };

  const OAuthButtons = () => (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full border-border hover:bg-accent text-foreground h-12 rounded-md"
        onClick={handleGoogleSignIn}
        disabled={oauthLoading || loading}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {oauthLoading ? 'Connecting...' : 'Continue with Google'}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full border-border hover:bg-accent text-foreground h-12 rounded-md"
        onClick={handleAppleSignIn}
        disabled={oauthLoading || loading}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        {oauthLoading ? 'Connecting...' : 'Continue with Apple'}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full border-border hover:bg-accent text-foreground h-12 rounded-md"
        onClick={handleFacebookSignIn}
        disabled={oauthLoading || loading}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        {oauthLoading ? 'Connecting...' : 'Continue with Facebook'}
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border max-w-md h-screen sm:h-auto sm:max-w-lg p-0 gap-0 [&>button]:hidden sm:rounded-2xl sm:border overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            {((activeTab === 'signup' && signupStep === 2) ||
              (activeTab === 'login' && loginStep === 2)) && (
              <button
                onClick={handleBackToEmail}
                className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-foreground">VESTI</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-8">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-6">
            Welcome to Vesti
          </h2>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-6 bg-transparent p-0 h-auto border-b border-border">
              <TabsTrigger
                value="login"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-transparent bg-transparent text-muted-foreground data-[state=active]:text-foreground pb-3 text-base font-medium"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-transparent bg-transparent text-muted-foreground data-[state=active]:text-foreground pb-3 text-base font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-0">
              {loginStep === 1 ? (
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="login-email"
                      className="text-foreground text-sm mb-2 block"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="border border-input text-foreground placeholder:text-muted-foreground h-12 pr-10"
                      />
                      {email && (
                        <button
                          type="button"
                          onClick={() => setEmail('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive-foreground bg-destructive/10 p-3 rounded border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleContinueToPasswordLogin}
                    disabled={loading || oauthLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black dark:text-black font-semibold h-12 text-base rounded-md"
                  >
                    Continue
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="bg-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 text-sm text-muted-foreground">
                        or
                      </span>
                    </div>
                  </div>

                  <OAuthButtons />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="login-password"
                      className="text-foreground text-sm mb-2 block"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="border border-input text-foreground placeholder:text-muted-foreground h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive-foreground bg-destructive/10 p-3 rounded border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleLogin}
                    disabled={loading || oauthLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black dark:text-black font-semibold h-12 text-base rounded-md"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>

                  <div className="text-center">
                    <a
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="mt-0">
              {signupStep === 1 ? (
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="signup-email"
                      className="text-muted-foreground text-sm mb-2 block"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="border border-input text-foreground placeholder:text-muted-foreground h-12 pr-10"
                      />
                      {email && (
                        <button
                          type="button"
                          onClick={() => setEmail('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive-foreground bg-destructive/10 p-3 rounded border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleContinueToPassword}
                    disabled={loading || oauthLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black dark:text-black font-semibold h-12 text-base rounded-md"
                  >
                    Continue
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By creating an account, you agree to our{' '}
                    <a
                      href="/terms"
                      className="text-foreground underline hover:text-yellow-500"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy"
                      className="text-foreground underline hover:text-yellow-500"
                    >
                      Privacy Policy
                    </a>
                  </p>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="bg-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-4 text-sm text-muted-foreground">
                        or
                      </span>
                    </div>
                  </div>

                  <OAuthButtons />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="signup-password"
                      className="text-foreground text-sm mb-2 block"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Create a password"
                        required
                        className="border border-input text-foreground placeholder:text-muted-foreground h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="confirm-password"
                      className="text-foreground text-sm mb-2 block"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        className="border border-input text-foreground placeholder:text-muted-foreground h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive-foreground bg-destructive/10 p-3 rounded border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleSignup}
                    disabled={loading || oauthLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black dark:text-black font-semibold h-12 text-base rounded-md"
                  >
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
