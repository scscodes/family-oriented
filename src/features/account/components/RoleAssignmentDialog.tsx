'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  Alert,
  CircularProgress,
  Divider,
  FormHelperText,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText as MuiListItemText
} from '@mui/material';
import { useUser, useRoleGuard } from '@/stores/hooks';
import { useSubscription } from '@/hooks/useSubscription';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  status: 'active' | 'inactive' | 'pending';
}

interface RoleAssignmentFormData {
  roles: string[];
}

interface RoleAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userId: string, roles: string[]) => Promise<void>;
}

const AVAILABLE_ROLES = [
  { 
    id: 'account_owner', 
    name: 'Account Owner', 
    description: 'Full administrative access to all features and settings',
    color: 'error' as const,
    requires: [] as string[]
  },
  { 
    id: 'org_admin', 
    name: 'Organization Admin', 
    description: 'Manage organization settings, users, and content',
    color: 'primary' as const,
    requires: [] as string[]
  },
  { 
    id: 'educator', 
    name: 'Educator', 
    description: 'Create and manage learning content and avatars',
    color: 'secondary' as const,
    requires: [] as string[]
  },
  { 
    id: 'viewer', 
    name: 'Viewer', 
    description: 'View-only access to organization content',
    color: 'default' as const,
    requires: [] as string[]
  }
];

/**
 * Role Assignment Dialog
 * Allows privileged users to assign and modify roles for other users
 * Includes role hierarchy validation and permission checking
 */
export default function RoleAssignmentDialog({
  open,
  onClose,
  user,
  onSave
}: RoleAssignmentDialogProps) {
  const { hasRole, roles: currentUserRoles } = useUser();
  const { canAccessFeature, formatFeatureMessage } = useSubscription();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<RoleAssignmentFormData>({
    defaultValues: {
      roles: []
    },
    mode: 'onChange'
  });

  const selectedRoles = watch('roles');

  // Check permissions
  const canAssignRoles = hasRole('account_owner') || hasRole('org_admin');
  const userManagementAccess = canAccessFeature('user_management');

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({ roles: user.roles });
    }
  }, [user, reset]);

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmit = async (data: RoleAssignmentFormData) => {
    if (!user || !canAssignRoles) {
      setError('You do not have permission to assign roles');
      return;
    }

    // Validate role hierarchy
    const validationError = validateRoleAssignment(data.roles, user);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(user.id, data.roles);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update roles');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateRoleAssignment = (newRoles: string[], targetUser: User): string | null => {
    // Prevent removing the last account owner
    if (targetUser.roles.includes('account_owner') && !newRoles.includes('account_owner')) {
      const accountOwners = currentUserRoles.filter(r => r.name === 'account_owner').length;
      if (accountOwners <= 1) {
        return 'Cannot remove the last account owner from the organization';
      }
    }

    // Prevent assigning account_owner role if current user is not account_owner
    if (newRoles.includes('account_owner') && !hasRole('account_owner')) {
      return 'Only account owners can assign the account owner role';
    }

    // Prevent assigning org_admin role if current user is not at least org_admin
    if (newRoles.includes('org_admin') && !hasRole('account_owner') && !hasRole('org_admin')) {
      return 'You do not have permission to assign organization admin role';
    }

    return null;
  };

  const getAvailableRolesForCurrentUser = () => {
    if (hasRole('account_owner')) {
      return AVAILABLE_ROLES;
    }
    if (hasRole('org_admin')) {
      return AVAILABLE_ROLES.filter(role => role.id !== 'account_owner');
    }
    return [];
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  // Don't render if user doesn't have permission
  if (!canAssignRoles) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Assign Roles
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage user permissions and access levels
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Feature gate check */}
        {!userManagementAccess.allowed && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {formatFeatureMessage(userManagementAccess)}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Error display */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* User info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Avatar sx={{ width: 48, height: 48 }}>
                {getInitials(user.firstName, user.lastName)}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Chip 
                  label={user.status} 
                  size="small" 
                  color={user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'default'}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Current roles */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Current Roles
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {user.roles.length > 0 ? (
                  user.roles.map((role) => {
                    const roleInfo = AVAILABLE_ROLES.find(r => r.id === role);
                    return (
                      <Chip
                        key={role}
                        label={roleInfo?.name || role}
                        size="small"
                        color={roleInfo?.color || 'default'}
                        variant="filled"
                      />
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No roles assigned
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider />

            {/* Role selection */}
            <Controller
              name="roles"
              control={control}
              rules={{ 
                required: 'At least one role must be selected',
                validate: (value) => value.length > 0 || 'At least one role must be selected'
              }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.roles}>
                  <InputLabel>Assign Roles</InputLabel>
                  <Select
                    {...field}
                    multiple
                    label="Assign Roles"
                    disabled={isSubmitting}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => {
                          const role = AVAILABLE_ROLES.find(r => r.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={role?.name || value} 
                              size="small" 
                              color={role?.color || 'default'}
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {getAvailableRolesForCurrentUser().map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                {role.name}
                              </Typography>
                              <Chip 
                                label={role.id} 
                                size="small" 
                                color={role.color}
                                variant="outlined"
                              />
                            </Box>
                          } 
                          secondary={role.description}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.roles && (
                    <FormHelperText>{errors.roles.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Role hierarchy warning */}
            {selectedRoles.includes('account_owner') && (
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Account Owner Role:</strong> This user will have full administrative access to all features, settings, and user management.
                </Typography>
              </Alert>
            )}

            {/* Changes summary */}
            {JSON.stringify(selectedRoles.sort()) !== JSON.stringify(user.roles.sort()) && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Changes:</strong> {user.roles.length} → {selectedRoles.length} roles
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Added: {selectedRoles.filter(r => !user.roles.includes(r)).join(', ') || 'None'}
                </Typography>
                <Typography variant="caption" display="block">
                  Removed: {user.roles.filter(r => !selectedRoles.includes(r)).join(', ') || 'None'}
                </Typography>
              </Alert>
            )}
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose} 
          disabled={isSubmitting}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting || !isValid || !userManagementAccess.allowed}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isSubmitting ? 'Updating Roles...' : 'Update Roles'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 