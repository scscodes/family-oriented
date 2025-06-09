import React from "react";
import { Box, SxProps, Theme } from "@mui/material";

/**
 * ResponsiveOptionGrid
 *
 * Usage:
 * <ResponsiveOptionGrid count={options.length}>
 *   {options.map(...)}
 * </ResponsiveOptionGrid>
 *
 * Lays out children in a responsive grid, adapting columns to count and screen size.
 */
export default function ResponsiveOptionGrid({ children, count, sx }: {
  children: React.ReactNode;
  count: number;
  sx?: SxProps<Theme>;
}) {
  // For 2: always 2 columns. For 3: 1fr on xs, 3 columns on sm+. For 4+: 2 on xs, 4 on sm+.
  const columns = `repeat(${count}, minmax(0, 1fr))`;
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, sm: 3 },
        gridTemplateColumns: columns,
        maxWidth: { xs: 340, sm: 600, md: 800 },
        mx: 'auto',
        my: 2,
        boxSizing: 'border-box',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
} 