import { styled, Card, CardContent } from '@mui/material';
import { borderRadius, shadows, transitions } from '@/theme/tokens';

/**
 * Base styled card with consistent elevation and hover effects
 * Replaces repetitive inline sx props for cards
 */
export const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: borderRadius.lg,
  boxShadow: shadows.card,
  backgroundColor: theme.palette.background.paper,
  transition: `transform ${transitions.duration.normal}, box-shadow ${transitions.duration.normal}`,
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: shadows.cardHover,
  },
  
  '&:focus-within': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
}));

/**
 * Game card variant with enhanced hover effects and proper spacing
 * Used for game selection and navigation cards
 */
export const StyledGameCard = styled(StyledCard)(({ theme }) => ({
  cursor: 'pointer',
  transition: `all ${transitions.duration.normal}`,
  
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: shadows.cardHover,
  },
  
  '&:active': {
    transform: 'translateY(-2px) scale(1.01)',
    boxShadow: shadows.card,
  },
  
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
    transform: 'translateY(-2px)',
  },
}));

/**
 * Feature card for homepage sections with background gradient
 * Uses theme primary colors for consistent hierarchy
 */
export const StyledFeatureCard = styled(StyledCard)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}40)`,
  border: `2px solid ${theme.palette.primary.main}40`,
  textAlign: 'center',
  padding: theme.spacing(3),
  
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}30, ${theme.palette.primary.dark}50)`,
    border: `2px solid ${theme.palette.primary.main}50`,
    transform: 'translateY(-2px)',
  },
}));

/**
 * Styled card content with consistent padding
 */
export const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
})); 