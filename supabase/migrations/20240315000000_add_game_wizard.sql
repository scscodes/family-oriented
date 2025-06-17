-- Create game wizard tables
CREATE TABLE game_wizard_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  avatar_id UUID REFERENCES avatars(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  query TEXT,
  parsed_filters JSONB,
  selected_games UUID[],
  completion_rate DECIMAL,
  CONSTRAINT fk_avatar FOREIGN KEY (avatar_id) REFERENCES avatars(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE game_wizard_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wizard sessions"
  ON game_wizard_sessions
  FOR SELECT
  USING (
    avatar_id IN (
      SELECT id FROM avatars 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create wizard sessions for their avatars"
  ON game_wizard_sessions
  FOR INSERT
  WITH CHECK (
    avatar_id IN (
      SELECT id FROM avatars 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own wizard sessions"
  ON game_wizard_sessions
  FOR UPDATE
  USING (
    avatar_id IN (
      SELECT id FROM avatars 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_wizard_sessions_avatar ON game_wizard_sessions(avatar_id);
CREATE INDEX idx_wizard_sessions_created ON game_wizard_sessions(created_at);
CREATE INDEX idx_wizard_sessions_completed ON game_wizard_sessions(completed_at);

-- Add completion tracking
CREATE TABLE game_wizard_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wizard_session_id UUID REFERENCES game_wizard_sessions(id) ON DELETE CASCADE,
  game_id UUID NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score DECIMAL,
  time_spent INTEGER, -- in seconds
  CONSTRAINT fk_wizard_session FOREIGN KEY (wizard_session_id) REFERENCES game_wizard_sessions(id) ON DELETE CASCADE
);

-- Add RLS policies for completions
ALTER TABLE game_wizard_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wizard completions"
  ON game_wizard_completions
  FOR SELECT
  USING (
    wizard_session_id IN (
      SELECT id FROM game_wizard_sessions 
      WHERE avatar_id IN (
        SELECT id FROM avatars 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create wizard completions"
  ON game_wizard_completions
  FOR INSERT
  WITH CHECK (
    wizard_session_id IN (
      SELECT id FROM game_wizard_sessions 
      WHERE avatar_id IN (
        SELECT id FROM avatars 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Create indexes for completions
CREATE INDEX idx_wizard_completions_session ON game_wizard_completions(wizard_session_id);
CREATE INDEX idx_wizard_completions_game ON game_wizard_completions(game_id);
CREATE INDEX idx_wizard_completions_completed ON game_wizard_completions(completed_at); 