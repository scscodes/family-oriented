import React, { useState } from 'react';
import { Menu, MenuItem, IconButton, Avatar, Divider, ListItemIcon, ListItemText, Typography, Box, CircularProgress } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import { useUser, useAvatar, useRoleGuard } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

/**
 * Profile/account menu for global navigation and account actions
 * Uses role guard to prevent flashing of restricted menu items
 */
export default function ProfileMenu() {
  const { loadingState, userProfile, org, signOut, isViewAs, resetViewAs } = useUser();
  const { currentAvatar } = useAvatar();
  const { hasRole, isReady } = useRoleGuard();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const goTo = (path: string) => {
    handleClose();
    router.push(path);
  };

  // Early return if contexts are not ready to prevent infinite renders
  if (!loadingState.isReady) {
    return (
      <IconButton size="small" sx={{ ml: 1 }} disabled>
        <Avatar sx={{ width: 36, height: 36 }}>
          <CircularProgress size={20} />
        </Avatar>
      </IconButton>
    );
  }

  return (
    <>
      <IconButton onClick={handleMenu} size="small" sx={{ ml: 1 }}>
        <Avatar sx={{ width: 36, height: 36 }}>
          {currentAvatar?.name?.[0] || userProfile?.email?.[0] || 'U'}
        </Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} onClick={handleClose} PaperProps={{ sx: { minWidth: 240 } }}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {userProfile?.email || 'User'}
          </Typography>
          {org && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {org.name} &mdash; {org.subscriptionPlan?.tier || 'Tier'}
            </Typography>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={() => goTo('/dashboard')}>
          <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        {/* Only show user management if ready and has permission */}
        {isReady && (hasRole('account_owner') || hasRole('org_admin')) && (
          <MenuItem onClick={() => goTo('/dashboard/user-management')}>
            <ListItemIcon><GroupIcon fontSize="small" /></ListItemIcon>
            <ListItemText>User Management</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => goTo('/dashboard')}>
          <ListItemIcon><SwitchAccountIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View As...</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => goTo('/settings')}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Game Settings</ListItemText>
        </MenuItem>
        <Divider />
        {/* Only show exit view as if actually in view as mode */}
        {isViewAs && (
          <MenuItem onClick={resetViewAs} sx={{ color: 'warning.main' }}>
            <ListItemIcon><SwitchAccountIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Exit View As</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={signOut} sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
} 