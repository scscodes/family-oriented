/**
 * AccountManagement Component
 * Comprehensive organization and account settings management
 * Handles organization details, user management, and account lifecycle
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  Paper,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Business,
  Person,
  Settings,
  Security,
  Delete,
  Edit,
  Save,
  Cancel,
  MoreVert,
  PersonAdd,
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material';
import { useUser, useRoleGuard } from '@/context/UserContext';
import { useSubscription } from '@/hooks/useSubscription';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/utils/logger';

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
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface OrgSettings {
  name: string;
  timezone: string;
  locale: string;
  settings: {
    allowGuestAccess: boolean;
    requireParentalConsent: boolean;
    dataRetentionMonths: number;
    analyticsEnabled: boolean;
  };
}

interface UserWithRoles {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
  last_login: string | null;
  status: 'active' | 'inactive' | 'pending';
}

/**
 * Role management component for individual users
 */
const UserRoleManager: React.FC<{
  user: UserWithRoles;
  onRoleChange: (userId: string, roles: string[]) => void;
  currentUserCanEdit: boolean;
}> = ({ user, onRoleChange, currentUserCanEdit }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editingRoles, setEditingRoles] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);

  const availableRoles = [
    { id: 'account_owner', name: 'Account Owner', description: 'Full administrative access' },
    { id: 'org_admin', name: 'Org Admin', description: 'Organization management' },
    { id: 'educator', name: 'Educator', description: 'Teaching and learning management' }
  ];

  const handleSaveRoles = () => {
    onRoleChange(user.id, selectedRoles);
    setEditingRoles(false);
  };

  return (
    <TableRow>
      <TableCell>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {user.first_name} {user.last_name} ({user.email})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {editingRoles ? (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                multiple
                value={selectedRoles}
                onChange={(e) => setSelectedRoles(e.target.value as string[])}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip 
                        key={value} 
                        label={availableRoles.find(r => r.id === value)?.name || value} 
                        size="small" 
                      />
                    ))}
                  </Box>
                )}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <ListItemText 
                      primary={role.name} 
                      secondary={role.description} 
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            user.roles.map((role) => (
              <Chip
                key={role}
                label={availableRoles.find(r => r.id === role)?.name || role}
                size="small"
                color={role === 'account_owner' ? 'primary' : role === 'org_admin' ? 'secondary' : 'default'}
              />
            ))
          )}
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={user.status.toUpperCase()}
          size="small"
          color={user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'default'}
        />
      </TableCell>
      <TableCell align="right">
        {currentUserCanEdit && (
          <>
            {editingRoles ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={handleSaveRoles}>
                  <Save />
                </IconButton>
                <IconButton size="small" onClick={() => {
                  setEditingRoles(false);
                  setSelectedRoles(user.roles);
                }}>
                  <Cancel />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <MoreVert />
              </IconButton>
            )}
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => {
                setEditingRoles(true);
                setAnchorEl(null);
              }}>
                <ListItemIcon><Edit /></ListItemIcon>
                <ListItemText>Edit Roles</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => setAnchorEl(null)}>
                <ListItemIcon><Delete /></ListItemIcon>
                <ListItemText>Remove User</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </TableCell>
    </TableRow>
  );
};

/**
 * Main account management component
 */
