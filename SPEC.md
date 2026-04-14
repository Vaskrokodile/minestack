# MineSlack - Internal Communication & Project Management Platform

## 1. Concept & Vision

MineSlack is a custom internal tool for a marketing agency based in Minecraft, designed to streamline communication, campaign management, and financial tracking. It combines the immediacy of Slack-style messaging with robust project management and a Stripe-inspired revenue dashboard. The aesthetic draws from Minecraft's iconic blue topaz gem, creating a distinctive brand identity while maintaining professional functionality.

**Brand Philosophy:** Playful professionalism - Minecraft's creative energy meets enterprise-grade tooling.

---

## 2. Design Language

### Color Palette - Blue Topaz Theme
```css
--topaz-50: #e6f4fb;
--topaz-100: #cce8f5;
--topaz-200: #99d1eb;
--topaz-300: #66bae1;
--topaz-400: #33a3d7;
--topaz-500: #0090d0;  /* Primary */
--topaz-600: #0073a8;
--topaz-700: #005580;
--topaz-800: #003858;
--topaz-900: #001b30;

--slack-purple: #4a154b;
--slack-purple-hover: #3a1040;

--bg-primary: #ffffff;
--bg-secondary: #f8f9fa;
--bg-tertiary: #f1f3f4;
--bg-sidebar: #001b30;
--bg-sidebar-hover: #003858;

--text-primary: #1a1a1a;
--text-secondary: #616161;
--text-muted: #9e9e9e;
--text-inverse: #ffffff;

--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

--border: #e0e0e0;
--border-light: #f0f0f0;
```

### Typography
- **Primary Font:** "Inter", -apple-system, BlinkMacSystemFont, sans-serif
- **Monospace:** "JetBrains Mono", "Fira Code", monospace
- **Scale:** 12px (caption), 14px (body), 16px (subheading), 20px (heading), 28px (title), 36px (hero)

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
- Border radius: 4px (small), 8px (medium), 12px (large), 16px (xl)
- Sidebar width: 260px
- Message max-width: 720px

### Motion Philosophy
- Micro-interactions: 150ms ease-out
- Panel transitions: 250ms ease-in-out
- Page transitions: 300ms ease-out
- Loading states: Skeleton shimmer animation

---

## 3. Layout & Structure

