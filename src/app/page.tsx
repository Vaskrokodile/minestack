'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Hash, Lock, MessageSquare, Users, Briefcase, FolderKanban,
  DollarSign, ChevronDown, ChevronRight, Plus, Search, Bell, Settings, Smile,
  Send, Reply, ArrowUp, ArrowDown, Menu, TrendingUp, Clock,
  Grid, Download, CheckCircle, Circle, AlertCircle, FilterIcon, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Channel, Message, Profile, Campaign, Project, Task, Transaction, RevenueRecord } from '@/types';
import { formatDateTime, formatDate, formatCurrency, getInitials, cn } from '@/lib/utils';

const supabase = createClient();

export default function Home() {
  const [currentView, setCurrentView] = useState<'messages' | 'campaigns' | 'projects' | 'finance'>('messages');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedDM, setSelectedDM] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchUser = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (profile) setUser(profile);
    }
    setLoading(false);
  }, []);

  const fetchChannels = useCallback(async () => {
    const { data } = await supabase
      .from('channels')
      .select('*')
      .order('name');
    if (data) setChannels(data);
  }, []);

  const fetchMessages = useCallback(async (channelId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, profile:profiles(*)')
      .eq('channel_id', channelId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })
      .limit(100);
    if (data) setMessages(data);
  }, []);

  const fetchCampaigns = useCallback(async () => {
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCampaigns(data);
  }, []);

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase
      .from('projects')
      .select('*, campaign:campaigns(*)')
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
  }, []);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*, assignees:task_assignees(*, profile:profiles(*))')
      .order('position');
    if (data) setTasks(data);
  }, []);

  const fetchTransactions = useCallback(async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*, campaign:campaigns(name), project:projects(name)')
      .order('transaction_date', { ascending: false })
      .limit(50);
    if (data) setTransactions(data);
  }, []);

  const fetchRevenue = useCallback(async () => {
    const { data } = await supabase
      .from('revenue_records')
      .select('*, campaign:campaigns(name)')
      .order('recorded_date', { ascending: false });
    if (data) setRevenueRecords(data);
  }, []);

  useEffect(() => {
    fetchUser();
    fetchChannels();
    fetchCampaigns();
    fetchProjects();
    fetchTasks();
    fetchTransactions();
    fetchRevenue();
  }, [fetchUser, fetchChannels, fetchCampaigns, fetchProjects, fetchTasks, fetchTransactions, fetchRevenue]);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel);
    }
  }, [selectedChannel, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel || !user) return;
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id: selectedChannel,
        user_id: user.id,
        content: messageInput
      })
      .select('*, profile:profiles(*)')
      .single();
    
    if (!error && data) {
      setMessages(prev => [...prev, data]);
      setMessageInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setSignInError(error.message);
    else fetchUser();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setSignInError(error.message);
  };

  const totalRevenue = revenueRecords.reduce((sum, r) => sum + r.amount, 0);
  const thisMonth = revenueRecords
    .filter(r => new Date(r.recorded_date).getMonth() === new Date().getMonth())
    .reduce((sum, r) => sum + r.amount, 0);
  const lastMonth = revenueRecords
    .filter(r => {
      const d = new Date(r.recorded_date);
      const lm = new Date();
      lm.setMonth(lm.getMonth() - 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    })
    .reduce((sum, r) => sum + r.amount, 0);
  const momGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-topaz-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-topaz-200 border-t-topaz-600"></div>
          <p className="text-topaz-600 font-medium">Loading MineSlack...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-topaz-900 to-topaz-700">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-topaz-500">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">MineSlack</h1>
            <p className="mt-2 text-gray-600">Internal tool for your marketing agency</p>
          </div>
          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-topaz-500 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-topaz-500 focus:outline-none"
              required
            />
            {signInError && <p className="text-sm text-red-500">{signInError}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-topaz-500 py-3 font-semibold text-white transition-colors hover:bg-topaz-600"
            >
              Sign in
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            No account?{' '}
            <button onClick={handleSignUp} className="text-topaz-500 hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-topaz-50">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        channels={channels}
        selectedChannel={selectedChannel}
        setSelectedChannel={(id) => { setSelectedChannel(id); setSelectedDM(null); setCurrentView('messages'); }}
        setSelectedDM={(id) => { setSelectedDM(id); setSelectedChannel(null); setCurrentView('messages'); }}
        user={user}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={user}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
        
        <main className="flex-1 overflow-auto bg-white">
          {currentView === 'messages' && selectedChannel && (
            <ChannelView
              channel={channels.find(c => c.id === selectedChannel)}
              messages={messages}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              sendMessage={sendMessage}
              handleKeyDown={handleKeyDown}
              messagesEndRef={messagesEndRef}
              user={user}
            />
          )}
          
          {currentView === 'messages' && !selectedChannel && !selectedDM && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Hash className="mx-auto h-16 w-16 text-gray-300" />
                <h2 className="mt-4 text-xl font-semibold text-gray-700">Welcome to MineSlack</h2>
                <p className="mt-2 text-gray-500">Select a channel to start messaging</p>
              </div>
            </div>
          )}

          {currentView === 'campaigns' && (
            <CampaignsView campaigns={campaigns} />
          )}

          {currentView === 'projects' && (
            <ProjectsView projects={projects} tasks={tasks} />
          )}

          {currentView === 'finance' && (
            <FinanceView
              transactions={transactions}
              revenueRecords={revenueRecords}
              totalRevenue={totalRevenue}
              thisMonth={thisMonth}
              lastMonth={lastMonth}
              momGrowth={momGrowth}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ currentView, setCurrentView, channels, selectedChannel, setSelectedChannel, setSelectedDM, user, showSidebar, setShowSidebar }: {
  currentView: 'messages' | 'campaigns' | 'projects' | 'finance';
  setCurrentView: (v: 'messages' | 'campaigns' | 'projects' | 'finance') => void;
  channels: Channel[];
  selectedChannel: string | null;
  setSelectedChannel: (id: string | null) => void;
  setSelectedDM: (id: string | null) => void;
  user: Profile;
  showSidebar: boolean;
  setShowSidebar: (v: boolean) => void;
}) {
  const [expandedSections, setExpandedSections] = useState({
    channels: true,
    dms: true,
    apps: true
  });

  const toggleSection = (section: 'channels' | 'dms' | 'apps') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className={cn(
      "flex h-full flex-col bg-topaz-900 text-white transition-all duration-300",
      showSidebar ? "w-64" : "w-16"
    )}>
      <div className="flex h-14 items-center border-b border-topaz-800 px-4">
        {showSidebar ? (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-topaz-500">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="ml-3 font-semibold">MineSlack</span>
          </>
        ) : (
          <MessageSquare className="h-6 w-6 text-topaz-400" />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <SidebarSection
          title="Channels"
          expanded={expandedSections.channels}
          onToggle={() => toggleSection('channels')}
          icon={<Hash className="h-4 w-4" />}
          showSidebar={showSidebar}
        >
          {channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={cn(
                "flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors",
                selectedChannel === ch.id
                  ? "bg-topaz-700 text-white"
                  : "text-topaz-200 hover:bg-topaz-800"
              )}
            >
              {ch.is_private ? <Lock className="mr-2 h-4 w-4 flex-shrink-0" /> : <Hash className="mr-2 h-4 w-4 flex-shrink-0" />}
              {showSidebar && <span className="truncate">{ch.name}</span>}
            </button>
          ))}
        </SidebarSection>

        <SidebarSection
          title="Direct Messages"
          expanded={expandedSections.dms}
          onToggle={() => toggleSection('dms')}
          icon={<Users className="h-4 w-4" />}
          showSidebar={showSidebar}
        >
          <button
            onClick={() => setSelectedDM('general')}
            className="flex w-full items-center rounded-md px-3 py-1.5 text-sm text-topaz-200 hover:bg-topaz-800"
          >
            <div className="mr-2 h-6 w-6 rounded-full bg-green-500"></div>
            {showSidebar && <span>Team Chat</span>}
          </button>
        </SidebarSection>

        <SidebarSection
          title="Apps"
          expanded={expandedSections.apps}
          onToggle={() => toggleSection('apps')}
          icon={<Grid className="h-4 w-4" />}
          showSidebar={showSidebar}
        >
          <button
            onClick={() => { setCurrentView('campaigns'); setSelectedChannel(null); setSelectedDM(null); }}
            className={cn(
              "flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors",
              currentView === 'campaigns' ? "bg-topaz-700 text-white" : "text-topaz-200 hover:bg-topaz-800"
            )}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            {showSidebar && <span>Campaigns</span>}
          </button>
          <button
            onClick={() => { setCurrentView('projects'); setSelectedChannel(null); setSelectedDM(null); }}
            className={cn(
              "flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors",
              currentView === 'projects' ? "bg-topaz-700 text-white" : "text-topaz-200 hover:bg-topaz-800"
            )}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            {showSidebar && <span>Projects</span>}
          </button>
          <button
            onClick={() => { setCurrentView('finance'); setSelectedChannel(null); setSelectedDM(null); }}
            className={cn(
              "flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors",
              currentView === 'finance' ? "bg-topaz-700 text-white" : "text-topaz-200 hover:bg-topaz-800"
            )}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            {showSidebar && <span>Finance</span>}
          </button>
        </SidebarSection>
      </nav>

      <div className="border-t border-topaz-800 p-4">
        <div className="flex items-center">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-topaz-500 text-sm font-medium">
              {getInitials(user.full_name || user.email)}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-topaz-900"></div>
          </div>
          {showSidebar && (
            <div className="ml-3 flex-1 truncate">
              <p className="text-sm font-medium truncate">{user.full_name || 'User'}</p>
              <p className="text-xs text-topaz-400 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function SidebarSection({ title, expanded, onToggle, icon, showSidebar, children }: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  showSidebar: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-topaz-400 hover:text-topaz-200"
      >
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {showSidebar && <span className="ml-2">{title}</span>}
      </button>
      {expanded && showSidebar && <div className="mt-1 space-y-0.5 px-2">{children}</div>}
    </div>
  );
}

function Header({ user, showSidebar, setShowSidebar }: {
  user: Profile;
  showSidebar: boolean;
  setShowSidebar: (v: boolean) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="rounded-md p-2 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-64 rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-topaz-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-md p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <button className="rounded-md p-2 hover:bg-gray-100">
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}

function ChannelView({ channel, messages, messageInput, setMessageInput, sendMessage, handleKeyDown, messagesEndRef, user }: {
  channel?: Channel;
  messages: Message[];
  messageInput: string;
  setMessageInput: (v: string) => void;
  sendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  user: Profile;
}) {
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);

  if (!channel) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          {channel.is_private ? <Lock className="h-5 w-5 text-gray-500" /> : <Hash className="h-5 w-5 text-gray-500" />}
          <h2 className="font-semibold">{channel.name}</h2>
        </div>
        {channel.description && (
          <span className="ml-2 text-sm text-gray-500">— {channel.description}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 text-center">
          <span className="text-sm text-gray-500">{channel.name} was created in 2024</span>
        </div>
        
        {messages.map(msg => (
          <div key={msg.id} className="group mb-4 flex gap-4 rounded-lg p-2 hover:bg-gray-50">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-topaz-500 text-sm font-medium text-white">
              {getInitials(msg.profile?.full_name || msg.profile?.email || 'U')}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold">{msg.profile?.full_name || 'Unknown'}</span>
                <span className="text-xs text-gray-500">{formatDateTime(msg.created_at)}</span>
              </div>
              <p className="mt-1 text-gray-700">{msg.content}</p>
              <div className="mt-2 flex items-center gap-4">
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                  <Smile className="h-4 w-4" />
                  <span>Add reaction</span>
                </button>
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                  <Reply className="h-4 w-4" />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end gap-2 rounded-lg border border-gray-200 bg-white p-2">
          <button className="rounded-md p-2 hover:bg-gray-100">
            <Plus className="h-5 w-5 text-gray-500" />
          </button>
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channel.name}`}
            className="message-input flex-1 resize-none border-0 bg-transparent p-2 text-sm focus:outline-none"
            rows={1}
          />
          <button className="rounded-md p-2 hover:bg-gray-100">
            <Smile className="h-5 w-5 text-gray-500" />
          </button>
          <button
            onClick={sendMessage}
            disabled={!messageInput.trim()}
            className="rounded-md bg-topaz-500 p-2 text-white transition-colors hover:bg-topaz-600 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CampaignsView({ campaigns }: { campaigns: Campaign[] }) {
  const statusColors: Record<string, string> = {
    planning: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500">Track and manage all your marketing campaigns</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-topaz-500 px-4 py-2 text-white hover:bg-topaz-600">
          <Plus className="h-5 w-5" />
          New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Briefcase className="h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-700">No campaigns yet</h3>
          <p className="mt-2 text-gray-500">Create your first campaign to get started</p>
          <button className="mt-4 rounded-lg bg-topaz-500 px-4 py-2 text-white hover:bg-topaz-600">
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                  {campaign.client && (
                    <p className="text-sm text-gray-500">{campaign.client}</p>
                  )}
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusColors[campaign.status] || statusColors.planning)}>
                  {campaign.status}
                </span>
              </div>
              
              {campaign.description && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
              )}

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{campaign.progress}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-topaz-500 transition-all"
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                {campaign.start_date && <span>Started {formatDate(campaign.start_date)}</span>}
                {campaign.budget && <span>{formatCurrency(campaign.budget)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsView({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const statusColumns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'review', title: 'Review', color: 'bg-purple-50' },
    { id: 'done', title: 'Done', color: 'bg-green-50' }
  ];

  const priorityColors: Record<string, string> = {
    low: 'border-l-gray-400',
    medium: 'border-l-blue-400',
    high: 'border-l-orange-400',
    urgent: 'border-l-red-500'
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">Manage your tasks with Kanban boards</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-topaz-500 px-4 py-2 text-white hover:bg-topaz-600">
          <Plus className="h-5 w-5" />
          New Project
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 p-4 h-full" style={{ minWidth: 'max-content' }}>
          {statusColumns.map(column => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            return (
              <div key={column.id} className={cn("w-80 rounded-xl flex flex-col", column.color)}>
                <div className="flex items-center justify-between p-3">
                  <h3 className="font-semibold text-gray-700">{column.title}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {columnTasks.map(task => (
                    <div key={task.id} className={cn("kanban-card rounded-lg border-l-4 bg-white p-3 shadow-sm", priorityColors[task.priority])}>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.due_date && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatDate(task.due_date)}
                            </span>
                          )}
                        </div>
                        {task.assignees && task.assignees.length > 0 && (
                          <div className="flex -space-x-2">
                            {task.assignees.slice(0, 3).map((a: any) => (
                              <div key={a.id} className="flex h-6 w-6 items-center justify-center rounded-full bg-topaz-500 text-xs text-white border-2 border-white">
                                {getInitials(a.profile?.full_name || 'U')}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FinanceView({ transactions, revenueRecords, totalRevenue, thisMonth, lastMonth, momGrowth }: {
  transactions: Transaction[];
  revenueRecords: RevenueRecord[];
  totalRevenue: number;
  thisMonth: number;
  lastMonth: number;
  momGrowth: number;
}) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  const chartData = revenueRecords.slice(0, 12).reverse().map(r => ({
    date: formatDate(r.recorded_date),
    revenue: r.amount
  }));

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-500">Track your financial metrics and growth</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                timeRange === range ? "bg-topaz-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">This Month</span>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(thisMonth)}</p>
          <div className="mt-2 flex items-center gap-1 text-sm">
            {momGrowth >= 0 ? (
              <>
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-green-600">{momGrowth.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 text-red-500" />
                <span className="text-red-600">{Math.abs(momGrowth).toFixed(1)}%</span>
              </>
            )}
            <span className="text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total Revenue</span>
            <DollarSign className="h-5 w-5 text-topaz-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          <p className="mt-2 text-sm text-gray-500">All time</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total Income</span>
            <ArrowUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
          <p className="mt-2 text-sm text-gray-500">{transactions.filter(t => t.type === 'income').length} transactions</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total Expenses</span>
            <ArrowDown className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
          <p className="mt-2 text-sm text-gray-500">{transactions.filter(t => t.type === 'expense').length} transactions</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">Revenue Over Time</h3>
          <div className="mt-4 h-64 flex items-end gap-2">
            {chartData.length > 0 ? chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-topaz-500 transition-all hover:bg-topaz-600"
                  style={{ height: `${Math.max((d.revenue / Math.max(...chartData.map(c => c.revenue))) * 100, 10)}%` }}
                />
                <span className="text-xs text-gray-500">{d.date}</span>
              </div>
            )) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
          <div className="mt-4 space-y-3">
            {transactions.slice(0, 8).map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full",
                    tx.type === 'income' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    {tx.type === 'income' ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.description || `${tx.type === 'income' ? 'Income' : 'Expense'}`}</p>
                    <p className="text-sm text-gray-500">{tx.campaign?.name || 'General'} • {formatDate(tx.transaction_date)}</p>
                  </div>
                </div>
                <span className={cn("font-semibold", tx.type === 'income' ? "text-green-600" : "text-red-600")}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-gray-400 py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
