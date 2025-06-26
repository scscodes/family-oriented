import React, { useState } from 'react';
import { Menu, MenuItem, IconButton, Avatar, Divider, ListItemIcon, ListItemText, Typography, Box, CircularProgress, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import LoginIcon from '@mui/icons-material/Login';
import { useUser, useAvatar, useRoleGuard } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

/**
 * Profile/account menu for global navigation and account actions
 * Uses role guard to prevent flashing protected menu items during auth checks
 */
export function ProfileMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { user, loadingState, signOut } = useUser();
  const { currentAvatar } = useAvatar();
  const { hasRole } = useRoleGuard();
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleClose();
    router.push('/account/login');
  };

  const navigateTo = (path: string) => {
    router.push(path);
    handleClose();
  };

  // Loading state during auth check
  if (!loadingState.isReady) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={24} thickness={4} />
      </Box>
    );
  }

  // Unauthenticated state - show login button
  if (!user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<LoginIcon />}
          onClick={() => router.push('/account/login')}
          sx={{ borderRadius: 2 }}
        >
          Login
        </Button>
      </Box>
    );
  }

  // Authenticated state - show profile menu
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label="Account menu"
      >
        <Avatar
          alt={user.user_metadata?.first_name || user.email || 'User'}
          sx={{ width: 32, height: 32, fontSize: '1rem' }}
        >
          {(user.user_metadata?.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, minWidth: '240px' }}>
          <Typography variant="subtitle1" noWrap>
            {user.user_metadata?.first_name} {user.user_metadata?.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => navigateTo('/dashboard')}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        {hasRole('admin') && (
          <MenuItem onClick={() => navigateTo('/dashboard/user-management')}>
            <ListItemIcon>
              <GroupIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>User Management</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => navigateTo('/settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navigateTo('/debug-subscription')}>
          <ListItemIcon>
            <SwitchAccountIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View As</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
} 