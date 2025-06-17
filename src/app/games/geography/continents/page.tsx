"use client";

import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { continents } from './data';
import { InteractiveMap } from '../components/InteractiveMap';
import GameContainer from '@/components/GameContainer';

/**
 * Continents display page component
 * Shows a grid of continents with their names and maps
 */
export default function ContinentsPage() {
  return (
    <GameContainer title="Continents of the World">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 4,
            mt: 2
          }}>
            {continents.map((continent) => (
              <Paper 
                key={continent.code}
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
                  {continent.name}
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: '200px',
                  position: 'relative'
                }}>
                  <InteractiveMap
                    geoUrl={continent.geoUrl}
                    width={300}
                    height={200}
                    filter={continent.filter}
                    center={continent.center}
                    zoom={continent.zoom}
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