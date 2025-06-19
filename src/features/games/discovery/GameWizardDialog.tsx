import { Dialog, DialogContent, DialogTitle, IconButton, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { GameWizard } from './GameWizard';

interface GameWizardDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog wrapper for the Game Wizard with consistent sizing and clean styling
 * Prevents card-within-card nesting and maintains stable dimensions
 */
export function GameWizardDialog({ open, onClose }: GameWizardDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
          // Fixed height to prevent size changes during wizard progression
          height: { xs: '90vh', sm: '80vh', md: '70vh' },
          maxHeight: '700px',
          minHeight: '600px',
          // Ensure content doesn't overflow
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Close button in dialog title */}
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        flexShrink: 0
      }}>
        <Box /> {/* Spacer for centering */}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Dialog content with consistent sizing */}
      <DialogContent sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        pt: 0,
        overflow: 'auto'
      }}>
        <GameWizard onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
} 