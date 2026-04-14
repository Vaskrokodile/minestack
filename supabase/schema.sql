-- MineSlack Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'away')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Channels
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel Members
CREATE TABLE IF NOT EXISTS public.channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Direct Messages
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DM Participants
CREATE TABLE IF NOT EXISTS public.dm_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_id UUID REFERENCES direct_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(dm_id, user_id)
);

-- DM Messages
CREATE TABLE IF NOT EXISTS public.dm_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_id UUID REFERENCES direct_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  client TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_regions TEXT[],
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  due_date DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Lists
CREATE TABLE IF NOT EXISTS public.task_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_list_id UUID REFERENCES task_lists(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  position INTEGER DEFAULT 0,
  time_estimate INTEGER,
  time_spent INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Assignees
CREATE TABLE IF NOT EXISTS public.task_assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(task_id, user_id)
);

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'folder', 'link')),
  url TEXT NOT NULL,
  size INTEGER,
  mime_type TEXT,
  folder_path TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  duration INTEGER,
  agenda TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting Attendees
CREATE TABLE IF NOT EXISTS public.meeting_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(meeting_id, user_id)
);

-- Transactions (Finance)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue Records
CREATE TABLE IF NOT EXISTS public.revenue_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  region TEXT,
  recorded_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mention', 'reply', 'assignment', 'due_date', 'update')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_task_list ON tasks(task_list_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_user ON task_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_projects_campaign ON projects(campaign_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_revenue_date ON revenue_records(recorded_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all authenticated users full access for internal tool)
CREATE POLICY "Profiles are viewable by all authenticated users" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Workspaces are viewable by all authenticated users" ON workspaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create workspaces" ON workspaces FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Workspace owners can update workspaces" ON workspaces FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Workspace owners can delete workspaces" ON workspaces FOR DELETE TO authenticated USING (true);

CREATE POLICY "Workspace members are viewable by all authenticated users" ON workspace_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create workspace memberships" ON workspace_members FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Channels are viewable by all authenticated users" ON channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create channels" ON channels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Channel creators can update channels" ON channels FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Channel creators can delete channels" ON channels FOR DELETE TO authenticated USING (true);

CREATE POLICY "Channel members are viewable by all authenticated users" ON channel_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can join channels" ON channel_members FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Messages are viewable by all authenticated users" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create messages" ON messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Message authors can update messages" ON messages FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Message authors can delete messages" ON messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Reactions are viewable by all authenticated users" ON message_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can add reactions" ON message_reactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can remove their own reactions" ON message_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Campaigns are viewable by all authenticated users" ON campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create campaigns" ON campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Campaign creators can update campaigns" ON campaigns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Campaign creators can delete campaigns" ON campaigns FOR DELETE TO authenticated USING (true);

CREATE POLICY "Projects are viewable by all authenticated users" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Project creators can update projects" ON projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Project creators can delete projects" ON projects FOR DELETE TO authenticated USING (true);

CREATE POLICY "Task lists are viewable by all authenticated users" ON task_lists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create task lists" ON task_lists FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Tasks are viewable by all authenticated users" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Task creators can update tasks" ON tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Task creators can delete tasks" ON tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Task assignees are viewable by all authenticated users" ON task_assignees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can assign tasks" ON task_assignees FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Documents are viewable by all authenticated users" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can upload documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Document owners can update documents" ON documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Document owners can delete documents" ON documents FOR DELETE TO authenticated USING (true);

CREATE POLICY "Meetings are viewable by all authenticated users" ON meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create meetings" ON meetings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Meeting creators can update meetings" ON meetings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Meeting creators can delete meetings" ON meetings FOR DELETE TO authenticated USING (true);

CREATE POLICY "Transactions are viewable by all authenticated users" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Transaction creators can update transactions" ON transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Transaction creators can delete transactions" ON transactions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Revenue records are viewable by all authenticated users" ON revenue_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create revenue records" ON revenue_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Revenue record creators can update records" ON revenue_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Revenue record creators can delete records" ON revenue_records FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create notifications for themselves" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE dm_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
