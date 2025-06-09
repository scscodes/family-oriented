"use client";

import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

/**
 * Represents a generic record of an attempt in a quiz or game.
 * Must include a correctness status and a unique key.
 */
interface AttemptRecord {
  isCorrect: boolean;
  key: string | number; // Unique key for React list rendering
}

interface AttemptHistoryFooterProps<T extends AttemptRecord> {
  /** List of previous attempts/records. */
  items: T[];
  /** Function to render the specific content of each item. */
  renderItemContent: (item: T) => ReactNode;
  /** Optional title for the history section. Defaults to "Previous attempts:". */
  title?: string;
  /** Additional styles to apply to the root container. */
  sx?: SxProps<Theme>;
}

/**
 * Displays a history of attempts with correctness indicators, suitable for various question types.
 * Uses a render prop pattern (`renderItemContent`) to customize the display of each item's specific details.
 * @template T The type of the attempt record, must extend `AttemptRecord`.
 * @param {AttemptHistoryFooterProps<T>} props - The component props.
 */
export default function AttemptHistoryFooter<T extends AttemptRecord>({
  items,
  renderItemContent,
  title = "",
  sx
}: AttemptHistoryFooterProps<T>) {
  // Don't render anything if there are no items to display
  if (!items || items.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        mt: 4, // Default margin top, can be overridden by sx prop
        maxWidth: 700, // Max width for the container
        mx: 'auto', // Center the container
        ...sx // Merge additional styles
      }}
    >
      {/* Optional Title */}
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ mb: 1 }} // Margin bottom for spacing
      >
        {title}
      </Typography>

      {/* List Container */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.0, // Space between items
        width: '100%',
        maxWidth: 600, // Max width for the list itself
        mx: 'auto' // Center the list within the container
      }}>
        {/* Map through items, reversing to show newest first */}
        {[...items].reverse().map((item) => (
          <Box
            key={item.key} // Use the unique key provided in the item data
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2, // Space between icon and content
              p: 1.0, // Padding inside the item box
              borderRadius: 1, // Rounded corners
              // Background color based on correctness
              bgcolor: item.isCorrect ? 'success.light' : 'error.light',
              color: 'white', // Text color for contrast
              opacity: 0.7, // Slight transparency
              transition: 'opacity 0.3s ease-in-out',
              '&:hover': {
                opacity: 1 // Become fully opaque on hover
              }
            }}
          >
            {/* Correctness Indicator Icon (Check or Cross) */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%', // Circular background
              bgcolor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white background
              fontSize: '1.5rem', // Icon size
              flexShrink: 0 // Prevent icon from shrinking
            }}>
              {item.isCorrect ? '✓' : '✗'}
            </Box>

            {/* Render custom item content using the provided function */}
            {renderItemContent(item)}

          </Box>
        ))}
      </Box>
    </Box>
  );
} 