import { styled, Box } from '@mui/material';
import { spacing } from '@/theme/tokens';

interface ResponsiveGridProps {
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: number;
  minItemWidth?: string;
}

/**
 * Responsive grid with consistent spacing and breakpoint behavior
 * Replaces repetitive grid styling patterns
 */
export const ResponsiveGrid = styled(Box)<ResponsiveGridProps>(({ 
  theme, 
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 2,
  minItemWidth = '200px'
}) => ({
  display: 'grid',
  gap: theme.spacing(gap),
  gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
  
  '& > *': {
    minWidth: 0,
  },
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: `repeat(${columns.xs || 1}, 1fr)`,
    gap: theme.spacing(gap * 0.75),
  },
  
  [theme.breakpoints.between('sm', 'md')]: {
    gridTemplateColumns: `repeat(${columns.sm || 2}, 1fr)`,
  },
  
  [theme.breakpoints.between('md', 'lg')]: {
    gridTemplateColumns: `repeat(${columns.md || 3}, 1fr)`,
  },
  
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: `repeat(${columns.lg || 4}, 1fr)`,
  },
}));

/**
 * Specialized grid for game options with optimal spacing
 * Automatically adjusts based on number of options
 */
export const OptionGrid = styled(Box)<{ optionCount?: number }>(({ theme, optionCount = 4 }) => {
  const getOptimalColumns = (count: number) => {
    if (count <= 2) return { xs: 1, sm: 2, md: 2, lg: 2 };
    if (count <= 4) return { xs: 1, sm: 2, md: 2, lg: 2 };
    if (count <= 6) return { xs: 2, sm: 2, md: 3, lg: 3 };
    return { xs: 2, sm: 3, md: 4, lg: 4 };
  };
  
  const columns = getOptimalColumns(optionCount);
  
  return {
    display: 'grid',
    gap: spacing.md,
    maxWidth: '800px',
    margin: '0 auto',
    
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: `repeat(${columns.xs}, 1fr)`,
      gap: spacing.sm,
      padding: `0 ${spacing.sm}px`,
    },
    
    [theme.breakpoints.between('sm', 'md')]: {
      gridTemplateColumns: `repeat(${columns.sm}, 1fr)`,
    },
    
    [theme.breakpoints.between('md', 'lg')]: {
      gridTemplateColumns: `repeat(${columns.md}, 1fr)`,
    },
    
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: `repeat(${columns.lg}, 1fr)`,
    },
    
    '& > *': {
      minHeight: '100px',
      aspectRatio: optionCount <= 4 ? '1' : 'auto',
    },
  };
});

/**
 * Feature grid for homepage sections
 * Optimized for feature cards and content sections
 */
export const FeatureGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: spacing.xl,
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  alignItems: 'start',
  
  [theme.breakpoints.down('md')]: {
    gap: spacing.lg,
    gridTemplateColumns: '1fr',
  },
  
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  
  '& > *': {
    height: '100%',
  },
}));

/**
 * Subject grid for academic category display
 * Specialized for subject cards with icons
 */
export const SubjectGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: spacing.md,
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  marginBottom: spacing.xl,
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
  
  [theme.breakpoints.between('sm', 'lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  
  '& > *': {
    minHeight: '120px',
    transition: `all ${spacing.md * 4}ms ease-in-out`,
  },
})); 