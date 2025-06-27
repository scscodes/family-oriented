'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Collapse,
  Alert,
  Stack,
  Button,
  Chip
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  AccountBox,
  ContentCopy,
  Delete
} from '@mui/icons-material';
import { getTestAccounts, clearTestAccounts } from '@/utils/testAccountStorage';
import { ClientOnlyWrapper } from '@/shared/components/HydrationGatedUI';

interface TestAccountListProps {
  onAccountSelect?: (email: string, password: string) => void;
}

/**
 * Development-only component showing available test accounts
 * Only renders in development environment
 */
export function TestAccountList({ onAccountSelect }: TestAccountListProps) {
  const [expanded, setExpanded] = useState(false);
  const [accounts, setAccounts] = useState<ReturnType<typeof getTestAccounts>>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  useEffect(() => {
    setAccounts(getTestAccounts());
  }, [expanded]);

  const handleCopyCredentials = async (email: string, password: string) => {
    const credentials = `Email: ${email}\nPassword: ${password}`;
    try {
      await navigator.clipboard.writeText(credentials);
      setCopiedText(email);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.warn('Failed to copy credentials:', err);
    }
  };

  const handleClearAccounts = () => {
    clearTestAccounts();
    setAccounts([]);
  };

  const handleAccountSelect = (email: string, password: string) => {
    if (onAccountSelect) {
      onAccountSelect(email, password);
    }
  };

  return (
    <ClientOnlyWrapper>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 2, 
          backgroundColor: 'rgba(76, 175, 80, 0.08)',
          border: '1px solid rgba(76, 175, 80, 0.2)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBox color="success" fontSize="small" />
          <Typography variant="subtitle2" color="success.main">
            Test Accounts ({accounts.length})
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
            {accounts.length === 0 ? (
              <Alert severity="info">
                No test accounts found. Create one by registering with a test email domain.
              </Alert>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Click an account to auto-fill login:
                  </Typography>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<Delete />}
                    onClick={handleClearAccounts}
                  >
                    Clear All
                  </Button>
                </Box>

                <Stack direction="column" gap={1}>
                  {accounts.map((account, index) => (
                    <Paper
                      key={index}
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        backgroundColor: copiedText === account.email ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 0, 0, 0.02)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                      onClick={() => handleAccountSelect(account.email, account.password)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {account.firstName} {account.lastName}
                          </Typography>
                          <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                            {account.email}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Chip 
                              label={account.tier} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              Created: {new Date(account.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCredentials(account.email, account.password);
                          }}
                        >
                          <ContentCopy fontSize="inherit" />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Stack>

                {copiedText && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Copied credentials for: {copiedText}
                  </Alert>
                )}
              </>
            )}
          </Box>
        </Collapse>
      </Paper>
    </ClientOnlyWrapper>
  );
} 