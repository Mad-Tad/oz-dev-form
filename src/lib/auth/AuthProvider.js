'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { createClient } from '../supabase/client'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => {},
  redirectTo: null,
  setRedirectTo: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [redirectTo, setRedirectTo] = useState(null);
  const supabase = createClient()
  const router = useRouter()
  const passwordUpdateInProgress = useRef(false);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          const channel = new BroadcastChannel('auth-channel');
          channel.postMessage('auth-complete');
          channel.close();

          const finalRedirectTo = redirectTo || sessionStorage.getItem('redirectTo');
          // Clear any persisted redirect path as soon as we read it
          setRedirectTo(null);
          sessionStorage.removeItem('redirectTo');

          // Only redirect if we actually have a path AND it's different from the current one
          if (finalRedirectTo && finalRedirectTo !== (window.location.pathname + window.location.search)) {
            window.location.href = finalRedirectTo;
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear any stored redirect paths and auth-related data
          sessionStorage.removeItem('redirectTo');
          setRedirectTo(null);
          
          // If the user signs out, always redirect to the homepage.
          router.push('/');
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, redirectTo, router])

  useEffect(() => {
    const setPasswordForGoogleUser = async () => {
      if (passwordUpdateInProgress.current) return;
      // Ensure we have a user from any provider.
      if (user) {
        // Check a flag in user_metadata to see if we've already run this logic.
        const passwordAlreadySet = user.user_metadata?.programmatic_password_set;

        // Only proceed if the flag is not set.
        if (!passwordAlreadySet) {
          passwordUpdateInProgress.current = true;
          // This is a "dirty fix" as requested. In a real-world scenario,
          // prompting the user to set their own password is more secure.
          const tempPassword = `${user.email}_password`;

          try {
            const { error } = await supabase.auth.updateUser({
              password: tempPassword,
              data: { programmatic_password_set: true } // Set the flag
            });

            if (error) {
              throw error;
            }
          } catch (error) {
            console.error(
              "Quick-fix error: Failed to set password for user.",
              error
            );
          } finally {
            passwordUpdateInProgress.current = false;
          }
        }
      }
    };

    setPasswordForGoogleUser();
  }, [user, supabase.auth]);

  const value = {
    user,
    session,
    loading,
    setRedirectTo,
    signIn: (options) => supabase.auth.signInWithOAuth(options),
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
      // After signing out, redirect to the homepage to ensure a clean state
      router.push('/');
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 