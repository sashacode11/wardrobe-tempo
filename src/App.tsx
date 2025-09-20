import { Suspense } from 'react';
import { useRoutes, Routes, Route } from 'react-router-dom';
import Home from './components/home';
import AuthCallback from './components/AuthCallback';
import routes from 'tempo-routes';
import { WardrobeProvider } from './contexts/WardrobeContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <WardrobeProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>

          {/* 🔔 Toast notifications appear globally */}
          <Toaster
            position="top-center"
            richColors // enables built-in success/error styling
            duration={3000} // auto-dismiss after 3 seconds
            closeButton // show "X" button
            expand={false} // don't expand on hover
            visibleToasts={3} // max visible at once
          />

          {import.meta.env.VITE_TEMPO === 'true' && useRoutes(routes)}
        </>
      </Suspense>
    </WardrobeProvider>
  );
}

export default App;
