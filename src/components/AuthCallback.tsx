import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // This processes the access_token from the URL fragment
      const { error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error handling Supabase OAuth callback:', error.message);
        return;
      }

      // Optional: Wait a moment to allow session propagation (sometimes helps in dev)
      setTimeout(() => navigate('/'), 100);
    };

    handleOAuthCallback();
  }, [navigate]);

  return <p>Logging in... Please wait.</p>;
};

export default AuthCallback;
