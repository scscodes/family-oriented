# User Management Components

This directory contains comprehensive user management components for the Family-Oriented Educational Game Platform. These components provide a complete interface for managing users, roles, invitations, and avatar assignments.

## Components Overview

### Core User Management Components

#### `UserInvitationDialog`
- **Purpose**: Modal dialog for inviting new users to the organization
- **Features**:
  - Email validation with existing patterns
  - Role assignment during invitation
  - Custom invitation message
  - Subscription tier checking
  - Form validation with react-hook-form
- **Props**:
  - `open`: boolean - Controls dialog visibility
  - `onClose`: () => void - Close handler
  - `onInvite`: (data: InvitationFormData) => Promise<void> - Invitation handler

#### `InvitationList`
- **Purpose**: Displays and manages pending invitations
- **Features**:
  - Pending vs. other invitation status grouping
  - Resend and cancel actions
  - Expiration time display
  - Role display with color coding
  - Refresh functionality
- **Props**:
  - `invitations`: Invitation[] - List of invitations
  - `loading`: boolean - Loading state
  - `error`: string | null - Error state
  - `onResendInvitation`: (id: string) => Promise<void>
  - `onCancelInvitation`: (id: string) => Promise<void>
  - `onRefresh`: () => void

#### `UserList`
- **Purpose**: Enhanced user list with search, filtering, and management actions
- **Features**:
  - Search by name or email
  - Filter by status and role
  - Pagination support
  - User avatars with initials
  - Role and status chips
  - Action menu for each user
- **Props**:
  - `users`: User[] - List of users
  - `loading`: boolean - Loading state
  - `error`: string | null - Error state
  - `onEditUser`: (userId: string) => void
  - `onRemoveUser`: (userId: string) => void
  - `onAssignAvatar`: (userId: string) => void

#### `RoleAssignmentDialog`
- **Purpose**: Modal dialog for assigning and modifying user roles
- **Features**:
  - Role hierarchy validation
  - Permission-based role availability
  - Changes summary display
  - Account owner protection
  - Form validation
- **Props**:
  - `open`: boolean - Controls dialog visibility
  - `onClose`: () => void - Close handler
  - `user`: User | null - Target user
  - `onSave`: (userId: string, roles: string[]) => Promise<void>

#### `UserRemovalDialog`
- **Purpose**: Safe user removal with data handling options
- **Features**:
  - Multiple removal types (deactivate, transfer, delete)
  - Data transfer options
  - Confirmation with email verification
  - Warning for permanent deletion
  - User data summary
- **Props**:
  - `open`: boolean - Controls dialog visibility
  - `onClose`: () => void - Close handler
  - `user`: User | null - Target user
  - `availableUsers`: User[] - Users available for data transfer
  - `onRemove`: (userId: string, data: UserRemovalFormData) => Promise<void>

#### `AvatarAssignmentDialog`
- **Purpose**: Interface for assigning avatars to users
- **Features**:
  - Visual avatar selection with cards
  - Assignment status display
  - Subscription limit checking
  - User selection (if not targeting specific user)
  - Assignment summary
- **Props**:
  - `open`: boolean - Controls dialog visibility
  - `onClose`: () => void - Close handler
  - `targetUser`: User | null - Target user (optional)
  - `avatars`: Avatar[] - Available avatars
  - `availableUsers`: User[] - Users available for assignment
  - `onAssign`: (avatarId: string, userId: string) => Promise<void>

## Data Interfaces

### User Interface
```typescript
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
```

### Invitation Interface
```typescript
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
```

### Avatar Interface
```typescript
interface Avatar {
  id: string;
  name: string;
  imageUrl?: string;
  assignedTo?: string;
  createdAt: string;
}
```

## Usage Example

```tsx
import {
  UserInvitationDialog,
  InvitationList,
  UserList,
  RoleAssignmentDialog,
  UserRemovalDialog,
  AvatarAssignmentDialog
} from '@/features/account/components';

function UserManagementPage() {
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const handleInviteUser = async (data: InvitationFormData) => {
    // API call to send invitation
    const newInvitation = await api.sendInvitation(data);
    setInvitations(prev => [newInvitation, ...prev]);
  };

  return (
    <div>
      <UserList
        users={users}
        onEditUser={(userId) => setSelectedUser(userId)}
        onRemoveUser={(userId) => setRemovalDialogOpen(true)}
        onAssignAvatar={(userId) => setAvatarDialogOpen(true)}
      />
      
      <UserInvitationDialog
        open={invitationDialogOpen}
        onClose={() => setInvitationDialogOpen(false)}
        onInvite={handleInviteUser}
      />
    </div>
  );
}
```

## Features

### Role-Based Access Control
- All components check user permissions before rendering
- Role hierarchy validation prevents privilege escalation
- Account owner protection prevents accidental removal

### Subscription Integration
- Feature gating based on subscription tier
- Avatar limit checking
- Upgrade recommendations for locked features

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- Proper ARIA labels and descriptions

### Form Validation
- React Hook Form integration
- Email validation with existing patterns
- Required field validation
- Custom validation rules

### Error Handling
- Comprehensive error states
- User-friendly error messages
- Loading states for async operations
- Graceful fallbacks

## Integration Notes

1. **API Integration**: All components include TODO comments for API integration points
2. **Mock Data**: Components work with mock data for development
3. **Subscription Service**: Integrates with existing subscription service
4. **Theme**: Uses Material-UI components following existing patterns
5. **State Management**: Designed to work with existing Zustand store

## Future Enhancements

- Bulk operations for enterprise users
- Advanced filtering and sorting
- Audit logging for user actions
- Real-time updates with WebSocket
- Export functionality for user data
- Advanced role permissions system 