import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { logger } from '@/utils/logger';
import { themeVariants } from '@/theme/theme';

// Type definitions
type Avatar = Database['public']['Tables']['avatars']['Row'];
type UserProfile = Database['public']['Tables']['users']['Row'];

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  avatar_limit: number;
  features_included: any;
  [key: string]: any;
}

interface OrgInfo {
  id: string;
  name: string;
  subscriptionPlan: SubscriptionPlan | null;
}

// Demo configuration
interface DemoConfig {
  id: string;
  email: string;
  name: string;
  tier: 'personal' | 'professional' | 'enterprise';
  orgName: string;
  avatarLimit: number;
  hasAnalytics: boolean;
  hasAdvancedFeatures: boolean;
  hasUnlimitedAccess: boolean;
}

// Settings types
interface GameSettings {
  // General settings
  questionsPerSession: number;
  
  // Numbers game settings
  numberRange: {
    min: number;
    max: number;
  };
  
  // Fill in the blank settings
  wordComplexity: 'easy' | 'medium' | 'hard';
  
  // Math settings
  mathOperations: {
    addition: boolean;
    subtraction: boolean;
  };
  mathRange: {
    min: number;
    max: number;
  };
  showVisualAids: boolean;
  
  // Additional settings from original implementation
  mathUpperBound: number;
  enableNegativeNumbers: boolean;
  enableAudio: boolean;
  enableAnimations: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: string;
}

// Loading states consolidated
interface LoadingStates {
  user: boolean;
  roles: boolean;
  avatars: boolean;
  settings: boolean;
  theme: boolean;
}

// Main store interface
interface AppState {
  // User & Auth
  user: User | null;
  userProfile: UserProfile | null;
  roles: Role[];
  org: OrgInfo | null;
  
  // Avatars
  avatars: Avatar[];
  currentAvatar: Avatar | null;
  
  // View As
  viewAsRole: string | null;
  viewAsAvatar: Avatar | null;
  isViewAs: boolean;
  
  // Theme
  currentTheme: string;
  themeConfig: typeof themeVariants[keyof typeof themeVariants];
  
  // Settings
  settings: GameSettings;
  
  // Demo
  isDemoMode: boolean;
  demoConfig: DemoConfig | null;
  demoScenario: 'personal' | 'professional' | 'enterprise' | null;
  isDemoTransitioning: boolean;
  
  // Loading & Hydration
  loading: LoadingStates;
  isHydrated: boolean;
  error: string | null;
  
  // Actions - Auth
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setRoles: (roles: Role[]) => void;
  setOrg: (org: OrgInfo | null) => void;
  signOut: () => Promise<void>;
  
  // Actions - Avatars
  setAvatars: (avatars: Avatar[]) => void;
  setCurrentAvatar: (avatar: Avatar | null) => void;
  createAvatar: (name: string) => Promise<Avatar | null>;
  
  // Actions - View As
  setViewAsRole: (role: string | null) => void;
  setViewAsAvatar: (avatar: Avatar | null) => void;
  resetViewAs: () => void;
  
  // Actions - Theme
  setTheme: (theme: string) => void;
  
  // Actions - Settings
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetSettings: () => void;
  
  // Actions - Demo
  initializeDemo: (scenario: 'personal' | 'professional' | 'enterprise') => Promise<void>;
  transitionDemo: (newScenario: 'personal' | 'professional' | 'enterprise') => Promise<void>;
  exitDemoMode: () => void;
  
  // Actions - Loading & Hydration
  setLoading: (key: keyof LoadingStates, value: boolean) => void;
  setError: (error: string | null) => void;
  markHydrated: () => void;
  
  // Computed getters
  isAuthenticated: () => boolean;
  hasRole: (roleName: string) => boolean;
  canAccess: (feature: string) => boolean;
  getTierLimit: (feature: string) => number | undefined;
  isFullyLoaded: () => boolean;
}

// Default settings
const defaultSettings: GameSettings = {
  questionsPerSession: 10,
  numberRange: {
    min: 1,
    max: 20,
  },
  wordComplexity: 'easy',
  mathOperations: {
    addition: true,
    subtraction: true,
  },
  mathRange: {
    min: 1,
    max: 10,
  },
  showVisualAids: true,
  mathUpperBound: 10,
  enableNegativeNumbers: false,
  enableAudio: true,
  enableAnimations: true,
  difficulty: 'medium',
  theme: 'purple',
};

