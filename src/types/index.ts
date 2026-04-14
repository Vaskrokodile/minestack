export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'away';
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  profile?: Profile;
}

export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  unread_count?: number;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  reactions?: MessageReaction[];
  reply_count?: number;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  count?: number;
  has_reacted?: boolean;
}

export interface DirectMessage {
  id: string;
  workspace_id: string;
  created_at: string;
  participants?: Profile[];
  last_message?: DMMessage;
}

export interface DMMessage {
  id: string;
  dm_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
  profile?: Profile;
}

export interface Campaign {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  client: string | null;
  status: 'planning' | 'active' | 'paused' | 'completed';
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  progress: number;
  target_regions: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  projects?: Project[];
}

export interface Project {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  name: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  task_lists?: TaskList[];
  campaign?: Campaign;
}

export interface TaskList {
  id: string;
  project_id: string;
  name: string;
  position: number;
  created_at: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  task_list_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  position: number;
  time_estimate: number | null;
  time_spent: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assignees?: Profile[];
  subtasks?: Task[];
  labels?: string[];
}

export interface Document {
  id: string;
  workspace_id: string;
  project_id: string | null;
  campaign_id: string | null;
  name: string;
  type: 'file' | 'folder' | 'link';
  url: string;
  size: number | null;
  mime_type: string | null;
  folder_path: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  workspace_id: string;
  project_id: string | null;
  campaign_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  duration: number | null;
  agenda: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  attendees?: Profile[];
  project?: Project;
  campaign?: Campaign;
}

export interface Transaction {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  project_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
  campaign?: Campaign;
  project?: Project;
}

export interface RevenueRecord {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  amount: number;
  currency: string;
  region: string | null;
  recorded_date: string;
  created_at: string;
  campaign?: Campaign;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'mention' | 'reply' | 'assignment' | 'due_date' | 'update';
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface RevenueSummary {
  thisMonth: number;
  lastMonth: number;
  momGrowth: number;
  ytd: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  expenses?: number;
}
