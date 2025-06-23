/**
 * Unified Debug Banner
 * Consolidates all debug functionality into a single, compact banner
 * Combines: Hydration status + Subscription info + Scenario switching
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Select,
  MenuItem,
  IconButton,
  Modal,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Divider,
  Tooltip,
  FormControl,
  SelectChangeEvent
} from '@mui/material';
import {
  BugReport,
  Settings,
  Warning,
  Refresh,
  Science,
  AdminPanelSettings,
  Close
} from '@mui/icons-material';
import { useUser } from '@/context/UserContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useEnhancedTheme } from '@/theme/EnhancedThemeProvider';
import { useDemo } from '@/context/DemoContext';
import DemoTransitionPreview from './DemoTransitionPreview';

/**
 * Detect if we're in development/demo environment
 */
function isDevelopmentMode(): boolean {
  const isDev = process.env.NODE_ENV === 'development';
  const hasDemo = process.env.NEXT_PUBLIC_DEMO_SCENARIO !== undefined;
  const hasDebugFlag = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('.local'));
  
  const isDevPort = typeof window !== 'undefined' && 
    (window.location.port === '3000' || window.location.port === '3001');
  
  return isDev || hasDemo || hasDebugFlag || isLocalhost || isDevPort;
}

/**
 * Debug popup modal with detailed controls
 */
