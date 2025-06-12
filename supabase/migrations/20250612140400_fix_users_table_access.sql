-- Fix demo user access by adding public policy for users table
-- This allows the demo user profile to be accessed without authentication

-- Allow public access to users table for development
CREATE POLICY "Public access for development" ON users
  FOR ALL USING (true); 