-- Temporary policies for development and testing
-- These allow public access to analytics tables for demo/testing purposes
-- TODO: Remove these policies in production

-- Allow public access to game sessions for development
CREATE POLICY "Public access for development" ON game_sessions
  FOR ALL USING (true);

-- Allow public access to game events for development  
CREATE POLICY "Public access for development" ON game_events
  FOR ALL USING (true);

-- Allow public access to learning progress for development
CREATE POLICY "Public access for development" ON learning_progress
  FOR ALL USING (true);

-- Allow public access to game collections for development
CREATE POLICY "Public access for development" ON game_collections
  FOR ALL USING (true);

-- Allow public access to avatars for development
CREATE POLICY "Public access for development" ON avatars
  FOR ALL USING (true); 