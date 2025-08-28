import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // This handles both hash and query parameters
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          navigate('/login');
          return;
        }

        if (data.session) {
          console.log('Login successful:', data.session.user);
          navigate('/dashboard'); // or wherever you want to redirect
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div>Completing login...</div>
    </div>
  );
}
