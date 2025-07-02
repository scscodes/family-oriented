'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  FormHelperText
} from '@mui/material';
import { useUser, useRoleGuard } from '@/stores/hooks';
import { useSubscription } from '@/hooks/useSubscription';
import { emailValidationRules } from '@/utils/emailValidation';

interface InvitationFormData {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  message?: string;
}

interface UserInvitationDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (data: InvitationFormData) => Promise<void>;
}

const AVAILABLE_ROLES = [
  { id: 'org_admin', name: 'Organization Admin', description: 'Manage organization settings and users' },
  { id: 'educator', name: 'Educator', description: 'Create and manage learning content' },
  { id: 'viewer', name: 'Viewer', description: 'View-only access to organization content' }
];

/**
 * User Invitation Dialog
 * Allows privileged users to invite new users to their organization
 * Includes role assignment and custom invitation message
 */
export default function UserInvitationDialog({ 
  open, 
  onClose, 
  onInvite 
}: UserInvitationDialogProps) {
  const { org, hasRole } = useUser();
  const { canAccessFeature, formatFeatureMessage } = useSubscription();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<InvitationFormData>({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      roles: ['viewer'],
      message: ''
    },
    mode: 'onChange'
  });

  // Check if user management feature is available
  const userManagementAccess = canAccessFeature('user_management');

  // Check if user can invite (must be account_owner or org_admin)
  const canInvite = hasRole('account_owner') || hasRole('org_admin');

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmit = async (data: InvitationFormData) => {
    if (!canInvite) {
      setError('You do not have permission to invite users');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onInvite(data);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if user doesn't have permission
  if (!canInvite) {
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
          Invite User to Organization
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {org?.name}
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

            {/* Name fields */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Box>

            {/* Email field */}
            <Controller
              name="email"
              control={control}
              rules={emailValidationRules}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isSubmitting}
                />
              )}
            />

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
                  <InputLabel>Roles</InputLabel>
                  <Select
                    {...field}
                    multiple
                    label="Roles"
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
                              color="primary"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {AVAILABLE_ROLES.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        <ListItemText 
                          primary={role.name} 
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

            <Divider />

            {/* Optional message */}
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Personal Message (Optional)"
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Add a personal message to your invitation..."
                  disabled={isSubmitting}
                />
              )}
            />

            {/* Subscription info */}
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Subscription:</strong> {org?.subscriptionPlan?.tier || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>User Limit:</strong> {org?.subscriptionPlan?.user_limit || 'Unlimited'}
              </Typography>
            </Alert>
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
          {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 