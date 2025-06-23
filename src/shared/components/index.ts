/**
 * Shared Components Index
 * Centralized exports for all shared components
 */

export { StyledButton } from './buttons/StyledButton';
export { StyledCard } from './cards/StyledCard';
export { default as ChoiceCard } from './cards/ChoiceCard';

// Feature Gate Components
export { default as FeatureGate, FeatureAvailabilityChip } from './gates/FeatureGate';
export { default as SubscriptionBadge } from './gates/SubscriptionBadge';
export { default as UsageMeter, UsageOverview } from './gates/UsageMeter';
export { default as UnifiedDebugBanner } from './debug/UnifiedDebugBanner';

// Form Components  
export { default as SearchBar } from './forms/SearchBar';
export { default as AutocompleteSearchBar } from './forms/AutocompleteSearchBar';
export { default as ThemeSelector } from './forms/ThemeSelector';
export { default as SettingsPanel } from './forms/SettingsPanel';

// Layout Components
export { default as ResponsiveOptionGrid } from './layout/ResponsiveOptionGrid';

export { StyledGameCard, StyledFeatureCard, StyledCardContent } from './cards/StyledCard';
export { StyledChoiceCard, StyledChoiceCardAction } from './cards/ChoiceCard_styled';
export { 
  PageContainer, 
  GameLayout, 
  HeaderSection, 
  ContentSection, 
  FooterSection 
} from '../layout/PageContainer';
export { 
  ResponsiveGrid, 
  OptionGrid, 
  FeatureGrid, 
  SubjectGrid 
} from '../layout/ResponsiveGrid';
export { 
  PrimaryButton, 
  SecondaryButton, 
  FloatingButton, 
  NavButton 
} from './buttons/StyledButton'; 