export default function AccountManagement() {
  const { org, user } = useUser();
  const { hasRole, isReady } = useRoleGuard();
  const { subscriptionPlan, tier } = useSubscription();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgSettings, setOrgSettings] = useState<OrgSettings | null>(null);
  const [editingSettings, setEditingSettings] = useState(false);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const supabase = createClient();

  // Load organization settings and users
  useEffect(() => {
    const loadAccountData = async () => {
      if (!org || !isReady) return;
      
      setLoading(true);
      try {
        // Load organization settings
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', org.id)
          .single();
          
        if (orgError) throw orgError;
        
        if (orgData) {
          setOrgSettings({
            name: orgData.name,
            timezone: 'UTC', // Would come from org settings
            locale: 'en-US',
            settings: {
              allowGuestAccess: false,
              requireParentalConsent: true,
              dataRetentionMonths: 12,
              analyticsEnabled: true
            }
          });
        }

        // Load users in organization
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, last_login')
          .eq('org_id', org.id);
          
        if (usersError) throw usersError;
        
        // Mock user roles (in real app, would fetch from user_policies)
        const usersWithRoles: UserWithRoles[] = (usersData || []).map(u => ({
          ...u,
          roles: u.id === user?.id ? ['account_owner', 'org_admin', 'educator'] : ['educator'],
          status: 'active' as const
        }));
        
        setUsers(usersWithRoles);
        
      } catch (err) {
        logger.error('Failed to load account data:', err);
        setError('Failed to load account information');
      } finally {
        setLoading(false);
      }
    };
    
    loadAccountData();
  }, [org, isReady, supabase, user]);

  // Handle organization settings save
  const handleSaveOrgSettings = async () => {
    if (!org || !orgSettings) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: orgSettings.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', org.id);
        
      if (error) throw error;
      
      setEditingSettings(false);
      setError(null);
    } catch (err) {
      logger.error('Failed to save organization settings:', err);
      setError('Failed to save organization settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle user role changes
  const handleUserRoleChange = async (userId: string, newRoles: string[]) => {
    setLoading(true);
    try {
      // In real app, would update user_policies table
      logger.info('User role change:', { userId, newRoles });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, roles: newRoles } : u
        )
      );
      
      setError(null);
    } catch (err) {
      logger.error('Failed to update user roles:', err);
      setError('Failed to update user roles');
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hasRole('account_owner') && !hasRole('org_admin')) {
    return (
      <Alert severity="error">
        You do not have permission to view account management.
      </Alert>
    );
  }

  return (
    <Box maxWidth="lg" mx="auto" py={4}>
      <Typography variant="h4" gutterBottom>
        Account Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Account Overview */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business sx={{ mr: 1 }} />
                <Typography variant="h6">Organization Overview</Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {org?.name || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Plan:</strong> {subscriptionPlan?.tier || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Tier:</strong> {tier?.toUpperCase() || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1 }} />
                <Typography variant="h6">Account Status</Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> <Chip label="Active" color="success" size="small" />
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Users:</strong> {users.length}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Avatar Limit:</strong> {subscriptionPlan?.avatar_limit || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={currentTab} 
          onChange={(_, newValue) => setCurrentTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label="Organization Settings" 
            icon={<Settings />}
            iconPosition="start"
          />
          <Tab 
            label="User Management" 
            icon={<Person />}
            iconPosition="start"
          />
          <Tab 
            label="Security & Privacy" 
            icon={<Security />}
            iconPosition="start"
          />
        </Tabs>

        {/* Organization Settings Tab */}
        <TabPanel value={currentTab} index={0}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Organization Settings</Typography>
                <Button
                  startIcon={editingSettings ? <Save /> : <Edit />}
                  onClick={editingSettings ? handleSaveOrgSettings : () => setEditingSettings(true)}
                  disabled={loading}
                >
                  {editingSettings ? 'Save Changes' : 'Edit Settings'}
                </Button>
              </Box>

              {orgSettings && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        label="Organization Name"
                        value={orgSettings.name}
                        onChange={(e) => setOrgSettings({
                          ...orgSettings,
                          name: e.target.value
                        })}
                        disabled={!editingSettings}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <FormControl fullWidth disabled={!editingSettings}>
                        <InputLabel>Timezone</InputLabel>
                        <Select
                          value={orgSettings.timezone}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            timezone: e.target.value
                          })}
                        >
                          <MenuItem value="UTC">UTC</MenuItem>
                          <MenuItem value="America/New_York">Eastern Time</MenuItem>
                          <MenuItem value="America/Chicago">Central Time</MenuItem>
                          <MenuItem value="America/Denver">Mountain Time</MenuItem>
                          <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <FormControl fullWidth disabled={!editingSettings}>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={orgSettings.locale}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            locale: e.target.value
                          })}
                        >
                          <MenuItem value="en-US">English (US)</MenuItem>
                          <MenuItem value="en-GB">English (UK)</MenuItem>
                          <MenuItem value="es-ES">Spanish</MenuItem>
                          <MenuItem value="fr-FR">French</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        label="Data Retention (Months)"
                        type="number"
                        value={orgSettings.settings.dataRetentionMonths}
                        onChange={(e) => setOrgSettings({
                          ...orgSettings,
                          settings: {
                            ...orgSettings.settings,
                            dataRetentionMonths: parseInt(e.target.value) || 12
                          }
                        })}
                        disabled={!editingSettings}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Privacy & Access Settings
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={orgSettings.settings.allowGuestAccess}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            settings: {
                              ...orgSettings.settings,
                              allowGuestAccess: e.target.checked
                            }
                          })}
                          disabled={!editingSettings}
                        />
                      }
                      label="Allow Guest Access"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={orgSettings.settings.requireParentalConsent}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            settings: {
                              ...orgSettings.settings,
                              requireParentalConsent: e.target.checked
                            }
                          })}
                          disabled={!editingSettings}
                        />
                      }
                      label="Require Parental Consent"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={orgSettings.settings.analyticsEnabled}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            settings: {
                              ...orgSettings.settings,
                              analyticsEnabled: e.target.checked
                            }
                          })}
                          disabled={!editingSettings}
                        />
                      }
                      label="Enable Analytics"
                    />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* User Management Tab */}
        <TabPanel value={currentTab} index={1}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Organization Users</Typography>
                <Button
                  startIcon={<PersonAdd />}
                  variant="contained"
                  onClick={() => {
                    // In a real app, this would open invite dialog
                    alert('User invitation functionality would be implemented here.');
                  }}
                >
                  Invite User
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Roles</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <UserRoleManager
                        key={user.id}
                        user={user}
                        onRoleChange={handleUserRoleChange}
                        currentUserCanEdit={hasRole('account_owner')}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Security & Privacy Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security Settings
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Two-Factor Authentication"
                        secondary="Enabled for account owners"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Encrypted Data Storage"
                        secondary="All sensitive data is encrypted"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Info color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Access Logging"
                        secondary="Available in Professional+ plans"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Data & Privacy
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="COPPA Compliant"
                        secondary="Child privacy protection enabled"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="GDPR Ready"
                        secondary="European data protection compliant"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Data Export"
                        secondary="Request data export (Contact support)"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action cannot be undone. All data 
              associated with this account will be permanently deleted.
            </Typography>
          </Alert>
          <Typography variant="body1">
            Are you sure you want to delete this account and all associated data?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              // Handle account deletion
              setDeleteConfirm(null);
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 