import { useState } from 'react';
import { useUser } from '@/stores/hooks';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Typography, Alert, SelectChangeEvent } from '@mui/material';

/**
 * ViewAs component
 * Allows privileged users to assume the view of any role or avatar in the org.
 * Updates UserContext to reflect the assumed role/avatar.
 * Can be used in dashboards or headers.
 */
export default function ViewAs({ onViewChange }: { onViewChange?: () => void }) {
  const {
    roles,
    hasRole,
    setViewAsRole,
    setViewAsAvatar,
    resetViewAs,
    isViewAs,
    viewAsRole,
    viewAsAvatar,
    avatars
  } = useUser();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');

  // Only show to privileged users
  if (!hasRole('account_owner') && !hasRole('org_admin') && !hasRole('educator')) {
    return null;
  }

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setSelectedRole(event.target.value);
  };

  const handleAvatarChange = (event: SelectChangeEvent<string>) => {
    setSelectedAvatar(event.target.value);
  };

  const handleSwitch = () => {
    if (selectedRole) {
      setViewAsRole(selectedRole);
    }
    if (selectedAvatar) {
      const avatar = avatars.find(a => a.id === selectedAvatar);
      if (avatar) setViewAsAvatar(avatar);
    }
    if (onViewChange) onViewChange();
  };

  const handleExitViewAs = () => {
    resetViewAs();
    setSelectedRole('');
    setSelectedAvatar('');
    if (onViewChange) onViewChange();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
      {isViewAs && (
        <Alert severity="info" sx={{ mb: 1 }}>
          Viewing as: {viewAsRole ? <b>Role: {viewAsRole}</b> : null}
          {viewAsRole && viewAsAvatar ? ' / ' : ''}
          {viewAsAvatar ? <b>Avatar: {viewAsAvatar.name}</b> : null}
          <Button onClick={handleExitViewAs} size="small" sx={{ ml: 2 }} variant="outlined">Exit View As</Button>
        </Alert>
      )}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="subtitle1">View As:</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select value={selectedRole} label="Role" onChange={handleRoleChange}>
            {roles.map(r => (
              <MenuItem key={r.id} value={r.name}>{r.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Avatar</InputLabel>
          <Select value={selectedAvatar} label="Avatar" onChange={handleAvatarChange}>
            {avatars.map(a => (
              <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleSwitch} disabled={!selectedRole && !selectedAvatar}>
          Switch
        </Button>
      </Box>
    </Box>
  );
} 