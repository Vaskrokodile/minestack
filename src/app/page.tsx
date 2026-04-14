'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import {
  Hash, Lock, MessageSquare, Users, Briefcase, FolderKanban,
  DollarSign, ChevronDown, ChevronRight, Plus, Search, Bell, Settings, Smile,
  Send, Reply, ArrowUp, ArrowDown, Menu, TrendingUp, Clock, Moon, Sun,
  Grid, CheckCircle, ChevronRight as ChevronRightIcon, X, Zap, BarChart3, LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Channel, Message, Profile, Campaign, Project, Task, Transaction, RevenueRecord } from '@/types';
import { formatDateTime, formatDate, formatCurrency, getInitials, cn } from '@/lib/utils';

const supabase = createClient();

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ darkMode: false, toggleTheme: () => {} });

function useTheme() {
  return useContext(ThemeContext);
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'messages' | 'campaigns' | 'projects' | 'finance'>('messages');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedDM, setSelectedDM] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  }, []);

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
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (data) setCampaigns(data);
  }, []);

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase.from('projects').select('*, campaign:campaigns(*)').order('created_at', { ascending: false });
    if (data) setProjects(data);
  }, []);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase.from('tasks').select('*, assignees:task_assignees(*, profile:profiles(*))').order('position');
    if (data) setTasks(data);
  }, []);

  const fetchTransactions = useCallback(async () => {
    const { data } = await supabase.from('transactions').select('*, campaign:campaigns(name), project:projects(name)').order('transaction_date', { ascending: false }).limit(50);
    if (data) setTransactions(data);
  }, []);

  const fetchRevenue = useCallback(async () => {
    const { data } = await supabase.from('revenue_records').select('*, campaign:campaigns(name)').order('recorded_date', { ascending: false });
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
    if (selectedChannel) fetchMessages(selectedChannel);
  }, [selectedChannel, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel || !user) return;
    const { data } = await supabase.from('messages').insert({
      channel_id: selectedChannel,
      user_id: user.id,
      content: messageInput
    }).select('*, profile:profiles(*)').single();
    if (data) {
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
  const [authError, setAuthError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    else fetchUser();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthError(error.message);
  };

  const totalRevenue = revenueRecords.reduce((sum, r) => sum + r.amount, 0);
  const thisMonth = revenueRecords.filter(r => new Date(r.recorded_date).getMonth() === new Date().getMonth()).reduce((sum, r) => sum + r.amount, 0);
  const lastMonth = revenueRecords.filter(r => {
    const d = new Date(r.recorded_date);
    const lm = new Date();
    lm.setMonth(lm.getMonth() - 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  }).reduce((sum, r) => sum + r.amount, 0);
  const momGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-[var(--topaz-500)]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
          </div>
          <p className="text-[var(--text-secondary)] font-medium">Loading MineSlack...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {!user ? (
        <LoginPage
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleSignIn={handleSignIn}
          handleSignUp={handleSignUp}
          authError={authError}
        />
      ) : (
        <div className="flex h-screen bg-[var(--bg-primary)]">
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
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header user={user} showSidebar={showSidebar} setShowSidebar={setShowSidebar} darkMode={darkMode} toggleTheme={toggleTheme} />
            <main className="flex-1 overflow-auto bg-[var(--bg-secondary)]">
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
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)]">
                      <Hash className="h-10 w-10 text-[var(--text-muted)]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Welcome to MineSlack</h2>
                    <p className="mt-2 text-[var(--text-secondary)]">Select a channel to start messaging</p>
                  </div>
                </div>
              )}
              {currentView === 'campaigns' && <CampaignsView campaigns={campaigns} />}
              {currentView === 'projects' && <ProjectsView projects={projects} tasks={tasks} />}
              {currentView === 'finance' && (
                <FinanceView transactions={transactions} revenueRecords={revenueRecords} totalRevenue={totalRevenue} thisMonth={thisMonth} lastMonth={lastMonth} momGrowth={momGrowth} />
              )}
            </main>
          </div>
        </div>
      )}
    </ThemeContext.Provider>
  );
}

function LoginPage({ email, setEmail, password, setPassword, handleSignIn, handleSignUp, authError }: {
  email: string; setEmail: (v: string) => void; password: string; setPassword: (v: string) => void;
  handleSignIn: (e: React.FormEvent) => void; handleSignUp: (e: React.FormEvent) => void; authError: string;
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[var(--topaz-900)] via-[var(--topaz-800)] to-[var(--topaz-700)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[var(--topaz-500)] opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[var(--topaz-400)] opacity-20 blur-3xl"></div>
      </div>
      <div className="card-3d relative w-full max-w-md rounded-2xl p-8">
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--topaz-500)] to-[var(--topaz-600)] shadow-xl">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">MineSlack</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Internal tool for your marketing agency</p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-4">
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
            className="input-3d w-full rounded-xl px-4 py-3 text-sm" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="input-3d w-full rounded-xl px-4 py-3 text-sm" required />
          {authError && <p className="text-sm text-red-500">{authError}</p>}
          <button type="submit" className="btn-3d w-full rounded-xl py-3 font-semibold">
            {isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsSignUp(!isSignUp)} className="ml-1 font-medium text-[var(--topaz-500)] hover:underline">
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}

