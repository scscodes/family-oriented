import { useAppStore } from './appStore';
import { useShallow } from 'zustand/react/shallow';

/**
 * Optimized selectors for common state access patterns
 * These selectors use useShallow to prevent unnecessary re-renders
 */

// Auth selectors
export const useAuthState = () => useAppStore(
  useShallow((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated(),
    loading: state.loading.user,
    error: state.error,
  }))
);

export const useUserProfile = () => useAppStore(
  useShallow((state) => ({
    userProfile: state.userProfile,
    org: state.org,
    roles: state.roles,
  }))
);

// Avatar selectors
export const useAvatarState = () => useAppStore(
  useShallow((state) => ({
    avatars: state.avatars,
    currentAvatar: state.currentAvatar,
    loading: state.loading.avatars,
  }))
);

// Theme selectors
export const useThemeState = () => useAppStore(
  useShallow((state) => ({
    currentTheme: state.currentTheme,
    themeConfig: state.themeConfig,
  }))
);

// Settings selectors
export const useGameSettings = () => useAppStore((state) => state.settings);

// Demo selectors
export const useDemoState = () => useAppStore(
  useShallow((state) => ({
    isDemoMode: state.isDemoMode,
    demoScenario: state.demoScenario,
    isTransitioning: state.isDemoTransitioning,
  }))
);

// Loading selectors
export const useLoadingStates = () => useAppStore((state) => state.loading);
export const useIsFullyLoaded = () => useAppStore((state) => state.isFullyLoaded());
export const useIsHydrated = () => useAppStore((state) => state.isHydrated);

// Permission selectors
export const usePermissions = () => {
  const hasRole = useAppStore((state) => state.hasRole);
  const canAccess = useAppStore((state) => state.canAccess);
  const getTierLimit = useAppStore((state) => state.getTierLimit);
  
  return { hasRole, canAccess, getTierLimit };
};

// View-as selectors
export const useViewAsState = () => useAppStore(
  useShallow((state) => ({
    viewAsRole: state.viewAsRole,
    viewAsAvatar: state.viewAsAvatar,
    isViewAs: state.isViewAs,
  }))
);

// Combined selectors for complex components
export const useDashboardData = () => useAppStore(
  useShallow((state) => ({
    user: state.user,
    currentAvatar: state.currentAvatar,
    org: state.org,
    roles: state.roles,
    isFullyLoaded: state.isFullyLoaded(),
  }))
);

export const useGamePageData = () => useAppStore(
  useShallow((state) => ({
    settings: state.settings,
    currentAvatar: state.currentAvatar,
    themeConfig: state.themeConfig,
  }))
); 