"use client";

import { useEffect, useState } from 'react';
import { useUser, useAvatar, useRoleGuard } from '@/context/UserContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Box, Typography, Paper, Button, List, ListItem, ListItemText, Chip, CircularProgress, Alert } from '@mui/material';
import ViewAs from '@/components/ViewAs';


/**
 * User Management Dashboard
 * - Lists users in the org, their roles, and avatars
 * - Allows inviting users, assigning roles, and managing avatars
 * - Only accessible to account_owner and org_admin
 * - Includes ViewAs component for role switching
 * - Uses role guard to prevent flashing and ensure secure access
 */
export default function UserManagementDashboard() {
  const { org } = useUser();
  const { avatars, createAvatar } = useAvatar();
  const { hasRole, isReady } = useRoleGuard();
  const { canAccessFeature, canCreateAvatar, formatFeatureMessage } = useSubscription();
  const [users, setUsers] = useState<Array<{
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!org || !isReady) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        // Fetch all users in the org
        const supabase = (await import('@/lib/supabase/client')).createClient();
        const { data, error } = await supabase
          .from('users')
          .select('id, email, first_name, last_name')
          .eq('org_id', org.id);
        if (error) throw error;
        setUsers(data || []);
      } catch {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [org, isReady]);

  // Show loading state while role check is happening
  if (!isReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check permissions once everything is loaded
  if (!hasRole('account_owner') && !hasRole('org_admin')) {
    return <Alert severity="error">You do not have permission to view this page.</Alert>;
  }

  // Check if user management feature is available for their subscription tier
  const userManagementAccess = canAccessFeature('user_management');

  return (
    <Box maxWidth="md" mx="auto" py={4}>
      <Typography variant="h4" gutterBottom>User Management</Typography>

      {/* Feature gate check */}
      {!userManagementAccess.allowed && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {formatFeatureMessage(userManagementAccess, 'User Management')}
        </Alert>
      )}
      
      {/* View As Component for role switching */}
      <ViewAs />
      
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Organization: {org?.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          Subscription Tier: {org?.subscriptionPlan?.tier || 'N/A'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Avatar Limit: {org?.subscriptionPlan?.avatar_limit || 'N/A'}
        </Typography>
      </Paper>
      
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Users in Organization</Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <List>
            {users.map(u => (
              <ListItem key={u.id}>
                <ListItemText
                  primary={`${u.first_name || ''} ${u.last_name || ''} (${u.email})`}
                  secondary={`User ID: ${u.id}`}
                />
                {/* TODO: Show roles for each user, allow role assignment */}
                <Chip label="Role(s)" color="primary" size="small" sx={{ ml: 2 }} />
              </ListItem>
            ))}
          </List>
        )}
        {/* TODO: Add invite user and role assignment UI */}
        <Button variant="contained" sx={{ mt: 2 }}>Invite User</Button>
      </Paper>
      
      <Paper sx={{ p: 2 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Avatars ({avatars.length})</Typography>
        <List>
          {avatars.map(a => (
            <ListItem key={a.id}>
              <ListItemText primary={a.name} secondary={`Avatar ID: ${a.id}`} />
              {/* TODO: Add avatar management actions */}
            </ListItem>
          ))}
        </List>
        
        {/* Avatar Creation with Subscription Limits */}
        <Box sx={{ mt: 2 }}>
          {(() => {
            const avatarCreationResult = canCreateAvatar();
            
            if (avatarCreationResult.allowed) {
              return (
                <Button 
                  variant="outlined" 
                  onClick={async () => {
                    const avatarName = prompt('Enter avatar name:');
                    if (avatarName?.trim()) {
                      await createAvatar(avatarName.trim());
                    }
                  }}
                >
                  Create Avatar
                </Button>
              );
            } else {
              return (
                <Box>
                  <Button variant="outlined" disabled>
                    Create Avatar (Limit Reached)
                  </Button>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    {formatFeatureMessage(avatarCreationResult)}
                  </Alert>
                </Box>
              );
            }
          })()}
        </Box>
      </Paper>
    </Box>
  );
} 