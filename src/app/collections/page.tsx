/**
 * Collections Page - Game Collections & Saved Content
 */
'use client';

import React from 'react';
import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { useEnhancedTheme } from '@/stores/hooks';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Collections page component
 */
export default function CollectionsPage() {
  // Only access what we actually use
  const { themeConfig } = useEnhancedTheme();
  const { canAccessFeature } = useSubscription();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 700,
          color: themeConfig.primary
        }}>
          Collections
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Organize and save your favorite games and learning content.
        </Typography>

        {/* Feature access check */}
        {!canAccessFeature('collections').allowed && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Collections feature requires a subscription upgrade.
          </Alert>
        )}

        {/* Collections content */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Collections
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Collections functionality is coming soon! This will allow you to organize and save your favorite educational content.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 