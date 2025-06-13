import { Dialog } from '@mui/material';
import { GameWizard } from './GameWizard';

interface GameWizardDialogProps {
  open: boolean;
  onClose: () => void;
}

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
          bgcolor: 'background.paper'
        }
      }}
    >
      <GameWizard onClose={onClose} />
    </Dialog>
  );
} 