function Sidebar({ currentView, setCurrentView, channels, selectedChannel, setSelectedChannel, setSelectedDM, user, showSidebar, setShowSidebar, darkMode, toggleTheme }: {
  currentView: 'messages' | 'campaigns' | 'projects' | 'finance';
  setCurrentView: (v: 'messages' | 'campaigns' | 'projects' | 'finance') => void;
  channels: Channel[]; selectedChannel: string | null;
  setSelectedChannel: (id: string | null) => void; setSelectedDM: (id: string | null) => void; user: Profile;
  showSidebar: boolean; setShowSidebar: (v: boolean) => void; darkMode: boolean; toggleTheme: () => void;
}) {
  return (
    <aside className={cn("flex flex-col bg-[var(--bg-sidebar)] text-white transition-all duration-300", showSidebar ? "w-[260px]" : "w-20")}>
      <div className="flex h-16 items-center justify-center border-b border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--topaz-400)] to-[var(--topaz-600)] shadow-lg">
          <MessageSquare className="h-5 w-5" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {showSidebar && (
          <div className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">Workspace</p>
            <button
              onClick={() => { setSelectedChannel(null); setSelectedDM(null); setCurrentView('messages'); }}
              className={cn("mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                currentView === 'messages' && !selectedChannel ? "bg-[var(--topaz-500)] text-white shadow-md" : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Hash className="h-5 w-5" />
              <span>All Messages</span>
            </button>
          </div>
        )}

        {showSidebar && channels.length > 0 && (
          <div className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">Channels</p>
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => { setSelectedChannel(ch.id); setSelectedDM(null); setCurrentView('messages'); }}
                className={cn("mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  selectedChannel === ch.id ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                {ch.is_private ? <Lock className="h-4 w-4 text-white/40" /> : <Hash className="h-4 w-4 text-white/40" />}
                <span className="truncate">{ch.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mb-6">
          {showSidebar && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">Tools</p>}
          <button
            onClick={() => { setCurrentView('campaigns'); setSelectedChannel(null); setSelectedDM(null); }}
            className={cn("mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              currentView === 'campaigns' ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            <Briefcase className="h-5 w-5" />
            {showSidebar && <span>Campaigns</span>}
          </button>
          <button
            onClick={() => { setCurrentView('projects'); setSelectedChannel(null); setSelectedDM(null); }}
            className={cn("mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              currentView === 'projects' ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            <FolderKanban className="h-5 w-5" />
            {showSidebar && <span>Projects</span>}
          </button>
          <button
            onClick={() => { setCurrentView('finance'); setSelectedChannel(null); setSelectedDM(null); }}
            className={cn("mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              currentView === 'finance' ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            <DollarSign className="h-5 w-5" />
            {showSidebar && <span>Finance</span>}
          </button>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={toggleTheme}
          className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {showSidebar && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <div className="relative flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--topaz-400)] to-[var(--topaz-600)] text-sm font-semibold">
              {getInitials(user.full_name || user.email)}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-[var(--bg-sidebar)]"></div>
          </div>
          {showSidebar && (
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{user.full_name || 'User'}</p>
              <p className="truncate text-xs text-white/40">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function Header({ user, showSidebar, setShowSidebar, darkMode, toggleTheme }: {
  user: Profile; showSidebar: boolean; setShowSidebar: (v: boolean) => void; darkMode: boolean; toggleTheme: () => void;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-primary)] px-4">
      <div className="flex items-center gap-4">
        <button onClick={() => setShowSidebar(!showSidebar)} className="rounded-lg p-2 hover:bg-[var(--bg-tertiary)] lg:hidden">
          <Menu className="h-5 w-5 text-[var(--text-secondary)]" />
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" placeholder="Search... (⌘K)"
            className="input-3d h-10 w-64 rounded-xl pl-10 pr-4 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="rounded-lg p-2.5 hover:bg-[var(--bg-tertiary)] transition-colors">
          {darkMode ? <Sun className="h-5 w-5 text-[var(--text-secondary)]" /> : <Moon className="h-5 w-5 text-[var(--text-secondary)]" />}
        </button>
        <button className="relative rounded-lg p-2.5 hover:bg-[var(--bg-tertiary)] transition-colors">
          <Bell className="h-5 w-5 text-[var(--text-secondary)]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <button className="rounded-lg p-2.5 hover:bg-[var(--bg-tertiary)] transition-colors">
          <Settings className="h-5 w-5 text-[var(--text-secondary)]" />
        </button>
      </div>
    </header>
  );
}

function ChannelView({ channel, messages, messageInput, setMessageInput, sendMessage, handleKeyDown, messagesEndRef, user }: {
  channel?: Channel; messages: Message[]; messageInput: string; setMessageInput: (v: string) => void;
  sendMessage: () => void; handleKeyDown: (e: React.KeyboardEvent) => void; messagesEndRef: React.RefObject<HTMLDivElement | null>; user: Profile;
}) {
  if (!channel) return null;
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-primary)] px-6">
        <div className="flex items-center gap-2">
          {channel.is_private ? <Lock className="h-5 w-5 text-[var(--text-muted)]" /> : <Hash className="h-5 w-5 text-[var(--text-muted)]" />}
          <h2 className="font-semibold text-[var(--text-primary)]">{channel.name}</h2>
        </div>
        {channel.description && <span className="text-sm text-[var(--text-muted)]">— {channel.description}</span>}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map(msg => (
          <div key={msg.id} className="group mb-4 flex gap-4 rounded-xl p-3 hover:bg-[var(--bg-tertiary)]/50 transition-colors">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--topaz-400)] to-[var(--topaz-600)] text-sm font-semibold text-white shadow-md">
              {getInitials(msg.profile?.full_name || msg.profile?.email || 'U')}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-[var(--text-primary)]">{msg.profile?.full_name || 'Unknown'}</span>
                <span className="text-xs text-[var(--text-muted)]">{formatDateTime(msg.created_at)}</span>
              </div>
              <p className="mt-1 text-[var(--text-secondary)]">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-[var(--border)] bg-[var(--bg-primary)] p-4">
        <div className="flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-2 shadow-inner">
          <button className="rounded-lg p-2 hover:bg-[var(--bg-tertiary)] transition-colors">
            <Plus className="h-5 w-5 text-[var(--text-muted)]" />
          </button>
          <textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={`Message #${channel.name}`}
            className="input-3d flex-1 resize-none rounded-lg border-0 bg-transparent p-2 text-sm focus:ring-0"
            rows={1}
          />
          <button className="rounded-lg p-2 hover:bg-[var(--bg-tertiary)] transition-colors">
            <Smile className="h-5 w-5 text-[var(--text-muted)]" />
          </button>
          <button onClick={sendMessage} disabled={!messageInput.trim()}
            className="btn-3d rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CampaignsView({ campaigns }: { campaigns: Campaign[] }) {
  const statusStyles: Record<string, string> = {
    planning: 'badge-info', active: 'badge-success', paused: 'badge-warning', completed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Campaigns</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Track and manage all your marketing campaigns</p>
        </div>
        <button className="btn-3d flex items-center gap-2 rounded-xl px-5 py-2.5">
          <Plus className="h-5 w-5" />
          New Campaign
        </button>
      </div>
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)]">
            <Briefcase className="h-8 w-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)]">No campaigns yet</h3>
          <p className="mt-1 text-[var(--text-secondary)]">Create your first campaign to get started</p>
          <button className="btn-3d mt-5 rounded-xl px-5 py-2.5">Create Campaign</button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="card-3d rounded-2xl p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{campaign.name}</h3>
                  {campaign.client && <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{campaign.client}</p>}
                </div>
                <span className={cn("badge", statusStyles[campaign.status] || 'badge-info')}>{campaign.status}</span>
              </div>
              {campaign.description && <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{campaign.description}</p>}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Progress</span>
                  <span className="font-semibold text-[var(--text-primary)]">{campaign.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${campaign.progress}%` }}></div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-muted)]">
                {campaign.start_date && <span>Started {formatDate(campaign.start_date)}</span>}
                {campaign.budget && <span className="font-medium text-[var(--topaz-500)]">{formatCurrency(campaign.budget)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsView({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-50 dark:bg-gray-900/50' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'review', title: 'Review', color: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' }
  ];
  const priorityBorder: Record<string, string> = {
    low: 'border-l-[var(--text-muted)]', medium: 'border-l-blue-500', high: 'border-l-orange-500', urgent: 'border-l-red-500'
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-primary)] p-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Projects</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your tasks with Kanban boards</p>
        </div>
        <button className="btn-3d flex items-center gap-2 rounded-xl px-5 py-2.5">
          <Plus className="h-5 w-5" />
          New Project
        </button>
      </div>
      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full gap-4 p-4" style={{ minWidth: 'max-content' }}>
          {columns.map(column => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            return (
              <div key={column.id} className={cn("w-80 rounded-2xl flex flex-col", column.color)}>
                <div className="flex items-center justify-between p-3">
                  <h3 className="font-semibold text-[var(--text-primary)]">{column.title}</h3>
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-secondary)]">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {columnTasks.map(task => (
                    <div key={task.id} className={cn("kanban-card rounded-xl border-l-4 bg-[var(--bg-primary)] p-4 shadow-sm", priorityBorder[task.priority])}>
                      <h4 className="font-medium text-[var(--text-primary)]">{task.title}</h4>
                      {task.description && <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">{task.description}</p>}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.due_date && (
                            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                              <Clock className="h-3 w-3" />
                              {formatDate(task.due_date)}
                            </span>
                          )}
                        </div>
                        {task.assignees && task.assignees.length > 0 && (
                          <div className="flex -space-x-2">
                            {task.assignees.slice(0, 3).map((a: any) => (
                              <div key={a.id} className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--topaz-400)] to-[var(--topaz-600)] text-[10px] font-semibold text-white border-2 border-[var(--bg-primary)]">
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
  transactions: Transaction[]; revenueRecords: RevenueRecord[]; totalRevenue: number; thisMonth: number; lastMonth: number; momGrowth: number;
}) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const chartData = revenueRecords.slice(0, 12).reverse().map(r => ({
    date: formatDate(r.recorded_date),
    revenue: r.amount
  }));
  const maxRevenue = Math.max(...chartData.map(c => c.revenue), 1);

  return (
    <div className="min-h-full bg-[var(--bg-secondary)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Revenue Dashboard</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Track your financial metrics and growth</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-[var(--bg-primary)] p-1 shadow-sm">
          {(['7d', '30d', '90d', '1y'] as const).map(range => (
            <button key={range} onClick={() => setTimeRange(range)}
              className={cn("rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
                timeRange === range ? "bg-[var(--topaz-500)] text-white shadow-md" : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]")}>
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-3d rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">This Month</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{formatCurrency(thisMonth)}</p>
          <div className="mt-2 flex items-center gap-1 text-sm">
            {momGrowth >= 0 ? (
              <><ArrowUp className="h-4 w-4 text-green-500" /><span className="text-green-500">{momGrowth.toFixed(1)}%</span></>
            ) : (
              <><ArrowDown className="h-4 w-4 text-red-500" /><span className="text-red-500">{Math.abs(momGrowth).toFixed(1)}%</span></>
            )}
            <span className="text-[var(--text-muted)]">vs last month</span>
          </div>
        </div>

        <div className="card-3d rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Total Revenue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--topaz-500)]/10">
              <BarChart3 className="h-5 w-5 text-[var(--topaz-500)]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{formatCurrency(totalRevenue)}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">All time</p>
        </div>

        <div className="card-3d rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Total Income</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <ArrowDown className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{formatCurrency(totalIncome)}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{transactions.filter(t => t.type === 'income').length} transactions</p>
        </div>

        <div className="card-3d rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Total Expenses</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <ArrowUp className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{formatCurrency(totalExpenses)}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{transactions.filter(t => t.type === 'expense').length} transactions</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-3d rounded-2xl p-5">
          <h3 className="mb-4 font-semibold text-[var(--text-primary)]">Revenue Over Time</h3>
          <div className="flex items-end justify-between gap-2 h-52">
            {chartData.length > 0 ? chartData.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-[var(--topaz-600)] to-[var(--topaz-400)] transition-all hover:from-[var(--topaz-500)] hover:to-[var(--topaz-300)]"
                  style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 5)}%` }} />
                <span className="text-xs text-[var(--text-muted)]">{d.date}</span>
              </div>
            )) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">No data available</div>
            )}
          </div>
        </div>

        <div className="card-3d rounded-2xl p-5">
          <h3 className="mb-4 font-semibold text-[var(--text-primary)]">Recent Transactions</h3>
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {transactions.slice(0, 8).map(tx => (
              <div key={tx.id} className="flex items-center justify-between rounded-xl p-3 hover:bg-[var(--bg-tertiary)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl",
                    tx.type === 'income' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                    {tx.type === 'income' ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{tx.description || (tx.type === 'income' ? 'Income' : 'Expense')}</p>
                    <p className="text-xs text-[var(--text-muted)]">{tx.campaign?.name || 'General'} • {formatDate(tx.transaction_date)}</p>
                  </div>
                </div>
                <span className={cn("font-semibold", tx.type === 'income' ? "text-green-500" : "text-red-500")}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && <p className="py-8 text-center text-[var(--text-muted)]">No transactions yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
