-- Row Level Security Policies for todos table

-- Allow users to view only their own todos
CREATE POLICY "Users can view own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own todos
CREATE POLICY "Users can insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own todos
CREATE POLICY "Users can update own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own todos
CREATE POLICY "Users can delete own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);