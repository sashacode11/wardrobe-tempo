// 📁 src/App.tsx
import { Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/home';
import AuthCallback from './components/AuthCallback';
import routes from 'tempo-routes';
import { WardrobeProvider } from './contexts/WardrobeContext';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabaseClient'; // 👈 Import your supabase client
import AuthDialog from './components/AuthDialog'; // 👈 Import your AuthDialog

function App() {
  // 👇 Add state to track user and loading
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 👇 Listen for auth state changes
  useEffect(() => {
    // Check if user is already logged in on app load
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <WardrobeProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            {/* If user is logged in, show Home. Otherwise, show AuthDialog */}
            <Route
              path="/"
              element={
                user ? (
                  <Home />
                ) : (
                  <AuthDialog
                    open={true}
                    onOpenChange={() => {}} // No-op since we control visibility via `user`
                    onAuthSuccess={() => {
                      // Optional: Force refresh user if needed (usually not necessary)
                      // supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
                    }}
                    defaultTab="login"
                  />
                )
              }
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>

          {/* 🔔 Toast notifications */}
          <Toaster
            position="top-center"
            richColors
            duration={3000}
            closeButton
            expand={false}
            visibleToasts={3}
          />

          {import.meta.env.VITE_TEMPO === 'true' && (
            // ⚠️ If you're using `useRoutes`, make sure it's inside a <Routes> context
            // But since you're already using <Routes>, you might not need this unless tempo-routes is critical
            // Consider removing or wrapping properly if needed
            <div>Tempo Routes Placeholder</div>
          )}
        </>
      </Suspense>
    </WardrobeProvider>
  );
}

export default App;
