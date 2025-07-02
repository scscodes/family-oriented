'use client';

import React, { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Button
} from '@mui/material';
import {
  Search,
  MoreVert,
  Edit,
  Delete,
  Person,
  AccessTime,
  FilterList,
  Clear
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
  lastLogin: string | null;
  avatarCount: number;
  createdAt: string;
}

interface UserListProps {
  users: User[];
  loading?: boolean;
  error?: string | null;
  onEditUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  onAssignAvatar: (userId: string) => void;
}

const ROLE_COLORS = {
  account_owner: 'error',
  org_admin: 'primary',
  educator: 'secondary',
  viewer: 'default'
} as const;

const STATUS_COLORS = {
  active: 'success',
  inactive: 'default',
  pending: 'warning'
} as const;

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

/**
 * Enhanced User List Component
 * Displays users with search, filtering, pagination, and management actions
 */
export default function UserList({
  users,
  loading = false,
  error = null,
  onEditUser,
  onRemoveUser,
  onAssignAvatar
}: UserListProps) {
  const { hasRole } = useRoleGuard();
  const { canAccessFeature, formatFeatureMessage } = useSubscription();
  
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // State for action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Check permissions
  const canManageUsers = hasRole('account_owner') || hasRole('org_admin');
  const userManagementAccess = canAccessFeature('user_management');

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  // Paginate users
  const paginatedUsers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleRoleFilterChange = (event: any) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
    setPage(0);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleAction = (action: 'edit' | 'remove' | 'assignAvatar') => {
    if (!selectedUser) return;
    
    handleMenuClose();
    
    switch (action) {
      case 'edit':
        onEditUser(selectedUser.id);
        break;
      case 'remove':
        onRemoveUser(selectedUser.id);
        break;
      case 'assignAvatar':
        onAssignAvatar(selectedUser.id);
        break;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  if (!canManageUsers) {
    return null;
  }

  return (
    <Paper sx={{ p: 2 }} elevation={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="div">
          Users ({users.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredUsers.length} of {users.length}
          </Typography>
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

      {/* Search and filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={handleRoleFilterChange}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="account_owner">Account Owner</MenuItem>
            <MenuItem value="org_admin">Org Admin</MenuItem>
            <MenuItem value="educator">Educator</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </Select>
        </FormControl>

        {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
          <Button
            startIcon={<Clear />}
            onClick={handleClearFilters}
            size="small"
            variant="outlined"
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Users table */}
      {!loading && (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Avatars</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {getInitials(user.firstName, user.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {user.roles.map((role) => (
                          <Chip
                            key={role}
                            label={role.replace('_', ' ')}
                            size="small"
                            color={ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'default'}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={STATUS_COLORS[user.status]}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatDate(user.lastLogin)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.avatarCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="More actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}

      {/* Empty state */}
      {!loading && filteredUsers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
              ? 'No users match your filters'
              : 'No users found'
            }
          </Typography>
          {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
            <Button
              onClick={handleClearFilters}
              sx={{ mt: 1 }}
              variant="outlined"
              size="small"
            >
              Clear Filters
            </Button>
          )}
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
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('assignAvatar')}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Assign Avatar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('remove')}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Remove User</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
} 