"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Divider,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useAvatar } from '@/hooks/useAvatar';
import { Game } from '@/utils/gameData';
import { logger } from '@/utils/logger';
import { createClient } from '@/lib/supabase/client';

interface GameCollection {
  id: string;
  name: string;
  gameIds: string[];
}

interface GameCollectionButtonProps {
  game: Game;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function GameCollectionButton({ 
  game, 
  size = 'medium', 
  showLabel = false 
}: GameCollectionButtonProps) {
  const { avatar } = useAvatar();
  const supabase = createClient();
  
  // State management
  const [collections, setCollections] = useState<GameCollection[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  /**
   * Load user's game collections
   */
  const loadCollections = useCallback(async () => {
    if (!avatar?.id) return;

    try {
      const { data, error } = await supabase
        .from('game_collections')
        .select('id, name, game_ids')
        .eq('avatar_id', avatar.id)
        .order('name');

      if (error) throw error;

      setCollections(data.map(item => ({
        id: item.id,
        name: item.name,
        gameIds: item.game_ids || []
      })));
    } catch (error) {
      logger.error('Failed to load collections:', error);
    }
  }, [avatar?.id, supabase]);

  // Check if game is saved in any collection
  const isSaved = collections.some(collection => 
    collection.gameIds.includes(game.id)
  );

  // Load user's collections
  useEffect(() => {
    if (avatar?.id) {
      loadCollections();
    }
  }, [avatar?.id, loadCollections]);

  /**
   * Handle menu click
   */
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  /**
   * Close menu
   */
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  /**
   * Add game to collection
   */
  const addToCollection = async (collection: GameCollection) => {
    if (collection.gameIds.includes(game.id)) {
      // Remove from collection
      await removeFromCollection(collection);
      return;
    }

    try {
      setLoading(true);
      const newGameIds = [...collection.gameIds, game.id];

      const { error } = await supabase
        .from('game_collections')
        .update({
          game_ids: newGameIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', collection.id);

      if (error) throw error;

      // Update local state
      setCollections(prev => prev.map(c => 
        c.id === collection.id 
          ? { ...c, gameIds: newGameIds }
          : c
      ));

      setSnackbar({
        open: true,
        message: `Added "${game.title}" to "${collection.name}"`,
        severity: 'success'
      });
    } catch (error) {
      logger.error('Failed to add game to collection:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add game to collection',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  /**
   * Remove game from collection
   */
  const removeFromCollection = async (collection: GameCollection) => {
    try {
      setLoading(true);
      const newGameIds = collection.gameIds.filter(id => id !== game.id);

      const { error } = await supabase
        .from('game_collections')
        .update({
          game_ids: newGameIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', collection.id);

      if (error) throw error;

      // Update local state
      setCollections(prev => prev.map(c => 
        c.id === collection.id 
          ? { ...c, gameIds: newGameIds }
          : c
      ));

      setSnackbar({
        open: true,
        message: `Removed "${game.title}" from "${collection.name}"`,
        severity: 'success'
      });
    } catch (error) {
      logger.error('Failed to remove game from collection:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove game from collection',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  /**
   * Create new collection with this game
   */
  const createNewCollection = async () => {
    if (!avatar?.id || !newCollectionName.trim()) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('game_collections')
        .insert({
          avatar_id: avatar.id,
          created_by_user_id: avatar.user_id,
          name: newCollectionName.trim(),
          game_ids: [game.id],
          collection_type: 'personal',
          share_scope: 'private'
        })
        .select('id, name, game_ids')
        .single();

      if (error) throw error;

      // Add to local state
      const newCollection: GameCollection = {
        id: data.id,
        name: data.name,
        gameIds: data.game_ids || []
      };

      setCollections(prev => [...prev, newCollection]);
      setCreateDialogOpen(false);
      setNewCollectionName('');

      setSnackbar({
        open: true,
        message: `Created "${newCollection.name}" with "${game.title}"`,
        severity: 'success'
      });
    } catch (error) {
      logger.error('Failed to create collection:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create collection',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  /**
   * Handle create dialog
   */
  const handleCreateNew = () => {
    setCreateDialogOpen(true);
    handleMenuClose();
  };

  if (!avatar?.id) {
    return null; // Don't show for non-authenticated users
  }

  const buttonContent = (
    <IconButton
      onClick={handleMenuClick}
      size={size}
      disabled={loading}
      color={isSaved ? 'primary' : 'default'}
    >
      {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
    </IconButton>
  );

  return (
    <>
      {showLabel ? (
        <Button
          startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          onClick={handleMenuClick}
          disabled={loading}
          color={isSaved ? 'primary' : 'inherit'}
          size={size}
        >
          {isSaved ? 'Saved' : 'Save'}
        </Button>
      ) : (
        <Tooltip title={isSaved ? 'Saved to collection' : 'Save to collection'}>
          {buttonContent}
        </Tooltip>
      )}

      {/* Collections Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" color="text.secondary">
            Save &ldquo;{game.title}&rdquo; to:
          </Typography>
        </MenuItem>
        <Divider />
        
        {collections.map((collection) => {
          const isInCollection = collection.gameIds.includes(game.id);
          
          return (
            <MenuItem
              key={collection.id}
              onClick={() => addToCollection(collection)}
              disabled={loading}
            >
              <ListItemIcon>
                {isInCollection ? <CheckIcon color="primary" /> : <FolderIcon />}
              </ListItemIcon>
              <ListItemText 
                primary={collection.name}
                secondary={`${collection.gameIds.length} games`}
              />
            </MenuItem>
          );
        })}
        
        <Divider />
        <MenuItem onClick={handleCreateNew} disabled={loading}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Create New Collection" />
        </MenuItem>
      </Menu>

      {/* Create Collection Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setNewCollectionName('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            variant="outlined"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder={`My ${game.subject} Games`}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            &ldquo;{game.title}&rdquo; will be added to this collection.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setNewCollectionName('');
          }}>
            Cancel
          </Button>
          <Button
            onClick={createNewCollection}
            variant="contained"
            disabled={!newCollectionName.trim() || loading}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
} 