"use client";

import { useEffect, useState } from 'react';
import { useUser, useAvatar, useRoleGuard } from '@/stores/hooks';
import { useSubscription } from '@/hooks/useSubscription';
import { Box, Typography, Paper, Button, List, ListItem, ListItemText, Chip, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import ViewAs from '@/features/account/components/ViewAs';
import UserInvitationDialog from '@/features/account/components/UserInvitationDialog';
import InvitationList from '@/features/account/components/InvitationList';
import UserList from '@/features/account/components/UserList';
import RoleAssignmentDialog from '@/features/account/components/RoleAssignmentDialog';
import UserRemovalDialog from '@/features/account/components/UserRemovalDialog';
import AvatarAssignmentDialog from '@/features/account/components/AvatarAssignmentDialog';


/**
 * User Management Dashboard
 * - Lists users in the org, their roles, and avatars
 * - Allows inviting users, assigning roles, and managing avatars
 * - Only accessible to account_owner and org_admin
 * - Includes ViewAs component for role switching
 * - Uses role guard to prevent flashing and ensure secure access
 */
export default function UserManagementDashboard() {
  const { org, loadingState } = useUser();
  const { avatars, createAvatar } = useAvatar();
  const { hasRole } = useRoleGuard();
  const { canAccessFeature, canCreateAvatar, formatFeatureMessage } = useSubscription();
  
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);
  
  // State for users
  const [users, setUsers] = useState<Array<{
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    roles: string[];
    status: 'active' | 'inactive' | 'pending';
    lastLogin: string | null;
    avatarCount: number;
    createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for invitations
  const [invitations, setInvitations] = useState<Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    status: 'pending' | 'accepted' | 'expired' | 'cancelled';
    createdAt: string;
    expiresAt: string;
    invitedBy: string;
    message?: string;
  }>>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);
  
  // State for dialogs
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [removalDialogOpen, setRemovalDialogOpen] = useState(false);
  const [avatarAssignmentDialogOpen, setAvatarAssignmentDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!org || !loadingState.isReady) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        // Fetch all users in the org with enhanced data
        const supabase = (await import('@/lib/supabase/client')).createClient();
        const { data, error } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, created_at, last_sign_in_at')
          .eq('org_id', org.id);
        if (error) throw error;
        
        // Transform data to match our interface
        const transformedUsers = (data || []).map(user => ({
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          roles: ['viewer'], // TODO: Fetch actual roles from database
          status: 'active' as const, // TODO: Fetch actual status
          lastLogin: user.last_sign_in_at,
          avatarCount: 0, // TODO: Fetch actual avatar count
          createdAt: user.created_at
        }));
        
        setUsers(transformedUsers);
      } catch {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [org, loadingState.isReady]);

  // Mock data for invitations (replace with actual API calls)
  useEffect(() => {
    const fetchInvitations = async () => {
      if (!org || !loadingState.isReady) return;
      
      setInvitationsLoading(true);
      setInvitationsError(null);
      try {
        // TODO: Replace with actual API call
        const mockInvitations = [
          {
            id: 'inv-1',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            roles: ['educator'],
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            invitedBy: 'current-user-id'
          }
        ];
        setInvitations(mockInvitations);
      } catch {
        setInvitationsError('Failed to load invitations');
      } finally {
        setInvitationsLoading(false);
      }
    };
    fetchInvitations();
  }, [org, loadingState.isReady]);

  // Show loading state while role check is happening
  if (!loadingState.isReady) {
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

  // Event handlers
  const handleInviteUser = async (data: any) => {
    // TODO: Implement actual invitation API
    console.log('Inviting user:', data);
    // Mock success - in real implementation, this would call the API
    const newInvitation = {
      id: `inv-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roles,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      invitedBy: 'current-user-id'
    };
    setInvitations(prev => [newInvitation, ...prev]);
  };

  const handleResendInvitation = async (invitationId: string) => {
    // TODO: Implement resend invitation API
    console.log('Resending invitation:', invitationId);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    // TODO: Implement cancel invitation API
    console.log('Canceling invitation:', invitationId);
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    setRemovalDialogOpen(true);
  };

  const handleAssignAvatar = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    setAvatarAssignmentDialogOpen(true);
  };

  const handleSaveRoles = async (userId: string, roles: string[]) => {
    // TODO: Implement role update API
    console.log('Updating roles for user:', userId, roles);
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, roles } : user
    ));
  };

  const handleRemoveUserConfirm = async (userId: string, data: any) => {
    // TODO: Implement user removal API
    console.log('Removing user:', userId, data);
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleAssignAvatarConfirm = async (avatarId: string, userId: string) => {
    // TODO: Implement avatar assignment API
    console.log('Assigning avatar:', avatarId, 'to user:', userId);
  };

  const handleRefreshInvitations = () => {
    // TODO: Implement refresh invitations
    console.log('Refreshing invitations');
  };

  return (
    <Box maxWidth="lg" mx="auto" py={4}>
      <Typography variant="h4" gutterBottom>User Management</Typography>

      {/* Feature gate check */}
      {!userManagementAccess.allowed && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {formatFeatureMessage(userManagementAccess)}
        </Alert>
      )}
      
      {/* View As Component for role switching */}
      <ViewAs />
      
      {/* Organization Info */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>Organization: {org?.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          Subscription Tier: {org?.subscriptionPlan?.tier || 'N/A'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Avatar Limit: {org?.subscriptionPlan?.avatar_limit || 'N/A'}
        </Typography>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }} elevation={2}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label={`Users (${users.length})`} />
          <Tab label={`Invitations (${invitations.length})`} />
          <Tab label={`Avatars (${avatars.length})`} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Users</Typography>
            <Button 
              variant="contained" 
              onClick={() => setInvitationDialogOpen(true)}
              disabled={!userManagementAccess.allowed}
            >
              Invite User
            </Button>
          </Box>
          <UserList
            users={users}
            loading={loading}
            error={error}
            onEditUser={handleEditUser}
            onRemoveUser={handleRemoveUser}
            onAssignAvatar={handleAssignAvatar}
          />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Invitations</Typography>
          <InvitationList
            invitations={invitations}
            loading={invitationsLoading}
            error={invitationsError}
            onResendInvitation={handleResendInvitation}
            onCancelInvitation={handleCancelInvitation}
            onRefresh={handleRefreshInvitations}
          />
        </Box>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 2 }} elevation={2}>
          <Typography variant="h6" gutterBottom>Avatars ({avatars.length})</Typography>
          <List>
            {avatars.map(a => (
              <ListItem key={a.id}>
                <ListItemText primary={a.name} secondary={`Avatar ID: ${a.id}`} />
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
      )}

      {/* Dialogs */}
      <UserInvitationDialog
        open={invitationDialogOpen}
        onClose={() => setInvitationDialogOpen(false)}
        onInvite={handleInviteUser}
      />

      <RoleAssignmentDialog
        open={roleDialogOpen}
        onClose={() => {
          setRoleDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleSaveRoles}
      />

      <UserRemovalDialog
        open={removalDialogOpen}
        onClose={() => {
          setRemovalDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        availableUsers={users}
        onRemove={handleRemoveUserConfirm}
      />

      <AvatarAssignmentDialog
        open={avatarAssignmentDialogOpen}
        onClose={() => {
          setAvatarAssignmentDialogOpen(false);
          setSelectedUser(null);
        }}
        targetUser={selectedUser}
        avatars={avatars}
        availableUsers={users}
        onAssign={handleAssignAvatarConfirm}
      />
    </Box>
  );
} 