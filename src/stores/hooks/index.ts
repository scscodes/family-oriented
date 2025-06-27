/**
 * Hook adapters for Zustand store
 * These maintain the same API as the old context hooks for easier migration
 */

import { useAppStore } from '../appStore';
import { useShallow } from 'zustand/react/shallow';

// User hook adapter
export function useUser() {
  const {
    user,
    userProfile,
    roles,
    org,
    avatars,
    currentAvatar,
    viewAsRole,
    viewAsAvatar,
    isViewAs,
    loading,
    error,
    setCurrentAvatar,
    createAvatar,
    signOut,
    hasRole,
    canAccess,
    getTierLimit,
    setViewAsRole,
    setViewAsAvatar,
    resetViewAs,
    isFullyLoaded,
    setAvatars,
  } = useAppStore(
    useShallow((state) => ({
      user: state.user,
      userProfile: state.userProfile,
      roles: state.roles,
      org: state.org,
      avatars: state.avatars,
      currentAvatar: state.currentAvatar,
      viewAsRole: state.viewAsRole,
      viewAsAvatar: state.viewAsAvatar,
      isViewAs: state.isViewAs,
      loading: state.loading.user,
      error: state.error,
      setCurrentAvatar: state.setCurrentAvatar,
      createAvatar: state.createAvatar,
      signOut: state.signOut,
      hasRole: state.hasRole,
      canAccess: state.canAccess,
      getTierLimit: state.getTierLimit,
      setViewAsRole: state.setViewAsRole,
      setViewAsAvatar: state.setViewAsAvatar,
      resetViewAs: state.resetViewAs,
      isFullyLoaded: state.isFullyLoaded,
      setAvatars: state.setAvatars,
    }))
  );

  // Create loadingState object to match old API
  const loadingState = {
    user: loading,
    roles: useAppStore((state) => state.loading.roles),
    avatars: useAppStore((state) => state.loading.avatars),
    isReady: isFullyLoaded(),
  };

  // Return object matching ExtendedUserContextType
  return {
    user,
    userProfile,
    roles,
    org,
    avatars,
    currentAvatar,
    viewAsRole,
    viewAsAvatar,
    isViewAs,
    loading,
    loadingState,
    error,
    setCurrentAvatar,
    createAvatar,
    refreshAvatars: async () => {
      // This will be implemented with Supabase integration
      console.log('Refreshing avatars...');
    },
    signOut,
    hasRole,
    canAccess,
    getTierLimit,
    setViewAsRole,
    setViewAsAvatar,
    resetViewAs,
  };
}

// Theme hook adapter
export function useEnhancedTheme() {
  const { currentTheme, themeConfig, setTheme, isHydrated } = useAppStore(
    useShallow((state) => ({
      currentTheme: state.currentTheme,
      themeConfig: state.themeConfig,
      setTheme: state.setTheme,
      isHydrated: state.isHydrated,
    }))
  );

  // Get all theme variants
  const availableThemes = useAppStore.getState().themeConfig ? 
    { [currentTheme]: themeConfig } : {};

  return {
    currentTheme,
    themeConfig,
    setTheme,
    availableThemes,
    isHydrated,
  };
}

// Settings hook adapter
export function useSettings() {
  const { settings, updateSettings, resetSettings } = useAppStore(
    useShallow((state) => ({
      settings: state.settings,
      updateSettings: state.updateSettings,
      resetSettings: state.resetSettings,
    }))
  );

  return {
    settings,
    updateSettings,
    resetToDefaults: resetSettings,
  };
}

// Demo hook adapter
export function useDemo() {
  const {
    isDemoMode,
    demoConfig,
    demoScenario,
    isDemoTransitioning,
    initializeDemo,
    transitionDemo,
    exitDemoMode,
  } = useAppStore(
    useShallow((state) => ({
      isDemoMode: state.isDemoMode,
      demoConfig: state.demoConfig,
      demoScenario: state.demoScenario,
      isDemoTransitioning: state.isDemoTransitioning,
      initializeDemo: state.initializeDemo,
      transitionDemo: state.transitionDemo,
      exitDemoMode: state.exitDemoMode,
    }))
  );

  return {
    isDemoMode,
    currentConfig: demoConfig,
    currentScenario: demoScenario,
    isTransitioning: isDemoTransitioning,
    error: null, // Simplified for now
    initializeDemo,
    transitionToScenario: transitionDemo,
    exitDemo: exitDemoMode,
  };
}

// Avatar hook adapter (matching the old useAvatar)
export function useAvatar() {
  const { currentAvatar, setCurrentAvatar, avatars, createAvatar } = useAppStore(
    useShallow((state) => ({
      currentAvatar: state.currentAvatar,
      setCurrentAvatar: state.setCurrentAvatar,
      avatars: state.avatars,
      createAvatar: state.createAvatar,
    }))
  );

  return {
    currentAvatar,
    setCurrentAvatar,
    avatars,
    createAvatar,
  };
}

// Role guard hook adapter
export function useRoleGuard() {
  const { hasRole, canAccess, roles, loadingState } = useUser();

  return {
    hasRole,
    canAccess,
    roles,
    loadingState,
  };
}

// Heading colors hook adapter
export function useHeadingColors() {
  const { themeConfig } = useEnhancedTheme();
  return themeConfig;
}

// Hydration check hook
export function useIsHydrated() {
  return useAppStore((state) => state.isHydrated);
} 