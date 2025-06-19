"use client";

import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { states } from './data';
import { InteractiveMap } from '../components/InteractiveMap';
import GameContainer from '@/features/games/GameContainer';

/**
 * States display page component
 * Shows a grid of US states with their names and maps
 */
export default function StatesPage() {
  return (
    <GameContainer title="US States">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 4,
            mt: 2
          }}>
            {states.map((state) => (
              <Paper 
                key={state.code}
                elevation={2} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {state.name}
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: '200px',
                  position: 'relative'
                }}>
                  <InteractiveMap
                    geoUrl={state.geoUrl}
                    width={300}
                    height={200}
                    filter={(geo) => geo.properties.name === state.name}
                    center={state.center}
                    zoom={state.zoom}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Container>
    </GameContainer>
  );
} 