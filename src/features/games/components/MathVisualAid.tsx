'use client';

import { Box, SxProps, Theme } from '@mui/material';
import { useMemo } from 'react';

interface MathVisualAidProps {
  firstNumber: number;
  secondNumber: number;
  operation: 'addition' | 'subtraction';
  sx?: SxProps<Theme>;
}

/**
 * A component that provides visual representation of numbers in math problems
 * using simple shapes to help kids count the values
 */
export default function MathVisualAid({ 
  firstNumber, 
  secondNumber, 
  operation, 
  sx 
}: MathVisualAidProps) {
  // Shapes for visualization (using CSS clip-path)
  const shapes = useMemo(() => [
    { name: 'circle', path: 'circle(50% at 50% 50%)' },
    { name: 'square', path: 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)' },
    { name: 'triangle', path: 'polygon(50% 20%, 80% 80%, 20% 80%)' },
    { name: 'diamond', path: 'polygon(50% 20%, 80% 50%, 50% 80%, 20% 50%)' },
    { name: 'hexagon', path: 'polygon(25% 20%, 75% 20%, 95% 50%, 75% 80%, 25% 80%, 5% 50%)' },
  ], []);
  
  // Select a random shape for this visualization
  const shape = useMemo(() => {
    const randomShapeIndex = Math.floor(Math.random() * shapes.length);
    return shapes[randomShapeIndex];
  }, [shapes]);
  
  // Simple representation of numbers with shapes
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 0.75,
      my: 0.5,
      justifyContent: 'center',
      ...sx
    }}>
      {/* First number representation */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        borderRadius: 1,
        border: '1px dashed rgba(0,0,0,0.1)',
        p: 0.25,
      }}>
        {Array.from({ length: firstNumber }).map((_, i) => (
          <Box
            key={`first-${i}`}
            sx={{
              width: 16,
              height: 16,
              clipPath: shape.path,
              background: 'rgba(0,0,0,0.15)',
              m: 0.25,
            }}
          />
        ))}
      </Box>
      
      {/* Operation symbol */}
      <Box sx={{ 
        fontSize: '1.25rem', 
        fontWeight: 'bold', 
        color: operation === 'addition' ? 'primary.main' : 'error.main', 
        mx: 0.25 
      }}>
        {operation === 'addition' ? '+' : '-'}
      </Box>
      
      {/* Second number representation */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        borderRadius: 1,
        border: '1px dashed rgba(0,0,0,0.1)',
        p: 0.25,
      }}>
        {Array.from({ length: secondNumber }).map((_, i) => (
          <Box
            key={`second-${i}`}
            sx={{
              width: 16,
              height: 16,
              clipPath: shape.path,
              background: 'rgba(0,0,0,0.15)',
              m: 0.25,
            }}
          />
        ))}
      </Box>
    </Box>
  );
} 