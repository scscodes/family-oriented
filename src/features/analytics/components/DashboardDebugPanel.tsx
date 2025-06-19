/**
 * Dashboard Debug Panel
 * Embedded debug controls for development and demo environments
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Collapse,
  IconButton,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Alert,
  Tooltip,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  BugReport,
  Refresh,
  Science,
  AdminPanelSettings
} from '@mui/icons-material';
import { useUser } from '@/context/UserContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getAvailableScenarios, switchDemoScenario } from '@/utils/demoConfig';



/**
 * Detect if we're in development/demo environment
 */
function isDevelopmentMode(): boolean {
  // Check multiple indicators for development/demo mode
  const isDev = process.env.NODE_ENV === 'development';
  const hasDemo = process.env.NEXT_PUBLIC_DEMO_SCENARIO !== undefined;
  const hasDebugFlag = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('.local'));
  
  // Also check for common development ports
  const isDevPort = typeof window !== 'undefined' && 
    (window.location.port === '3000' || window.location.port === '3001');
  
  return isDev || hasDemo || hasDebugFlag || isLocalhost || isDevPort;
}

export default function DashboardDebugPanel() {
  const [expanded, setExpanded] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('');
  const userContext = useUser();
  const subscription = useSubscription();
  const availableScenarios = getAvailableScenarios();

  // Only show in development/demo environments
  if (!isDevelopmentMode()) {
    return null;
  }

  const handleScenarioChange = (event: any) => {
    const scenarioKey = event.target.value as string;
    setSelectedScenario(scenarioKey);
    switchDemoScenario(scenarioKey);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const hasIssues = !userContext.org || !subscription.subscriptionPlan || !subscription.tier;

  return (
    <Card 
      sx={{ 
        mb: 2, 
        border: '2px solid',
        borderColor: hasIssues ? 'error.main' : 'warning.main',
        bgcolor: hasIssues ? 'error.50' : 'warning.50'
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Compact Header */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <BugReport color={hasIssues ? 'error' : 'warning'} />
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            🧪 Development Mode
          </Typography>
          
          {/* Quick Status Chips */}
          <Chip 
            label={subscription.tier?.toUpperCase() || 'NO TIER'} 
            color={subscription.tier ? 'success' : 'error'}
            size="small"
          />
          <Chip 
            label={`${userContext.avatars?.length || 0} Avatars`}
            color="info"
            size="small"
          />
          <Chip 
            label={userContext.roles?.length ? userContext.roles.map(r => r.name).join(', ') : 'No Roles'}
            color={userContext.roles?.length ? 'success' : 'warning'}
            size="small"
          />

          {/* Quick Scenario Switcher */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedScenario}
              onChange={handleScenarioChange}
              displayEmpty
              size="small"
            >
              <MenuItem value="" disabled>
                Switch Scenario
              </MenuItem>
              {availableScenarios.map((scenario) => (
                <MenuItem key={scenario.key} value={scenario.key}>
                  {scenario.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Expand/Collapse */}
          <Tooltip title={expanded ? "Hide Details" : "Show Debug Details"}>
            <IconButton 
              onClick={() => setExpanded(!expanded)}
              size="small"
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Issues Alert */}
        {hasIssues && !expanded && (
          <Alert severity="error" sx={{ mt: 1 }}>
            Subscription system issues detected. Click expand for details.
          </Alert>
        )}

        {/* Expandable Details */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            {/* Quick Actions */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={handleRefresh}
              >
                Refresh
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

            {/* Detailed Debug Info */}
            <Stack direction="row" spacing={3}>
              {/* Loading State */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Loading State
                </Typography>
                <Box sx={{ fontSize: '11px', fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                  {JSON.stringify(userContext.loadingState, null, 2)}
                </Box>
              </Box>

              {/* Organization Info */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Organization
                </Typography>
                <Box sx={{ fontSize: '11px', fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                  {userContext.org ? (
                    <>
                      <div>Name: {userContext.org.name}</div>
                      <div>Plan: {userContext.org.subscriptionPlan?.name || 'None'}</div>
                      <div>Tier: {userContext.org.subscriptionPlan?.tier || 'None'}</div>
                      <div>Limit: {userContext.org.subscriptionPlan?.avatar_limit || 'N/A'}</div>
                    </>
                  ) : (
                    <div style={{ color: 'red' }}>NULL</div>
                  )}
                </Box>
              </Box>

              {/* Feature Access */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Feature Access
                </Typography>
                <Stack spacing={0.5}>
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
                </Stack>
              </Box>
            </Stack>

            {/* Issues Analysis */}
            {hasIssues && (
              <Alert severity="error">
                <Typography variant="subtitle2">Issues Detected:</Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {!userContext.org && <li>Organization data is null</li>}
                  {!subscription.subscriptionPlan && <li>Subscription plan is null</li>}
                  {!subscription.tier && <li>Subscription tier is null</li>}
                  {!userContext.loadingState.isReady && <li>Loading state not ready</li>}
                </ul>
              </Alert>
            )}
          </Stack>
        </Collapse>
      </Box>
    </Card>
  );
} 