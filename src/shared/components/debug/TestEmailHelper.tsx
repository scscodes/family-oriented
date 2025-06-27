'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  IconButton, 
  Collapse,
  Alert,
  Stack
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  ContentCopy, 
  Science 
} from '@mui/icons-material';
import { getTestEmailSuggestion } from '@/utils/emailValidation';
import { ClientOnlyWrapper } from '@/shared/components/HydrationGatedUI';

/**
 * Development-only helper showing available test emails
 * Only renders in development environment
 */
export function TestEmailHelper() {
  const [expanded, setExpanded] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testDomains = ['test.com', 'example.com', 'test.local', 'dev.local', 'demo.test'];
  const sampleNames = ['john', 'jane', 'test', 'demo', 'admin', 'user'];

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.warn('Failed to copy email:', err);
    }
  };

  const generateSampleEmails = () => {
    return testDomains.slice(0, 3).flatMap(domain =>
      sampleNames.slice(0, 2).map(name => `${name}@${domain}`)
    );
  };

  return (
    <ClientOnlyWrapper>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 2, 
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          border: '1px solid rgba(25, 118, 210, 0.2)'
        }}
      >
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science color="primary" fontSize="small" />
          <Typography variant="subtitle2" color="primary">
            Development Test Emails
          </Typography>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ ml: 'auto' }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              These test email domains are only accepted in development mode. 
              Use any combination with the domains below.
            </Alert>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Available test domains:
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
              {testDomains.map(domain => (
                <Chip 
                  key={domain}
                  label={`@${domain}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Quick examples (click to copy):
            </Typography>
            <Stack direction="column" gap={1}>
              {generateSampleEmails().map(email => (
                <Box
                  key={email}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: copiedEmail === email ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)'
                    }
                  }}
                  onClick={() => handleCopyEmail(email)}
                >
                  <Typography variant="body2" fontFamily="monospace">
                    {email}
                  </Typography>
                  <IconButton size="small" sx={{ ml: 'auto' }}>
                    <ContentCopy fontSize="inherit" />
                  </IconButton>
                </Box>
              ))}
            </Stack>

            {copiedEmail && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Copied: {copiedEmail}
              </Alert>
            )}
          </Box>
        </Collapse>
      </Paper>
    </ClientOnlyWrapper>
  );
} 