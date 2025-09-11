import { Suspense } from 'react';
import { useRoutes, Routes, Route } from 'react-router-dom';
import Home from './components/home';
import AuthCallback from './components/AuthCallback';
import routes from 'tempo-routes';
import { WardrobeProvider } from './contexts/WardrobeContext';

function App() {
  return (
    <WardrobeProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === 'true' && useRoutes(routes)}
        </>
      </Suspense>
    </WardrobeProvider>
  );
}

export default App;
