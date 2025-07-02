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
  Grid,
  Card,
  CardContent,
  CardMedia,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Cancel,
  Assignment
} from '@mui/icons-material';
import { useUser, useRoleGuard } from '@/stores/hooks';
import { useSubscription } from '@/hooks/useSubscription';

interface Avatar {
  id: string;
  name: string;
  imageUrl?: string;
  assignedTo?: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  avatarCount: number;
}

interface AvatarAssignmentFormData {
  selectedAvatar: string;
  assignToUser: string;
}

interface AvatarAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  targetUser: User | null;
  avatars: Avatar[];
  availableUsers: User[];
  onAssign: (avatarId: string, userId: string) => Promise<void>;
}

/**
 * Avatar Assignment Dialog
 * Allows users to assign avatars to specific users
 * Includes subscription limit checking and validation
 */
export default function AvatarAssignmentDialog({
  open,
  onClose,
  targetUser,
  avatars,
  availableUsers,
  onAssign
}: AvatarAssignmentDialogProps) {
  const { hasRole } = useRoleGuard();
  const { canAccessFeature, formatFeatureMessage, canCreateAvatar } = useSubscription();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<AvatarAssignmentFormData>({
    defaultValues: {
      selectedAvatar: '',
      assignToUser: targetUser?.id || ''
    },
    mode: 'onChange'
  });

  const selectedAvatar = watch('selectedAvatar');
  const assignToUser = watch('assignToUser');

  // Check permissions
  const canAssignAvatars = hasRole('account_owner') || hasRole('org_admin') || hasRole('educator');
  const userManagementAccess = canAccessFeature('user_management');

  // Reset form when target user changes
  useEffect(() => {
    if (targetUser) {
      reset({ 
        selectedAvatar: '',
        assignToUser: targetUser.id 
      });
    }
  }, [targetUser, reset]);

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmit = async (data: AvatarAssignmentFormData) => {
    if (!canAssignAvatars) {
      setError('You do not have permission to assign avatars');
      return;
    }

    // Check if avatar is already assigned
    const avatar = avatars.find(a => a.id === data.selectedAvatar);
    if (avatar?.assignedTo && avatar.assignedTo !== data.assignToUser) {
      setError('This avatar is already assigned to another user');
      return;
    }

    // Check subscription limits for target user
    const targetUser = availableUsers.find(u => u.id === data.assignToUser);
    if (targetUser) {
      const avatarLimitResult = canCreateAvatar();
      if (!avatarLimitResult.allowed && targetUser.avatarCount >= (avatarLimitResult.limit || 0)) {
        setError(`Cannot assign avatar: ${formatFeatureMessage(avatarLimitResult)}`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAssign(data.selectedAvatar, data.assignToUser);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign avatar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const getAvatarStatus = (avatar: Avatar) => {
    if (avatar.assignedTo) {
      const assignedUser = availableUsers.find(u => u.id === avatar.assignedTo);
      return {
        status: 'assigned' as const,
        user: assignedUser,
        color: 'success' as const
      };
    }
    return {
      status: 'unassigned' as const,
      user: null,
      color: 'default' as const
    };
  };

  // Filter available avatars (unassigned or assigned to target user)
  const availableAvatars = avatars.filter(avatar => 
    !avatar.assignedTo || avatar.assignedTo === targetUser?.id
  );

  // Don't render if user doesn't have permission
  if (!canAssignAvatars) {
    return null;
  }

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
          <Assignment />
          <Typography variant="h6" component="div">
            Assign Avatar
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Assign avatars to users for learning activities
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

            {/* Target user info */}
            {targetUser && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Avatar sx={{ width: 48, height: 48 }}>
                  {getInitials(targetUser.firstName, targetUser.lastName)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {targetUser.firstName} {targetUser.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {targetUser.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {targetUser.roles.map((role) => (
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
                    {targetUser.avatarCount} avatars
                  </Typography>
                </Box>
              </Box>
            )}

            <Divider />

            {/* Avatar selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Select Avatar
              </Typography>
              {availableAvatars.length === 0 ? (
                <Alert severity="info">
                  No available avatars to assign. All avatars are currently assigned to other users.
                </Alert>
              ) : (
                <Controller
                  name="selectedAvatar"
                  control={control}
                  rules={{ required: 'Please select an avatar' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.selectedAvatar}>
                      <RadioGroup {...field}>
                        <Grid container spacing={2}>
                          {availableAvatars.map((avatar) => {
                            const status = getAvatarStatus(avatar);
                            return (
                              <Grid item xs={12} sm={6} md={4} key={avatar.id}>
                                <FormControlLabel
                                  value={avatar.id}
                                  control={<Radio />}
                                  label=""
                                  sx={{ m: 0, width: '100%' }}
                                />
                                <Card 
                                  sx={{ 
                                    cursor: 'pointer',
                                    border: field.value === avatar.id ? 2 : 1,
                                    borderColor: field.value === avatar.id ? 'primary.main' : 'divider',
                                    '&:hover': { borderColor: 'primary.main' }
                                  }}
                                  onClick={() => field.onChange(avatar.id)}
                                >
                                  <CardMedia
                                    component="img"
                                    height="120"
                                    image={avatar.imageUrl || '/api/placeholder/120/120'}
                                    alt={avatar.name}
                                    sx={{ objectFit: 'cover' }}
                                  />
                                  <CardContent sx={{ p: 1.5 }}>
                                    <Typography variant="body2" fontWeight="medium" noWrap>
                                      {avatar.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                      {status.status === 'assigned' ? (
                                        <>
                                          <CheckCircle fontSize="small" color="success" />
                                          <Typography variant="caption" color="text.secondary">
                                            Assigned to {status.user?.firstName} {status.user?.lastName}
                                          </Typography>
                                        </>
                                      ) : (
                                        <>
                                          <Cancel fontSize="small" color="action" />
                                          <Typography variant="caption" color="text.secondary">
                                            Unassigned
                                          </Typography>
                                        </>
                                      )}
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </RadioGroup>
                      {errors.selectedAvatar && (
                        <FormHelperText>{errors.selectedAvatar.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              )}
            </Box>

            {/* User selection (if not targeting specific user) */}
            {!targetUser && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Assign To User
                </Typography>
                <Controller
                  name="assignToUser"
                  control={control}
                  rules={{ required: 'Please select a user to assign the avatar to' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.assignToUser}>
                      <InputLabel>Select User</InputLabel>
                      <Select
                        {...field}
                        label="Select User"
                        disabled={isSubmitting}
                      >
                        {availableUsers.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 24, height: 24 }}>
                                {getInitials(user.firstName, user.lastName)}
                              </Avatar>
                              <ListItemText 
                                primary={`${user.firstName} ${user.lastName}`}
                                secondary={`${user.email} • ${user.avatarCount} avatars`}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.assignToUser && (
                        <FormHelperText>{errors.assignToUser.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            )}

            {/* Assignment summary */}
            {selectedAvatar && assignToUser && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Assignment Summary:</strong>
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  • Avatar: {avatars.find(a => a.id === selectedAvatar)?.name}
                </Typography>
                <Typography variant="caption" display="block">
                  • User: {availableUsers.find(u => u.id === assignToUser)?.firstName} {availableUsers.find(u => u.id === assignToUser)?.lastName}
                </Typography>
                {targetUser && (
                  <Typography variant="caption" display="block">
                    • Current avatar count: {targetUser.avatarCount} → {targetUser.avatarCount + 1}
                  </Typography>
                )}
              </Alert>
            )}

            {/* Subscription limit warning */}
            {assignToUser && (() => {
              const user = availableUsers.find(u => u.id === assignToUser);
              if (user) {
                const avatarLimitResult = canCreateAvatar();
                if (!avatarLimitResult.allowed && user.avatarCount >= (avatarLimitResult.limit || 0)) {
                  return (
                    <Alert severity="warning">
                      {formatFeatureMessage(avatarLimitResult)}
                    </Alert>
                  );
                }
              }
              return null;
            })()}
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
          disabled={isSubmitting || !isValid || !userManagementAccess.allowed || availableAvatars.length === 0}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isSubmitting ? 'Assigning...' : 'Assign Avatar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 