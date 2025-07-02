'use client';

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Button,
  Box,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Tooltip
} from '@mui/material';
import {
  MoreVert,
  Refresh,
  Cancel,
  Email,
  AccessTime,
  PersonAdd
} from '@mui/icons-material';
import { useUser, useRoleGuard } from '@/stores/hooks';
import { useSubscription } from '@/hooks/useSubscription';

interface Invitation {
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
}

interface InvitationListProps {
  invitations: Invitation[];
  loading?: boolean;
  error?: string | null;
  onResendInvitation: (invitationId: string) => Promise<void>;
  onCancelInvitation: (invitationId: string) => Promise<void>;
  onRefresh: () => void;
}

const ROLE_COLORS = {
  org_admin: 'primary',
  educator: 'secondary',
  viewer: 'default'
} as const;

const STATUS_COLORS = {
  pending: 'warning',
  accepted: 'success',
  expired: 'error',
  cancelled: 'default'
} as const;

/**
 * Invitation List Component
 * Displays pending invitations with management actions
 */
export default function InvitationList({
  invitations,
  loading = false,
  error = null,
  onResendInvitation,
  onCancelInvitation,
  onRefresh
}: InvitationListProps) {
  const { hasRole } = useRoleGuard();
  const { canAccessFeature, formatFeatureMessage } = useSubscription();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check permissions
  const canManageInvitations = hasRole('account_owner') || hasRole('org_admin');
  const userManagementAccess = canAccessFeature('user_management');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invitation: Invitation) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvitation(invitation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvitation(null);
  };

  const handleAction = async (action: 'resend' | 'cancel') => {
    if (!selectedInvitation) return;

    setActionLoading(selectedInvitation.id);
    handleMenuClose();

    try {
      if (action === 'resend') {
        await onResendInvitation(selectedInvitation.id);
      } else if (action === 'cancel') {
        await onCancelInvitation(selectedInvitation.id);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'Expires today';
    if (diffDays <= 3) return `Expires in ${diffDays} days`;
    return `Expires in ${diffDays} days`;
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const otherInvitations = invitations.filter(inv => inv.status !== 'pending');

  if (!canManageInvitations) {
    return null;
  }

  return (
    <Paper sx={{ p: 2 }} elevation={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">
          Invitations ({invitations.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh invitations">
            <IconButton 
              onClick={onRefresh} 
              disabled={loading}
              size="small"
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Feature gate check */}
      {!userManagementAccess.allowed && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {formatFeatureMessage(userManagementAccess)}
        </Alert>
      )}

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Pending ({pendingInvitations.length})
          </Typography>
          <List dense>
            {pendingInvitations.map((invitation) => (
              <ListItem key={invitation.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {invitation.firstName} {invitation.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({invitation.email})
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                        {invitation.roles.map((role) => (
                          <Chip
                            key={role}
                            label={role.replace('_', ' ')}
                            size="small"
                            color={ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'default'}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <AccessTime fontSize="small" />
                        <Typography variant="caption">
                          {getTimeUntilExpiry(invitation.expiresAt)}
                        </Typography>
                        <Typography variant="caption">
                          • Sent {formatDate(invitation.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, invitation)}
                    disabled={actionLoading === invitation.id}
                  >
                    {actionLoading === invitation.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <MoreVert />
                    )}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Other invitations (accepted, expired, cancelled) */}
      {otherInvitations.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Other ({otherInvitations.length})
          </Typography>
          <List dense>
            {otherInvitations.map((invitation) => (
              <ListItem key={invitation.id} sx={{ opacity: 0.7 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2">
                        {invitation.firstName} {invitation.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({invitation.email})
                      </Typography>
                      <Chip
                        label={invitation.status}
                        size="small"
                        color={STATUS_COLORS[invitation.status]}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {invitation.status === 'accepted' 
                        ? `Accepted ${formatDate(invitation.createdAt)}`
                        : `Updated ${formatDate(invitation.createdAt)}`
                      }
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Empty state */}
      {!loading && invitations.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <PersonAdd sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            No invitations found
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Invite users to get started
          </Typography>
        </Box>
      )}

      {/* Action menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 150 }
        }}
      >
        <MenuItem onClick={() => handleAction('resend')}>
          <ListItemIcon>
            <Email fontSize="small" />
          </ListItemIcon>
          Resend Invitation
        </MenuItem>
        <MenuItem onClick={() => handleAction('cancel')}>
          <ListItemIcon>
            <Cancel fontSize="small" />
          </ListItemIcon>
          Cancel Invitation
        </MenuItem>
      </Menu>
    </Paper>
  );
} 