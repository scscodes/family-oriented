import { useEffect, useState } from 'react';
import { useUser } from '@/stores/hooks';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Custom hook to handle authentication state persistence across page reloads
 * and manage token refresh and session restoration.
 */
export function useAuthPersistence() {
  const { user, loadingState, signOut } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Function to restore session on page load
    const restoreSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error restoring session:', error.message);
          await signOut();
        } else if (!data.session) {
          await signOut();
        }
      } catch (err) {
        console.error('Unexpected error restoring session:', err);
        await signOut();
      } finally {
        setIsLoading(false);
      }
    };

    // Restore session when user context is not ready
    if (!loadingState.isReady) {
      restoreSession();
    }

    // Listen for auth changes (token refresh, sign out, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        await signOut();
        router.push('/account/login');
      } else if (event === 'TOKEN_REFRESHED') {
        // Token refreshed, session is still valid
        console.log('Token refreshed');
      } else if (event === 'SIGNED_IN') {
        // User signed in, session already updated in context
        console.log('User signed in');
      }
    });

    // Cross-tab logout synchronization
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'supabase.auth.token' && !event.newValue) {
        signOut();
        router.push('/account/login');
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    // Cleanup listeners on unmount
    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [loadingState.isReady, router, signOut, supabase]);

  // Placeholder for remember me functionality
  // This can be extended to handle localStorage or cookie-based persistence
  const setRememberMe = (remember: boolean) => {
    // Implementation for remember me functionality
    console.log('Remember me functionality to be implemented', remember);
  };

  return {
    isLoading,
    setRememberMe,
  };
} 