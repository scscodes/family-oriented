'use client';

import React, { useState } from 'react';
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
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Warning,
  Person,
  Delete,
  TransferWithinAStation,
  Archive
} from '@mui/icons-material';
import { useUser, useRoleGuard } from '@/stores/hooks';
import { useSubscription } from '@/hooks/useSubscription';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  status: 'active' | 'inactive' | 'pending';
  avatarCount: number;
  lastLogin: string | null;
}

interface UserRemovalFormData {
  removalType: 'deactivate' | 'transfer' | 'delete';
  transferToUser?: string;
  confirmationText: string;
}

interface UserRemovalDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  availableUsers: User[];
  onRemove: (userId: string, data: UserRemovalFormData) => Promise<void>;
}

const REMOVAL_OPTIONS = [
  {
    value: 'deactivate',
    label: 'Deactivate User',
    description: 'User account will be disabled but data preserved',
    icon: Archive,
    color: 'warning' as const
  },
  {
    value: 'transfer',
    label: 'Transfer Data & Remove',
    description: 'Transfer user\'s avatars and data to another user, then remove',
    icon: TransferWithinAStation,
    color: 'info' as const
  },
  {
    value: 'delete',
    label: 'Permanently Delete',
    description: 'Completely remove user and all associated data (irreversible)',
    icon: Delete,
    color: 'error' as const
  }
];

/**
 * User Removal Dialog
 * Provides safe user removal with data handling options and confirmation
 */
export default function UserRemovalDialog({
  open,
  onClose,
  user,
  availableUsers,
  onRemove
}: UserRemovalDialogProps) {
  const { hasRole } = useRoleGuard();
  const { canAccessFeature, formatFeatureMessage } = useSubscription();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<UserRemovalFormData>({
    defaultValues: {
      removalType: 'deactivate',
      transferToUser: '',
      confirmationText: ''
    },
    mode: 'onChange'
  });

  const selectedRemovalType = watch('removalType');
  const transferToUser = watch('transferToUser');

  // Check permissions
  const canRemoveUsers = hasRole('account_owner') || hasRole('org_admin');
  const userManagementAccess = canAccessFeature('user_management');

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmit = async (data: UserRemovalFormData) => {
    if (!user || !canRemoveUsers) {
      setError('You do not have permission to remove users');
      return;
    }

    // Validate transfer user selection
    if (data.removalType === 'transfer' && !data.transferToUser) {
      setError('Please select a user to transfer data to');
      return;
    }

    // Validate confirmation text
    if (data.confirmationText !== user.email) {
      setError('Please enter the user\'s email address to confirm');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onRemove(user.id, data);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Don't render if user doesn't have permission
  if (!canRemoveUsers) {
    return null;
  }

  if (!user) {
    return null;
  }

  // Filter out the current user from transfer options
  const transferOptions = availableUsers.filter(u => u.id !== user.id);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          <Typography variant="h6" component="div">
            Remove User
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Choose how to handle this user and their data
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
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight="medium">
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role.replace('_', ' ')}
                      size="small"
                      color={role === 'account_owner' ? 'error' : role === 'org_admin' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                  {user.avatarCount} avatars
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last login: {formatDate(user.lastLogin)}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Removal type selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Removal Method
              </Typography>
              <Controller
                name="removalType"
                control={control}
                rules={{ required: 'Please select a removal method' }}
                render={({ field }) => (
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup {...field}>
                      {REMOVAL_OPTIONS.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <FormControlLabel
                            key={option.value}
                            value={option.value}
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconComponent color={option.color} />
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {option.label}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {option.description}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                            sx={{ 
                              border: 1, 
                              borderColor: 'divider', 
                              borderRadius: 1, 
                              p: 1, 
                              mb: 1,
                              '&:hover': { bgcolor: 'grey.50' }
                            }}
                          />
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </Box>

            {/* Transfer user selection */}
            {selectedRemovalType === 'transfer' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Transfer Data To
                </Typography>
                <Controller
                  name="transferToUser"
                  control={control}
                  rules={{ 
                    required: selectedRemovalType === 'transfer' ? 'Please select a user to transfer data to' : false
                  }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.transferToUser}>
                      <RadioGroup {...field}>
                        {transferOptions.map((transferUser) => (
                          <FormControlLabel
                            key={transferUser.id}
                            value={transferUser.id}
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {getInitials(transferUser.firstName, transferUser.lastName)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {transferUser.firstName} {transferUser.lastName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {transferUser.email} • {transferUser.avatarCount} avatars
                                  </Typography>
                                </Box>
                              </Box>
                            }
                            sx={{ 
                              border: 1, 
                              borderColor: 'divider', 
                              borderRadius: 1, 
                              p: 1, 
                              mb: 1,
                              '&:hover': { bgcolor: 'grey.50' }
                            }}
                          />
                        ))}
                      </RadioGroup>
                      {errors.transferToUser && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {errors.transferToUser.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            )}

            {/* Data summary */}
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Data Summary:</strong>
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                • {user.avatarCount} avatars and associated data
              </Typography>
              <Typography variant="caption" display="block">
                • User profile and settings
              </Typography>
              <Typography variant="caption" display="block">
                • Activity history and analytics
              </Typography>
              {selectedRemovalType === 'transfer' && transferToUser && (
                <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'medium' }}>
                  This data will be transferred to the selected user
                </Typography>
              )}
            </Alert>

            <Divider />

            {/* Confirmation */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Confirmation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                To confirm this action, please enter the user's email address: <strong>{user.email}</strong>
              </Typography>
              <Controller
                name="confirmationText"
                control={control}
                rules={{ 
                  required: 'Please enter the email address to confirm',
                  validate: (value) => value === user.email || 'Email address does not match'
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Enter email address to confirm"
                    fullWidth
                    error={!!errors.confirmationText}
                    helperText={errors.confirmationText?.message}
                    disabled={isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            {/* Warning for permanent deletion */}
            {selectedRemovalType === 'delete' && (
              <Alert severity="error">
                <Typography variant="body2">
                  <strong>Warning:</strong> This action is permanent and cannot be undone. 
                  All user data, avatars, and activity history will be permanently deleted.
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
          color={selectedRemovalType === 'delete' ? 'error' : 'primary'}
          disabled={isSubmitting || !isValid || !userManagementAccess.allowed}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isSubmitting ? 'Processing...' : `Remove User`}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 