### Global Layout
```
┌─────────────────────────────────────────────────────────────┐
│ App Header (56px) - Search, Notifications, User Menu      │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ Sidebar  │  Main Content Area                               │
│ (260px)  │  - Dynamic based on current view                 │
│          │  - Messages / Dashboard / Campaigns / etc.       │
│          │                                                   │
│          │                                                   │
│          │                                                   │
│          │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

### Sidebar Navigation Structure
1. **Workspace Header** - Agency name, workspace switcher
2. **Channels Section**
   - Channels list (public/private)
   - Create channel button
3. **Direct Messages Section**
   - Recent DMs
   - Starred messages
4. **Apps Section**
   - Campaigns
   - Projects
   - Tasks
   - Documents
   - Meetings
   - Finance
5. **Bottom Section**
   - User status
   - Settings

---

## 4. Features & Interactions

### 4.1 Messaging System (Slack Clone)

#### Channels
- **Public Channels:** Visible to all workspace members
- **Private Channels:** Invite-only, indicated with lock icon
- **Create Channel:** Modal with name, description, privacy toggle
- **Channel Actions:** Pin messages, add reactions, share files, schedule messages

#### Direct Messages
- 1:1 conversations
- Group DMs (up to 8 people)
- Online/offline status indicators
- Typing indicators
- Read receipts (optional)

#### Message Features
- Rich text editing (bold, italic, code, links)
- File attachments (drag & drop)
- Message threads
- Emoji reactions
- @mentions with autocomplete
- Slash commands (/giphy, /remind, /status)
- Message editing (last 5 minutes)
- Message deletion
- Quote/reply

#### Threading
- Thread panel slides in from right
- Maintains context while discussing
- Thread replies show in channel with indicator

### 4.2 Campaign Management

#### Campaign Dashboard
- Grid/list view toggle
- Filter by status, date, region
- Search campaigns
- Sort by name, created date, progress

#### Campaign Properties
- Name, description, client
- Target markets (for international expansion)
- Start/end dates
- Budget allocation
- Status: Planning → Active → Paused → Completed
- Assigned team members
- Progress percentage
- Associated projects

#### Campaign Views
- Overview tab: Key metrics, recent activity
- Analytics tab: Growth charts, engagement metrics
- Assets tab: Creative files, documents
- Team tab: Assigned members, roles

### 4.3 Project Management

#### Project Structure
- Projects belong to campaigns or standalone
- Multiple task lists per project
- Task list: Kanban board or list view

#### Task Properties
- Title, description, priority (Low/Medium/High/Urgent)
- Assignee(s), due date
- Status: To Do → In Progress → Review → Done
- Subtasks (unlimited nesting)
- Labels/tags
- Attachments
- Comments
- Time tracking

#### Project Progress
- Overall completion percentage
- Burndown chart
- Activity timeline
- Milestone tracking

### 4.4 Document Storage

#### Organization
- Folder structure (unlimited nesting)
- Recent files
- Starred files
- Search by name, content, tags

#### Document Types
- Upload: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG, GIF
- Create: Rich text documents within app
- Link: External URLs

#### Document Features
- Version history
- Comments on specific sections
- Share with team members
- Preview inline
- Download original

### 4.5 Meeting Notes

#### Meeting Properties
- Title, date/time, duration
- Attendees (from team)
- Agenda
- Notes (rich text)
- Action items (auto-extracted as tasks)
- Related projects/campaigns

#### Features
- Recurring meetings
- Meeting templates
- Calendar integration view
- Share notes post-meeting

### 4.6 Finance & Revenue Dashboard (Stripe-Style)

#### Dashboard Overview
- Revenue summary cards (This month, Last month, MoM growth, YoY)
- Revenue chart (line/area chart with time range selector)
- Recent transactions table
- Top campaigns by revenue
- Revenue by region/country

#### Transaction Management
- List all transactions
- Filter by date, campaign, type
- Transaction details modal
- Export to CSV

#### Revenue Tracking
- By campaign
- By project
- By client
- By region/country

#### Financial Metrics
- Total revenue
- Revenue growth percentage
- Average deal size
- Revenue forecast

#### Charts (Recharts)
- Revenue over time (area chart)
- Revenue by source (pie chart)
- Growth comparison (bar chart)
- Geographic distribution (treemap or map)

### 4.7 Search

- Global search bar (Cmd+K)
- Search across: messages, channels, files, tasks, projects, campaigns, people
- Recent searches
- Filter results by type

### 4.8 Notifications

- In-app notification center
- Notification types: mentions, replies, assignments, due dates, updates
- Mark read/unread
- Notification preferences per type

---

## 5. Component Inventory

### Layout Components

#### Sidebar
- States: Default, collapsed (mobile), item hover, item active
- Sections collapsible
- Unread indicators (bold + dot)

#### Header
- Search input with Cmd+K hint
- Notification bell with count badge
- User avatar dropdown

#### Main Content Container
- Scrollable with sticky header option
- Empty state illustrations

### Messaging Components

#### Message
- States: Default, hover (show actions), selected, edited
- Author avatar, name, timestamp
- Message content with rich text
- Reaction bar (show on hover)
- Thread reply count indicator

#### Message Input
- States: Default, focused, with attachment preview
- Emoji picker button
- Attachment button
- Send button (enable/disable based on content)
- Typing indicator below

#### Channel Item
- States: Default, hover, active, unread (bold + count badge)
- Channel icon (# or lock)
- Name, unread count

#### Thread Panel
- Slide-in from right (300ms)
- Original message at top
- Thread replies below
- Close button

### Data Display Components

#### Card (Dashboard)
- States: Default, hover (subtle lift)
- Title, value, comparison metric
- Trend indicator (up/down arrow)
- Optional chart

#### Table
- States: Default, row hover, row selected
- Sortable columns
- Pagination
- Empty state

#### Progress Bar
- Percentage fill
- Color coding by status

### Form Components

#### Input
- States: Default, focused, error, disabled
- Label, placeholder, helper text, error message

#### Select
- States: Default, open, selected, disabled
- Search/filter option for long lists

#### Modal
- Centered overlay
- Header with title and close button
- Body content
- Footer with actions

#### Button
- Variants: Primary (filled), Secondary (outlined), Ghost (text only)
- States: Default, hover, active, loading, disabled
- Sizes: Small, Medium, Large

### Feedback Components

#### Toast Notifications
- Position: Top-right
- Types: Success, Error, Warning, Info
- Auto-dismiss after 5 seconds
- Manual dismiss button

#### Skeleton Loader
- Animated shimmer effect
- Match component shapes

#### Empty State
- Illustration
- Title
- Description
- Action button

---

## 6. Technical Approach

### Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **State Management:** React Context + React Query (TanStack Query)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Rich Text:** TipTap editor
- **Date Handling:** date-fns
- **File Upload:** Supabase Storage

### Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'online',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Channels
CREATE TABLE public.channels (
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
CREATE TABLE public.channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Reactions
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Direct Messages
CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DM Participants
CREATE TABLE public.dm_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_id UUID REFERENCES direct_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(dm_id, user_id)
);

-- DM Messages
CREATE TABLE public.dm_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_id UUID REFERENCES direct_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  client TEXT,
  status TEXT DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  progress INTEGER DEFAULT 0,
  target_regions TEXT[],
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  due_date DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Lists
CREATE TABLE public.task_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_list_id UUID REFERENCES task_lists(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  position INTEGER DEFAULT 0,
  time_estimate INTEGER,
  time_spent INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Assignees
CREATE TABLE public.task_assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(task_id, user_id)
);

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER,
  mime_type TEXT,
  folder_path TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings
CREATE TABLE public.meetings (
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
CREATE TABLE public.meeting_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(meeting_id, user_id)
);

-- Transactions (Finance)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue Records
CREATE TABLE public.revenue_records (
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
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files Storage (using Supabase Storage buckets)
-- Buckets: documents, avatars

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified for internal tool - full access for authenticated users)
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Workspace members can view workspace" ON workspaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create workspaces" ON workspaces FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Channel members can view channels" ON channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Workspace members can create channels" ON channels FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Channel members can view messages" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Channel members can create messages" ON messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Message authors can update messages" ON messages FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Message authors can delete messages" ON messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Campaign members can view campaigns" ON campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create campaigns" ON campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Campaign owners can update campaigns" ON campaigns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Campaign owners can delete campaigns" ON campaigns FOR DELETE TO authenticated USING (true);

CREATE POLICY "Project members can view projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Task list members can view tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Task assignees can update tasks" ON tasks FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Workspace members can view documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can upload documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Meeting attendees can view meetings" ON meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create meetings" ON meetings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Workspace members can view transactions" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Workspace members can view revenue" ON revenue_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create revenue" ON revenue_records FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_parent ON messages(parent_id);
CREATE INDEX idx_tasks_task_list ON tasks(task_list_id);
CREATE INDEX idx_tasks_assignee ON task_assignees(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_projects_campaign ON projects(campaign_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_revenue_date ON revenue_records(recorded_date);
```

