import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait for Supabase to process the auth
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          navigate('/login');
          return;
        }

        if (data.session) {
          console.log('✅ Login successful:', data.session.user.email);
          navigate('/dashboard'); // or your main page
        } else {
          console.log('❌ No session found');
          navigate('/login');
        }
      } catch (err) {
        console.error('Callback error:', err);
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
        flexDirection: 'column',
      }}
    >
      <div>🔄 Completing login...</div>
      <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
        Please wait a moment
      </div>
    </div>
  );
}
