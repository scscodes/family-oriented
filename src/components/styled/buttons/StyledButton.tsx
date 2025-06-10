import { styled, Button, IconButton } from '@mui/material';
import { borderRadius, spacing, transitions, accessibility } from '@/theme/tokens';

/**
 * Enhanced styled button with consistent design tokens
 * Replaces inline button styling across the application
 */
export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: borderRadius.xl,
  padding: `${spacing.sm}px ${spacing.lg}px`,
  fontWeight: 500,
  textTransform: 'none',
  minHeight: accessibility.touchTarget.minSize,
  transition: `all ${transitions.duration.normal}`,
  
  '&:focus-visible': {
    outline: `${accessibility.focusRing.width} ${accessibility.focusRing.style} ${accessibility.focusRing.color}`,
    outlineOffset: '2px',
  },
  
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
    opacity: 0.6,
  },
}));

/**
 * Primary action button with gradient background
 */
export const PrimaryButton = styled(StyledButton)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.info.main} 90%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.info.dark} 90%)`,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-1px)',
  },
  
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
}));

/**
 * Secondary action button with outline style
 */
export const SecondaryButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  border: `2px solid ${theme.palette.primary.main}`,
  color: theme.palette.primary.main,
  
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}10`,
    borderColor: theme.palette.primary.dark,
    color: theme.palette.primary.dark,
  },
}));

/**
 * Enhanced icon button with proper touch targets and focus states
 */
export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  minHeight: accessibility.touchTarget.minSize,
  minWidth: accessibility.touchTarget.minSize,
  borderRadius: borderRadius.md,
  transition: `all ${transitions.duration.normal}`,
  color: theme.palette.primary.main,
  
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}10`,
    transform: 'scale(1.05)',
  },
  
  '&:focus-visible': {
    outline: `${accessibility.focusRing.width} ${accessibility.focusRing.style} ${accessibility.focusRing.color}`,
    outlineOffset: '2px',
  },
  
  '&:active': {
    transform: 'scale(0.95)',
  },
}));

/**
 * Floating action button with enhanced shadows
 */
export const FloatingButton = styled(StyledButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  borderRadius: '50%',
  width: '56px',
  height: '56px',
  minWidth: '56px',
  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  zIndex: theme.zIndex?.fab || 1050,
  
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.2)',
  },
  
  [theme.breakpoints.down('sm')]: {
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    width: '48px',
    height: '48px',
    minWidth: '48px',
  },
}));

/**
 * Navigation button for breadcrumbs and navigation
 */
export const NavButton = styled(StyledIconButton)(({ theme }) => ({
  backgroundColor: `${theme.palette.background.paper}90`,
  backdropFilter: 'blur(10px)',
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
  },
})); 