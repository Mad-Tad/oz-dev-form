'use client';

import { useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';

export default function GoogleSignInPage() {
  const supabase = createClient();

  useEffect(() => {
    const handleSignIn = async () => {
      // The redirectTo from sessionStorage is set by useAuthNavigation
      const redirectTo = sessionStorage.getItem('redirectTo') || '/';
      
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });
    };
    handleSignIn();
  }, [supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#1e88e5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Redirecting to Google...</p>
        </div>
    </div>
  );
} 