// Create the store with all middleware
export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        userProfile: null,
        roles: [],
        org: null,
        avatars: [],
        currentAvatar: null,
        viewAsRole: null,
        viewAsAvatar: null,
        isViewAs: false,
        currentTheme: 'purple',
        themeConfig: themeVariants.purple,
        settings: defaultSettings,
        isDemoMode: false,
        demoConfig: null,
        demoScenario: null,
        isDemoTransitioning: false,
        loading: {
          user: true,
          roles: true,
          avatars: true,
          settings: false,
          theme: false,
        },
        isHydrated: false,
        error: null,
        
        // Actions - Auth
        setUser: (user) => set({ user, loading: { ...get().loading, user: false } }),
        
        setUserProfile: (userProfile) => set({ userProfile }),
        
        setRoles: (roles) => set({ roles, loading: { ...get().loading, roles: false } }),
        
        setOrg: (org) => set({ org }),
        
        signOut: async () => {
          logger.info('Signing out user');
          const { currentTheme, settings } = get();
          
          set({
            user: null,
            userProfile: null,
            roles: [],
            org: null,
            avatars: [],
            currentAvatar: null,
            viewAsRole: null,
            viewAsAvatar: null,
            isViewAs: false,
            error: null,
            // Preserve theme and settings
            currentTheme,
            settings,
          });
        },
        
        // Actions - Avatars
        setAvatars: (avatars) => set((state) => ({
          avatars,
          loading: { ...state.loading, avatars: false },
          // Set first avatar as current if none selected
          currentAvatar: !state.currentAvatar && avatars.length > 0 ? avatars[0] : state.currentAvatar,
        })),
        
        setCurrentAvatar: (avatar) => set({ currentAvatar: avatar }),
        
        createAvatar: async (name) => {
          // This will be implemented with Supabase integration
          logger.info('Creating avatar:', name);
          return null;
        },
        
        // Actions - View As
        setViewAsRole: (role) => set((state) => ({
          viewAsRole: role,
          isViewAs: !!role || !!state.viewAsAvatar,
        })),
        
        setViewAsAvatar: (avatar) => set((state) => ({
          viewAsAvatar: avatar,
          isViewAs: !!avatar || !!state.viewAsRole,
        })),
        
        resetViewAs: () => set({
          viewAsRole: null,
          viewAsAvatar: null,
          isViewAs: false,
        }),
        
        // Actions - Theme
        setTheme: (theme) => {
          if (themeVariants[theme as keyof typeof themeVariants]) {
            set({
              currentTheme: theme,
              themeConfig: themeVariants[theme as keyof typeof themeVariants],
            });
          }
        },
        
        // Actions - Settings
        updateSettings: (newSettings) => set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
        
        resetSettings: () => set({ settings: defaultSettings }),
        
        // Actions - Demo
        initializeDemo: async (scenario) => {
          logger.info('Initializing demo mode:', scenario);
          // Demo implementation will be added
          set({
            isDemoMode: true,
            demoScenario: scenario,
          });
        },
        
        transitionDemo: async (newScenario) => {
          set({ isDemoTransitioning: true });
          
          // Transition logic will be added
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({
            demoScenario: newScenario,
            isDemoTransitioning: false,
          });
        },
        
        exitDemoMode: () => set({
          isDemoMode: false,
          demoConfig: null,
          demoScenario: null,
        }),
        
        // Actions - Loading & Hydration
        setLoading: (key, value) => set((state) => ({
          loading: { ...state.loading, [key]: value },
        })),
        
        setError: (error) => set({ error }),
        
        markHydrated: () => set({ isHydrated: true }),
        
        // Computed getters
        isAuthenticated: () => !!get().user,
        
        hasRole: (roleName) => {
          const { roles, viewAsRole } = get();
          if (viewAsRole) return viewAsRole === roleName;
          return roles.some(role => role.name === roleName);
        },
        
        canAccess: (feature) => {
          const { org, isDemoMode, demoConfig } = get();
          
          if (isDemoMode && demoConfig) {
            // Demo mode feature access logic
            return true; // Simplified for now
          }
          
          if (!org?.subscriptionPlan?.features_included) return false;
          return org.subscriptionPlan.features_included[feature] === true;
        },
        
        getTierLimit: (feature) => {
          const { org } = get();
          if (!org?.subscriptionPlan) return undefined;
          return org.subscriptionPlan[feature];
        },
        
        isFullyLoaded: () => {
          const { loading } = get();
          return !Object.values(loading).some(v => v === true);
        },
      }),
      {
        name: 'app-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          currentTheme: state.currentTheme,
          settings: state.settings,
          // Don't persist auth or demo state
        }),
        onRehydrateStorage: () => (state) => {
          logger.info('Rehydrating app store from localStorage');
          return () => {
            state?.markHydrated();
            logger.info('App store hydration complete');
          };
        },
      }
    )
  )
); 