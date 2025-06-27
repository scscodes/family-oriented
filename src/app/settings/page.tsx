'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/stores/hooks';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Slider, 
  FormControl, 
  FormLabel, 
  Select, 
  MenuItem, 
  Switch, 
  FormControlLabel, 
  Button,
  Tab,
  Tabs,
  Divider,
  Card,
  CardContent,
  Stack,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import { FeatureGate, SubscriptionBadge, FeatureAvailabilityChip } from '@/shared/components';
import SubscriptionStatus from '@/features/account/components/SubscriptionStatus';
import ThemeSelector from '@/shared/components/forms/ThemeSelector';
import { Download } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const { settings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [tabValue, setTabValue] = useState(0);

  // Update local settings when global settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLocalChange = (
    path: string,
    value: string | number | boolean
  ) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev };
      
      if (path.includes('.')) {
        const [parent, child] = path.split('.');
        if (parent === 'numberRange' || parent === 'mathRange') {
          newSettings[parent] = {
            ...(newSettings[parent] as { min: number; max: number }),
            [child]: value
          };
        } else if (parent === 'mathOperations') {
          newSettings[parent] = {
            ...(newSettings[parent] as { addition: boolean; subtraction: boolean }),
            [child]: value
          };
        }
      } else {
        switch (path) {
          case 'questionsPerSession':
            newSettings.questionsPerSession = value as number;
            break;
          case 'wordComplexity':
            newSettings.wordComplexity = value as 'easy' | 'medium' | 'hard';
            break;
          case 'showVisualAids':
            newSettings.showVisualAids = value as boolean;
            break;
          // Add more cases here if you add more primitive properties
          default:
            // Do nothing for object properties
            break;
        }
      }
      
      return newSettings;
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Page Header with Subscription Info */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Settings
          </Typography>
          <SubscriptionBadge variant="basic" />
        </Box>
        <Typography variant="body1" color="text.secondary">
          Customize your learning experience and manage your account
        </Typography>
      </Box>

      {/* Subscription Status Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Subscription & Account
          </Typography>
          <SubscriptionStatus />
        </CardContent>
      </Card>

      {/* Settings Sections with Feature Gating */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
        gap: 3,
        mb: 3
      }}>
        {/* Theme Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Theme & Appearance
              </Typography>
              <FeatureAvailabilityChip feature="premium_themes" showLabel={false} />
            </Box>
            
            <FeatureGate 
              feature="premium_themes" 
              mode="disable"
              fallback={
                <Box>
                  <ThemeSelector />
                  <Typography variant="caption" color="text.secondary">
                    Basic themes available
                  </Typography>
                </Box>
              }
            >
              <ThemeSelector />
              <Typography variant="caption" color="success.main">
                Premium themes unlocked!
              </Typography>
            </FeatureGate>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Advanced Settings
              </Typography>
              <FeatureAvailabilityChip feature="bulk_operations" showLabel={false} />
            </Box>
            
            <FeatureGate 
              feature="bulk_operations" 
              mode="overlay"
            >
              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch />}
                  label="Bulk operations"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Advanced scheduling"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Custom analytics"
                />
              </Stack>
            </FeatureGate>
          </CardContent>
        </Card>
      </Box>

      {/* Data Export - Full Width */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Data Export
            </Typography>
            <FeatureAvailabilityChip feature="export_data" />
          </Box>
          
          <FeatureGate 
            feature="export_data" 
            mode="alert"
            compact={true}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<Download />}>
                Export Learning Data
              </Button>
              <Button variant="outlined" startIcon={<Download />}>
                Export Progress Reports
              </Button>
            </Box>
          </FeatureGate>
        </CardContent>
      </Card>

      {/* Custom Branding (Enterprise Only) */}
      <FeatureGate 
        feature="custom_branding" 
        mode="hide"
        fallback={null}
      >
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Custom Branding
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customize the platform with your organization&apos;s branding
            </Typography>
            {/* Custom branding controls would go here */}
          </CardContent>
        </Card>
      </FeatureGate>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': { 
                fontWeight: 600, 
                py: 2,
                fontSize: '1rem'
              }
            }}
          >
            <Tab label="General" id="settings-tab-0" />
            <Tab label="Numbers" id="settings-tab-1" />
            <Tab label="Words" id="settings-tab-2" />
            <Tab label="Math" id="settings-tab-3" />
            <Tab label="Account" id="settings-tab-4" />
            <Tab label="Billing" id="settings-tab-5" />
          </Tabs>
        </Box>

        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Box>
            <Typography variant="h6" gutterBottom>General Game Settings</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel 
                id="questions-per-session-label" 
                sx={{ mb: 2, fontWeight: 600 }}
              >
                Questions Per Session
              </FormLabel>
              <Box sx={{ px: 2 }}>
                <Slider
                  aria-labelledby="questions-per-session-label"
                  value={localSettings.questionsPerSession}
                  onChange={(e, newValue) => 
                    handleLocalChange('questionsPerSession', newValue as number)
                  }
                  valueLabelDisplay="on"
                  step={1}
                  marks={[
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                    { value: 15, label: '15' },
                    { value: 20, label: '20' },
                  ]}
                  min={5}
                  max={20}
                />
              </Box>
            </FormControl>
          </Box>
        </TabPanel>

        {/* Numbers Settings */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom>Number Game Settings</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel 
                id="number-range-label" 
                sx={{ mb: 2, fontWeight: 600 }}
              >
                Number Range
              </FormLabel>
              <Box sx={{ px: 2 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Minimum: {localSettings.numberRange.min}
                </Typography>
                <Slider
                  value={localSettings.numberRange.min}
                  onChange={(e, newValue) => 
                    handleLocalChange('numberRange.min', newValue as number)
                  }
                  valueLabelDisplay="auto"
                  step={1}
                  min={1}
                  max={localSettings.numberRange.max - 1}
                />
                
                <Typography variant="body2" color="text.secondary" mt={3} mb={1}>
                  Maximum: {localSettings.numberRange.max}
                </Typography>
                <Slider
                  value={localSettings.numberRange.max}
                  onChange={(e, newValue) => 
                    handleLocalChange('numberRange.max', newValue as number)
                  }
                  valueLabelDisplay="auto"
                  step={1}
                  min={localSettings.numberRange.min + 1}
                  max={100}
                />
              </Box>
            </FormControl>
          </Box>
        </TabPanel>

        {/* Words Settings */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom>Word Game Settings</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel 
                id="word-complexity-label" 
                sx={{ mb: 2, fontWeight: 600 }}
              >
                Word Complexity
              </FormLabel>
              <Select
                labelId="word-complexity-label"
                value={localSettings.wordComplexity}
                onChange={(e) => 
                  handleLocalChange('wordComplexity', e.target.value)
                }
              >
                <MenuItem value="easy">Easy (3-4 letter words)</MenuItem>
                <MenuItem value="medium">Medium (5-6 letter words)</MenuItem>
                <MenuItem value="hard">Hard (7+ letter words)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </TabPanel>

        {/* Math Settings */}
        <TabPanel value={tabValue} index={3}>
          <Box>
            <Typography variant="h6" gutterBottom>Math Game Settings</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FormControl component="fieldset" fullWidth sx={{ mb: 4 }}>
              <FormLabel 
                component="legend" 
                sx={{ mb: 2, fontWeight: 600 }}
              >
                Operations
              </FormLabel>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.mathOperations.addition}
                      onChange={(e) => 
                        handleLocalChange('mathOperations.addition', e.target.checked)
                      }
                    />
                  }
                  label="Addition"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.mathOperations.subtraction}
                      onChange={(e) => 
                        handleLocalChange('mathOperations.subtraction', e.target.checked)
                      }
                    />
                  }
                  label="Subtraction"
                />
              </Box>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel 
                id="math-range-label" 
                sx={{ mb: 2, fontWeight: 600 }}
              >
                Number Range for Math Problems
              </FormLabel>
              <Box sx={{ px: 2 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Minimum: {localSettings.mathRange.min}
                </Typography>
                <Slider
                  value={localSettings.mathRange.min}
                  onChange={(e, newValue) => 
                    handleLocalChange('mathRange.min', newValue as number)
                  }
                  valueLabelDisplay="auto"
                  step={1}
                  min={1}
                  max={localSettings.mathRange.max - 1}
                />
                
                <Typography variant="body2" color="text.secondary" mt={3} mb={1}>
                  Maximum: {localSettings.mathRange.max}
                </Typography>
                <Slider
                  value={localSettings.mathRange.max}
                  onChange={(e, newValue) => 
                    handleLocalChange('mathRange.max', newValue as number)
                  }
                  valueLabelDisplay="auto"
                  step={1}
                  min={localSettings.mathRange.min + 1}
                  max={20}
                />
              </Box>
            </FormControl>
            
            <FormControl component="fieldset" fullWidth>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.showVisualAids}
                    onChange={(e) => 
                      handleLocalChange('showVisualAids', e.target.checked)
                    }
                  />
                }
                label="Show Visual Aids for Math Problems"
              />
            </FormControl>
          </Box>
        </TabPanel>

        {/* Account Settings */}
        <TabPanel value={tabValue} index={4}>
          <Box>
            <Typography variant="h6" gutterBottom>Account Management</Typography>
            <Divider sx={{ mb: 3 }} />
            
            {/* Account Management Component will be loaded here */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage your account settings, organization details, and user permissions.
            </Typography>
            
            {/* Dynamic import to avoid loading issues */}
            <Box sx={{ mt: 2 }}>
              {/* Note: In real implementation, import AccountManagement component */}
              <Typography variant="body1">Account management features coming soon...</Typography>
            </Box>
          </Box>
        </TabPanel>

        {/* Billing Settings */}
        <TabPanel value={tabValue} index={5}>
          <Box>
            <Typography variant="h6" gutterBottom>Billing & Subscription</Typography>
            <Divider sx={{ mb: 3 }} />
            
            {/* Billing Management Component will be loaded here */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage your subscription, view billing history, and update payment methods.
            </Typography>
            
            {/* Dynamic import to avoid loading issues */}
            <Box sx={{ mt: 2 }}>
              {/* Note: In real implementation, import BillingManagement component */}
              <Typography variant="body1">Billing management features coming soon...</Typography>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
} 