### API Routes Structure
```
/api
  /auth
    /callback
    /logout
  /channels
    GET / - List channels
    POST / - Create channel
    GET /[id] - Get channel
    PUT /[id] - Update channel
    DELETE /[id] - Delete channel
  /messages
    GET / - List messages (with channel_id filter)
    POST / - Create message
    PUT /[id] - Update message
    DELETE /[id] - Delete message
    POST /[id]/reactions - Add reaction
  /campaigns
    GET / - List campaigns
    POST / - Create campaign
    GET /[id] - Get campaign
    PUT /[id] - Update campaign
    DELETE /[id] - Delete campaign
  /projects
    GET / - List projects
    POST / - Create project
    GET /[id] - Get project
    PUT /[id] - Update project
    DELETE /[id] - Delete project
  /tasks
    GET / - List tasks
    POST / - Create task
    PUT /[id] - Update task
    DELETE /[id] - Delete task
  /documents
    GET / - List documents
    POST / - Upload document
    DELETE /[id] - Delete document
  /meetings
    GET / - List meetings
    POST / - Create meeting
    GET /[id] - Get meeting
    PUT /[id] - Update meeting
    DELETE /[id] - Delete meeting
  /finance
    GET /transactions - List transactions
    POST /transactions - Create transaction
    GET /revenue - Get revenue data
    POST /revenue - Create revenue record
  /notifications
    GET / - List notifications
    PUT /[id]/read - Mark as read
```

---

## 7. Page Structure

### Pages
1. `/` - Redirect to /messages
2. `/login` - Login page
3. `/messages` - Messages layout (channels + DM list)
4. `/messages/[channelId]` - Channel view
5. `/messages/dm/[dmId]` - DM view
6. `/campaigns` - Campaign list
7. `/campaigns/[id]` - Campaign detail
8. `/projects` - Project list
9. `/projects/[id]` - Project detail (Kanban view)
10. `/tasks` - All tasks across projects
11. `/documents` - Document library
12. `/meetings` - Meeting list + calendar view
13. `/finance` - Finance dashboard
14. `/settings` - User/workspace settings

---

## 8. Sample Data

### Workspace
- Name: "MineSlack Agency"
- Slug: "mineslack"

### Channels
- #general - Company-wide announcements
- #marketing - Marketing discussions
- #design - Design team
- #development - Dev team
- #random - Off-topic
- #client-wins - Success stories

### Sample Campaigns
1. "Minecraft Live 2026 Launch" - Global expansion campaign
2. "Topaz Gaming Partnership" - Influencer campaign
3. "BlockBuilder Pro Launch" - Product campaign

### Sample Projects
1. "Q1 Social Media Strategy" (Campaign: Minecraft Live)
2. "Influencer Outreach Kit" (Campaign: Topaz Gaming)
3. "Landing Page Redesign" (Campaign: BlockBuilder Pro)

### Sample Tasks
- "Create social media calendar" - In Progress
- "Design influencer package" - To Do
- "Write landing page copy" - Review