function DebugPopupContent({ 
  onClose, 
  userContext, 
  subscription, 
  loadingState, 
  hasIssues 
}: {
  onClose: () => void;
  userContext: {
    org: { name: string; subscriptionPlan?: { name?: string; tier?: string; avatar_limit?: number } | null } | null;
    avatars?: unknown[];
  };
  subscription: {
    hasFeature: (feature: string) => boolean;
    subscriptionPlan?: { avatar_limit?: number };
    tier?: string;
  };
  loadingState: {
    user: boolean;
    roles: boolean;
    avatars: boolean;
    isReady: boolean;
  };
  hasIssues: boolean;
}) {
  const demoContext = useDemo();
  const { availableScenarios, switchScenario, isTransitioning, error, clearError } = demoContext;
  const [selectedScenario, setSelectedScenario] = useState('');
  const [previewScenario, setPreviewScenario] = useState<string | null>(null);

  const handleScenarioChange = async (event: SelectChangeEvent<string>) => {
    const scenarioKey = event.target.value as string;
    setSelectedScenario(scenarioKey);
    
    try {
      clearError();
      await switchScenario(scenarioKey);
    } catch (err) {
      console.error('Failed to switch scenario:', err);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: '90vw', sm: '80vw', md: '70vw' },
      maxWidth: 800,
      maxHeight: '90vh',
      overflow: 'auto',
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 24
    }}>
      <Card>
        <CardContent>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6">
              🧪 Development Debug Console
            </Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Stack>

          {/* Issues Alert */}
          {hasIssues && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Issues Detected:</Typography>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {!userContext.org && <li>Organization data is null</li>}
                {!subscription.subscriptionPlan && <li>Subscription plan is null</li>}
                {!subscription.tier && <li>Subscription tier is null</li>}
                {!loadingState.isReady && <li>Loading state not ready</li>}
              </ul>
            </Alert>
          )}

          {/* Quick Actions */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              Refresh App
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AdminPanelSettings />}
              onClick={() => console.log('UserContext State:', userContext)}
            >
              Log Context
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Science />}
              onClick={() => console.log('Subscription State:', subscription)}
            >
              Log Subscription
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* Demo Context Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Demo Error: {error}
              </Typography>
            </Alert>
          )}

          {/* Scenario Switcher */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Demo Scenario Switcher
              {isTransitioning && (
                <Typography variant="caption" sx={{ ml: 1, color: 'info.main' }}>
                  🔄 Switching...
                </Typography>
              )}
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedScenario}
                onChange={handleScenarioChange}
                displayEmpty
                disabled={isTransitioning}
              >
                <MenuItem value="" disabled>
                  {isTransitioning ? 'Switching Scenario...' : 'Switch to Different Scenario'}
                </MenuItem>
                {availableScenarios.map((scenario: { key: string; label: string; description: string }) => (
                  <MenuItem 
                    key={scenario.key} 
                    value={scenario.key}
                    onMouseEnter={() => setPreviewScenario(scenario.key)}
                    onMouseLeave={() => setPreviewScenario(null)}
                  >
                    {scenario.label}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({scenario.description})
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Transition Preview */}
            {previewScenario && previewScenario !== demoContext.currentScenario && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'grey.200' }}>
                <Typography variant="caption" color="primary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Preview Changes:
                </Typography>
                <DemoTransitionPreview targetScenarioKey={previewScenario} />
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Detailed Debug Info */}
          <Stack spacing={2}>
            {/* Hydration State */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Hydration State
              </Typography>
              <Box sx={{ 
                fontSize: '11px', 
                fontFamily: 'monospace', 
                bgcolor: 'grey.100', 
                p: 1, 
                borderRadius: 1 
              }}>
                {JSON.stringify(loadingState, null, 2)}
              </Box>
            </Box>

            {/* Organization Info */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Organization & Subscription
              </Typography>
              <Box sx={{ 
                fontSize: '11px', 
                fontFamily: 'monospace', 
                bgcolor: 'grey.100', 
                p: 1, 
                borderRadius: 1 
              }}>
                {userContext.org ? (
                  <>
                    <div>Name: {userContext.org.name}</div>
                    <div>Plan: {userContext.org.subscriptionPlan?.name || 'None'}</div>
                    <div>Tier: {userContext.org.subscriptionPlan?.tier || 'None'}</div>
                    <div>Avatar Limit: {userContext.org.subscriptionPlan?.avatar_limit || 'N/A'}</div>
                  </>
                ) : (
                  <div style={{ color: 'red' }}>Organization: NULL</div>
                )}
              </Box>
            </Box>

            {/* Feature Access */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Feature Access
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                <Chip 
                  label={`Analytics: ${subscription.hasFeature('analytics')}`}
                  color={subscription.hasFeature('analytics') ? 'success' : 'default'}
                  size="small"
                />
                <Chip 
                  label={`User Mgmt: ${subscription.hasFeature('user_management')}`}
                  color={subscription.hasFeature('user_management') ? 'success' : 'default'}
                  size="small"
                />
                <Chip 
                  label={`Themes: ${subscription.hasFeature('premium_themes')}`}
                  color={subscription.hasFeature('premium_themes') ? 'success' : 'default'}
                  size="small"
                />
                <Chip 
                  label={`Export: ${subscription.hasFeature('export_data')}`}
                  color={subscription.hasFeature('export_data') ? 'success' : 'default'}
                  size="small"
                />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

/**
 * Main unified debug banner component
 */
export default function UnifiedDebugBanner() {
  const [debugPopupOpen, setDebugPopupOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('');
  
  const { isHydrated: themeHydrated } = useEnhancedTheme();
  const userContext = useUser();
  const subscription = useSubscription();
  
  // Always call useDemo hook at top level to avoid conditional hook calls
  let demoContext: ReturnType<typeof useDemo> | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let availableScenarios: Array<{ key: string; label: string; description: string; config: any }> = [];
  
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    demoContext = useDemo();
    availableScenarios = demoContext.availableScenarios;
  } catch {
    // Not in demo mode or provider not available
    availableScenarios = [];
  }

  const { loadingState } = userContext;
  const hasIssues = !userContext.org || !subscription.subscriptionPlan || !subscription.tier;
  
  // Include demo context issues in overall health check
  const hasDemoIssues = demoContext?.error !== null;
  const isTransitioning = demoContext?.isTransitioning || false;

  // Hydration status icons
  const hydrationStatus = useMemo(() => {
    const theme = themeHydrated ? '✅' : '⏳';
    const user = loadingState.user ? '⏳' : '✅';
    const roles = loadingState.roles ? '⏳' : '✅';
    const ready = loadingState.isReady ? '✅' : '⏳';
    return `${theme}${user}${roles}${ready}`;
  }, [themeHydrated, loadingState]);

  // Abbreviated tier display
  const tierDisplay = useMemo(() => {
    const tier = subscription.tier?.toUpperCase();
    const abbreviations: Record<string, string> = {
      'PERSONAL': 'PERS',
      'PROFESSIONAL': 'PROF', 
      'ENTERPRISE': 'ENT'
    };
    return abbreviations[tier || ''] || tier || 'NO';
  }, [subscription.tier]);

  // Abbreviated roles display
  const rolesDisplay = useMemo(() => {
    if (!userContext.roles?.length) return 'None';
    const abbreviations: Record<string, string> = {
      'account_owner': 'AO',
      'org_admin': 'OA',
      'educator': 'ED'
    };
    return userContext.roles
      .map(r => abbreviations[r.name] || r.name.slice(0, 2).toUpperCase())
      .join(',');
  }, [userContext.roles]);

  // Only show in development/demo environments
  if (!isDevelopmentMode()) {
    return null;
  }

  // Avatar count display
  const avatarDisplay = `${userContext.avatars?.length || 0}/${subscription.subscriptionPlan?.avatar_limit || 'N/A'}`;

  const handleQuickScenarioChange = async (event: SelectChangeEvent<string>) => {
    const scenarioKey = event.target.value as string;
    setSelectedScenario(scenarioKey);
    
    if (demoContext) {
      try {
        demoContext.clearError();
        await demoContext.switchScenario(scenarioKey);
      } catch (err) {
        console.error('Failed to switch scenario:', err);
      }
    }
  };

  return (
    <>
      {/* Fixed top banner - centered and content-width */}
      <Box sx={{ 
        position: 'fixed', 
        top: 8, 
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: hasIssues || hasDemoIssues ? 'error.light' : isTransitioning ? 'info.light' : 'warning.main',
        color: 'black',
        border: 1,
        borderColor: hasIssues || hasDemoIssues ? 'error.dark' : isTransitioning ? 'info.dark' : 'warning.dark',
        borderRadius: 1,
        zIndex: 100, // Lower z-index to avoid conflicts with navigation
        p: 0.5,
        boxShadow: 2,
        opacity: isTransitioning ? 0.8 : 1,
        transition: 'all 0.3s ease'
      }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ fontSize: '0.75rem' }}>
          {/* Debug indicator */}
          <BugReport sx={{ fontSize: 16 }} />
          
          {/* Hydration status */}
          <Tooltip title="Hydration: Theme/User/Roles/Ready" arrow>
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
              H:{hydrationStatus}
            </Box>
          </Tooltip>
          
          {/* Subscription tier */}
          <Tooltip title={`Subscription Tier: ${subscription.tier || 'None'}`} arrow>
            <Chip 
              label={tierDisplay}
              size="small" 
              color={subscription.tier ? 'success' : 'error'}
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
            />
          </Tooltip>
          
          {/* Avatar count */}
          <Tooltip title={`Avatars: ${avatarDisplay}`} arrow>
            <Box sx={{ fontFamily: 'monospace' }}>👤{avatarDisplay}</Box>
          </Tooltip>
          
          {/* Roles */}
          <Tooltip title={`Roles: ${userContext.roles?.map(r => r.name).join(', ') || 'None'}`} arrow>
            <Box sx={{ fontFamily: 'monospace' }}>🔑{rolesDisplay}</Box>
          </Tooltip>
          
          {/* Transition indicator */}
          {isTransitioning && (
            <Tooltip title="Switching demo scenario..." arrow>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                animation: 'pulse 1.5s infinite'
              }}>
                🔄
              </Box>
            </Tooltip>
          )}
          
          {/* Issue indicator */}
          {(hasIssues || hasDemoIssues) && (
            <Tooltip title={`System issues detected${hasDemoIssues ? ` - Demo: ${demoContext?.error}` : ''} - click settings for details`} arrow>
              <Warning sx={{ fontSize: 16, color: 'error.main' }} />
            </Tooltip>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Quick scenario switcher */}
          <Select 
            size="small" 
            value={selectedScenario}
            onChange={handleQuickScenarioChange}
            displayEmpty
            sx={{ 
              height: 20, 
              fontSize: '0.65rem', 
              minWidth: 100,
              '& .MuiSelect-select': { py: 0.25, px: 1 }
            }}
          >
            <MenuItem value="" disabled sx={{ fontSize: '0.65rem' }}>
              Switch Mode
            </MenuItem>
            {availableScenarios.map((scenario) => (
              <MenuItem key={scenario.key} value={scenario.key} sx={{ fontSize: '0.65rem' }}>
                {(scenario.config?.tier || '').toUpperCase()}: {scenario.config?.name || scenario.label}
              </MenuItem>
            ))}
          </Select>
          
          {/* Debug popup toggle */}
          <Tooltip title="Open Debug Console" arrow>
            <IconButton 
              size="small" 
              onClick={() => setDebugPopupOpen(true)}
              sx={{ p: 0.25 }}
            >
              <Settings sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      
      {/* Debug popup modal */}
      <Modal 
        open={debugPopupOpen} 
        onClose={() => setDebugPopupOpen(false)}
        closeAfterTransition
      >
        <DebugPopupContent
          onClose={() => setDebugPopupOpen(false)}
          userContext={userContext as {org: {name: string; subscriptionPlan?: {name?: string; tier?: string; avatar_limit?: number} | null} | null; avatars?: unknown[]}}
          subscription={subscription as {hasFeature: (feature: string) => boolean; subscriptionPlan?: {avatar_limit?: number}; tier?: string}}
          loadingState={loadingState}
          hasIssues={hasIssues}
        />
      </Modal>
    </>
  );
} 