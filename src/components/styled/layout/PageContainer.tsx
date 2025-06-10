import { styled, Container, Box } from '@mui/material';
import { layout, spacing } from '@/theme/tokens';

/**
 * Standard page container with responsive padding and max width
 * Replaces repetitive Container styling across pages
 */
export const PageContainer = styled(Container)(({ theme }) => ({
  maxWidth: layout.maxWidth['7xl'],
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingTop: spacing.lg,
  paddingBottom: spacing.lg,
  paddingLeft: spacing.lg,
  paddingRight: spacing.lg,
  
  [theme.breakpoints.down('sm')]: {
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
  
  [theme.breakpoints.up('lg')]: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
  },
}));

/**
 * Game-specific layout container with optimal width for game content
 * Used for game pages and interactive content
 */
export const GameLayout = styled(Container)(({ theme }) => ({
  maxWidth: layout.maxWidth['5xl'],
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingTop: spacing.lg,
  paddingBottom: spacing.lg,
  paddingLeft: spacing.lg,
  paddingRight: spacing.lg,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  
  [theme.breakpoints.down('sm')]: {
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
}));

/**
 * Header section with consistent spacing and background
 * Used for page headers with breadcrumbs and titles
 */
export const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2, 0),
  
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(2),
  },
}));

/**
 * Content section with proper spacing and accessibility
 */
export const ContentSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
    borderRadius: theme.shape.borderRadius,
  },
}));

/**
 * Footer section with consistent spacing
 */
export const FooterSection = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: theme.spacing(4),
  borderTop: `1px solid ${theme.palette.divider}`,
  textAlign: 'center',
})); 