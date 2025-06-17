-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_collections ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Avatars: Users can only access their own avatars
CREATE POLICY "Users can view own avatars" ON avatars
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own avatars" ON avatars
  FOR ALL USING (user_id = auth.uid());

-- Game Sessions: Users can only access sessions for their avatars
CREATE POLICY "Users can view own game sessions" ON game_sessions
  FOR SELECT USING (
    avatar_id IN (SELECT id FROM avatars WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create game sessions" ON game_sessions
  FOR INSERT WITH CHECK (
    avatar_id IN (SELECT id FROM avatars WHERE user_id = auth.uid())
  );

-- Game Collections: Users can view their own and shared collections
CREATE POLICY "Users can view accessible collections" ON game_collections
  FOR SELECT USING (
    avatar_id IN (SELECT id FROM avatars WHERE user_id = auth.uid()) OR
    share_scope = 'public'
  );

CREATE POLICY "Users can manage own collections" ON game_collections
  FOR ALL USING (
    avatar_id IN (SELECT id FROM avatars WHERE user_id = auth.uid())
  );