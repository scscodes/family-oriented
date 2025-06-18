import { createClient } from '@/lib/supabase/client';
import { logger } from './logger';
import { Game, GameUtils } from './gameData';

export interface GameCollection {
  id: string;
  name: string;
  description?: string;
  gameIds: string[];
  avatarId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CollectionsService {
  private supabase = createClient();

  /**
   * Get all collections for an avatar
   */
  async getCollections(avatarId: string): Promise<GameCollection[]> {
    try {
      const { data, error } = await this.supabase
        .from('game_collections')
        .select('*')
        .eq('avatar_id', avatarId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        gameIds: item.game_ids || [],
        avatarId: item.avatar_id,
        createdAt: new Date(item.created_at || Date.now()),
        updatedAt: new Date(item.updated_at || Date.now())
      }));
    } catch (error) {
      logger.error('Failed to load collections:', error);
      return [];
    }
  }

  /**
   * Create a new collection
   */
  async createCollection(
    avatarId: string,
    userId: string,
    name: string,
    description?: string,
    gameIds: string[] = []
  ): Promise<GameCollection | null> {
    try {
      const { data, error } = await this.supabase
        .from('game_collections')
        .insert({
          avatar_id: avatarId,
          created_by_user_id: userId,
          name: name.trim(),
          description: description?.trim() || null,
          game_ids: gameIds,
          collection_type: 'personal',
          share_scope: 'private'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        gameIds: data.game_ids || [],
        avatarId: data.avatar_id,
        createdAt: new Date(data.created_at || Date.now()),
        updatedAt: new Date(data.updated_at || Date.now())
      };
    } catch (error) {
      logger.error('Failed to create collection:', error);
      return null;
    }
  }

  /**
   * Add a game to a collection
   */
  async addGameToCollection(collectionId: string, gameId: string): Promise<boolean> {
    try {
      // First get current game IDs
      const { data: collection, error: fetchError } = await this.supabase
        .from('game_collections')
        .select('game_ids')
        .eq('id', collectionId)
        .single();

      if (fetchError) throw fetchError;

      const currentGameIds = (collection.game_ids || []) as string[];
      if (currentGameIds.includes(gameId)) {
        return true; // Already in collection
      }

      const newGameIds = [...currentGameIds, gameId];

      const { error } = await this.supabase
        .from('game_collections')
        .update({
          game_ids: newGameIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', collectionId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Failed to add game to collection:', error);
      return false;
    }
  }

  /**
   * Remove a game from a collection
   */
  async removeGameFromCollection(collectionId: string, gameId: string): Promise<boolean> {
    try {
      // First get current game IDs
      const { data: collection, error: fetchError } = await this.supabase
        .from('game_collections')
        .select('game_ids')
        .eq('id', collectionId)
        .single();

      if (fetchError) throw fetchError;

      const currentGameIds = (collection.game_ids || []) as string[];
      const newGameIds = currentGameIds.filter(id => id !== gameId);

      const { error } = await this.supabase
        .from('game_collections')
        .update({
          game_ids: newGameIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', collectionId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Failed to remove game from collection:', error);
      return false;
    }
  }

  /**
   * Delete a collection
   */
  async deleteCollection(collectionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('game_collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Failed to delete collection:', error);
      return false;
    }
  }

  /**
   * Get games for a collection
   */
  getCollectionGames(collection: GameCollection): Game[] {
    return collection.gameIds
      .map(id => GameUtils.getGameById(id))
      .filter(Boolean) as Game[];
  }

  /**
   * Check if a game is in any collection
   */
  async isGameSaved(avatarId: string, gameId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('game_collections')
        .select('id')
        .eq('avatar_id', avatarId)
        .contains('game_ids', [gameId])
        .limit(1);

      if (error) throw error;
      return data.length > 0;
    } catch (error) {
      logger.error('Failed to check if game is saved:', error);
      return false;
    }
  }
}

export const collectionsService = new CollectionsService(); 