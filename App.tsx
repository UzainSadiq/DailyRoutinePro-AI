import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Calendar, 
  Settings, 
  Bell, 
  User, 
  Plus, 
  Cloud, 
  Droplets, 
  Activity, 
  Moon, 
  Wind,
  Sparkles,
  Zap,
  Coffee,
  AlertCircle,
  LogOut,
  Target,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { format } from "date-fns";
import { cn } from "./lib/utils";
import { useFirebase } from "./hooks/useFirebase";
import { Navbar } from "./components/Navbar";
import { HabitsTab } from "./components/HabitsTab";
import { RemindersTab } from "./components/RemindersTab";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { AIAssistantTab } from "./components/AIAssistantTab";

// --- Types ---
interface Task {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  time: string;
  startTime?: any;
  createdAt?: any;
}

interface Habit {
  name: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
  icon: React.ElementType;
}

// --- Mock Data ---
const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Morning Workout', category: 'Exercise', priority: 'high', completed: true, time: '07:00 AM' },
  { id: '2', title: 'Project Meeting', category: 'Office', priority: 'medium', completed: false, time: '10:30 AM' },
  { id: '3', title: 'Study React Native', category: 'Study', priority: 'high', completed: false, time: '02:00 PM' },
  { id: '4', title: 'Meditation', category: 'Health', priority: 'low', completed: false, time: '06:00 PM' },
];

const MOCK_HABITS: Habit[] = [
  { name: 'Water', value: 1200, goal: 2000, unit: 'ml', color: 'bg-blue-500', icon: Droplets },
  { name: 'Sleep', value: 7.5, goal: 8, unit: 'hrs', color: 'bg-indigo-500', icon: Moon },
  { name: 'Steps', value: 6500, goal: 10000, unit: 'steps', color: 'bg-emerald-500', icon: Activity },
];

const CHART_DATA = [
  { day: 'Mon', score: 65 },
  { day: 'Tue', score: 40 },
  { day: 'Wed', score: 85 },
  { day: 'Thu', score: 70 },
  { day: 'Fri', score: 90 },
  { day: 'Sat', score: 55 },
  { day: 'Sun', score: 75 },
];

// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm", className)}>
    {children}
  </div>
);

const WeatherWidget = () => {
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || `Weather failed (${res.status})`);
          }
          const data = await res.json();
          setWeather(data);
        } catch (e: any) {
          console.error(e);
          setError(e.message || "Failed to fetch weather");
        } finally {
          setLoading(false);
        }
      },
      (geoErr) => {
        console.error(geoErr);
        setError("Location access denied");
        setLoading(false);
      }
    );
  }, []);

  return (
    <GlassCard className="from-blue-500/10 to-transparent bg-gradient-to-br relative overflow-hidden flex flex-col justify-between h-full min-h-[160px]">
      <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-yellow-400/20 blur-3xl rounded-full"></div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">Weather Updates</h3>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? '...' : weather?.main?.temp ? `${Math.round(weather.main.temp)}°C` : '--°C'}
          </p>
        </div>
        <Cloud className="text-blue-500" size={32} />
      </div>
      <div>
        <div className="text-gray-600 text-sm leading-relaxed min-h-[40px]">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 italic">
              <Activity size={12} className="animate-spin" />
              <span>Checking your area...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-amber-600 font-medium">
                <AlertCircle size={14} />
                <span className="text-xs">Setup Required</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                {error.includes("API key missing") 
                  ? "Add 'OPENWEATHER_API_KEY' to Secrets panel to see weather." 
                  : error}
              </p>
            </div>
          ) : weather && weather.weather && weather.weather[0] ? (
            <>It's <span className="text-blue-600 font-medium capitalize">{weather.weather[0].description}</span> in {weather.name}. 
            {weather.main?.temp > 25 ? " Drink more water today!" : " Great weather for a walk."}</>
          ) : (
            "Select location to see weather."
          )}
        </div>
      </div>
    </GlassCard>
  );
};

const AISuggestionWidget = ({ user, tasks, logs }: { user: any, tasks: any[], logs: any[] }) => {
  const [suggestions, setSuggestions] = useState<any[]>(() => {
    const saved = localStorage.getItem(`ai-suggestions-${user?.uid}`);
    if (saved) {
      try {
        const { data, timestamp } = JSON.parse(saved);
        // Cache for 6 hours
        if (Date.now() - timestamp < 6 * 60 * 60 * 1000) {
          return data;
        }
      } catch (e) { console.error(e); }
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);

  const fetchAI = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setIsQuotaError(false);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userData: { name: user.displayName, email: user.email },
          recentLogs: logs.slice(0, 5),
          tasks: tasks.filter(t => !t.completed).map(t => t.title)
        })
      });
      
      const data = await res.json();
      
      if (res.status === 429) {
        setIsQuotaError(true);
        setError("AI Quota Exceeded");
        return;
      }

      if (res.ok && Array.isArray(data)) {
        setSuggestions(data);
        localStorage.setItem(`ai-suggestions-${user.uid}`, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } else {
        setError(data.error || "Failed to fetch suggestions");
      }
    } catch (e) {
      console.error(e);
      setError("Service Unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // We don't auto-fetch anymore to save quota.
    // The user will click "Get Tips" or the refresh icon.
  }, [user]);

  return (
    <GlassCard className="from-purple-500/10 to-transparent bg-gradient-to-br border-indigo-100 shadow-indigo-100/20 flex flex-col justify-between h-full group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-600" size={20} />
          <h3 className="text-gray-800 font-bold">AI Smart Assistant</h3>
        </div>
        <button 
          onClick={fetchAI}
          disabled={loading}
          className="p-1.5 rounded-full hover:bg-indigo-50 text-indigo-400 transition-colors disabled:opacity-50"
          title="Refresh AI Suggestions"
        >
          <Activity size={16} className={cn(loading && "animate-spin")} />
        </button>
      </div>
      <div className="space-y-3 flex-grow">
        {loading ? (
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-gray-200/50 animate-pulse rounded w-full"></div>
            <div className="h-4 bg-gray-200/50 animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-gray-200/50 animate-pulse rounded w-1/2"></div>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-red-500" />
              <span className="text-xs font-bold text-red-600 uppercase tracking-tight">{error}</span>
            </div>
            <p className="text-[10px] text-red-400 leading-tight mb-2">
              {isQuotaError 
                ? "The AI is currently at its free-tier limit (20 reqs/day). Please try again later."
                : "Something went wrong while analyzing your routine."}
            </p>
            <button 
              onClick={fetchAI}
              className="text-[10px] font-bold text-red-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((s, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <div className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", 
                s.type === 'Health' ? 'bg-rose-400' : 
                s.type === 'Productivity' ? 'bg-indigo-400' : 'bg-amber-400'
              )}></div>
              <p className="text-gray-600 text-[13px] leading-tight group-hover:text-gray-800 transition-colors">
                {s.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 text-xs italic mb-4">No suggestions yet today.</p>
            <button 
              onClick={fetchAI}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Get AI Health Coaching
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

interface HabitItemProps {
  habit: Habit;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit }) => {
  const percentage = Math.min((habit.value / habit.goal) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg text-white", habit.color)}>
            <habit.icon size={14} />
          </div>
          <span className="text-sm font-semibold text-gray-700">{habit.name}</span>
        </div>
        <span className="text-xs font-medium text-gray-400">
          {Math.round(habit.value * 10) / 10} / {habit.goal} {habit.unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn("h-full rounded-full transition-all duration-1000", habit.color)}
        />
      </div>
    </div>
  );
};

export default function App() {
  const { user, loading: firebaseLoading, tasks, logs, login, logout, addTask, toggleTask, addLog } = useFirebase();
  const [currentTab, setTab] = useState("dashboard");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', category: 'Goal', priority: 'medium', scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
  const [logForm, setLogForm] = useState({ type: 'Water', value: 0 });
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [activeTaskAlerts, setActiveTaskAlerts] = useState<any[]>([]);

  // Request notification permission safely (avoid SSR/undefined window reference)
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
          setNotifPermission(permission);
        });
      }
    }
  }, []);

  // Synthesize rich, elegant task alert bell sound using the browser Web Audio API
  const playTaskChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      };

      const nowTime = ctx.currentTime;
      // High quality double-chime ding!
      playTone(523.25, nowTime, 0.35); // C5
      playTone(659.25, nowTime + 0.12, 0.45); // E5
    } catch (e) {
      console.error("Audio chime synthesis failed colorfully: ", e);
    }
  };

  // Notification and Active Alert logic: Checks every 30 seconds
  useEffect(() => {
    const checkTasks = () => {
      const now = format(new Date(), 'hh:mm a');
      tasks.forEach(task => {
        if (!task.completed && (task.time || "").toLowerCase() === now.toLowerCase()) {
          const lastNotified = localStorage.getItem(`notif-${task.id}`);
          const today = format(new Date(), 'yyyy-MM-dd');
          
          if (lastNotified !== today) {
            // 1. Play offline audio alert chime directly inside browser (guaranteed to trigger even in iframes)
            playTaskChime();

            // 2. Trigger browser native notification if permitted
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try {
                new Notification("Task Reminder: " + task.title, {
                  body: `Activity time: It's scheduled design time for your ${task.category} task!`,
                  icon: '/zap-icon.png'
                });
              } catch (e) {
                console.error("Native push failed inside canvas frame", e);
              }
            }

            // 3. Populate app-wide active visual banner
            setActiveTaskAlerts(prev => {
              if (prev.some(t => t.id === task.id)) return prev;
              return [...prev, task];
            });

            // Prevent repeat triggers for today
            localStorage.setItem(`notif-${task.id}`, today);
          }
        }
      });
    };

    const interval = setInterval(checkTasks, 30000); // Check every 30 seconds
    checkTasks(); // Immediate check on mount
    return () => clearInterval(interval);
  }, [tasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    const scheduledDate = new Date(newTask.scheduledAt);
    await addTask(newTask.title, newTask.category, newTask.priority, scheduledDate);
    setNewTask({ title: '', category: 'Goal', priority: 'medium', scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
    setShowAddTask(false);
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const unit = logForm.type === 'Water' ? 'ml' : logForm.type === 'Sleep' ? 'hrs' : 'steps';
    await addLog(logForm.type, Number(logForm.value), unit);
    setLogForm({ ...logForm, value: 0 });
    setShowLogModal(false);
  };

  if (firebaseLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Zap size={48} className="text-indigo-600 animate-pulse" />
          <p className="text-gray-500 font-medium animate-pulse">Initializing Routine Assistant...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <GlassCard className="p-12 text-center space-y-8 shadow-xl">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200">
              <Zap size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">DailyRoutinePro AI</h1>
              <p className="text-gray-500">Master your routine with the power of artificial intelligence.</p>
            </div>
            <button 
              onClick={login}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
            >
              <User size={20} />
              Continue with Google
            </button>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 size={24} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Track</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Sparkles size={24} className="text-purple-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Analyze</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Target size={24} className="text-blue-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Grow</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FE] text-gray-900 font-sans pb-12">
      <Navbar user={user} currentTab={currentTab} setTab={setTab} onLogout={logout} />

      {/* Floating Active Alarms / Reminders */}
      <div className="fixed top-24 right-6 z-[100] max-w-sm w-full space-y-3 pointer-events-none">
        <AnimatePresence>
          {activeTaskAlerts.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className="bg-white/95 backdrop-blur-md border border-amber-200 shadow-xl shadow-amber-500/10 p-4 rounded-2xl flex flex-col gap-3 pointer-events-auto relative overflow-hidden"
            >
              {/* Top ambient color-accent strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-rose-500" />
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 text-amber-500 animate-bounce">
                  <Bell size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      Live Reminder
                    </span>
                    <span className="text-xs font-mono text-gray-500">{alert.time}</span>
                  </div>
                  <h4 className="font-extrabold text-gray-800 text-sm mt-1">{alert.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Time for your {alert.category}!</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTaskAlerts(prev => prev.filter(t => t.id !== alert.id));
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await toggleTask(alert.id, false); // Toggle as completed (currently false, becomes true)
                    setActiveTaskAlerts(prev => prev.filter(t => t.id !== alert.id));
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 size={12} />
                  Complete Task
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-16 space-y-8">
        {currentTab === 'dashboard' ? (
          <>
            {/* Hero / Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Good day, {user.displayName ? user.displayName.split(' ')[0] : 'User'}!
            </h1>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <Calendar size={18} />
              {format(new Date(), 'EEEE, MMMM do')}
            </p>
          </div>
          <div className="flex gap-3">
            <GlassCard className="py-3 px-6 flex items-center gap-4">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Health Score</span>
                <p className="text-xl font-black text-indigo-600">88%</p>
              </div>
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-gray-100 rounded-full"></div>
            </GlassCard>
            <GlassCard className="py-3 px-6 flex items-center gap-4">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Focus Time</span>
                <p className="text-xl font-black text-purple-600">4.5h</p>
              </div>
              <div className="w-10 h-10 border-4 border-purple-600 border-t-gray-100 rounded-full"></div>
            </GlassCard>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Main Content Area */}
          <div className="md:col-span-2 lg:col-span-3 space-y-8">
            
            {/* Top Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <WeatherWidget />
              <AISuggestionWidget user={user} tasks={tasks} logs={logs} />
            </div>

            {/* Productivity Chart */}
            <GlassCard className="h-64">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Activity size={18} className="text-indigo-600" />
                  Productivity Progress
                </h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">Weekly</span>
                </div>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Daily Tasks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Plan Your Day</h3>
                <button 
                  onClick={() => {
                    setNewTask({ ...newTask, scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
                    setShowAddTask(true);
                  }}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Plus size={16} />
                  Add New Task
                </button>
              </div>

              {/* Add Task Modal-ish */}
              <AnimatePresence>
                {showAddTask && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <GlassCard className="mb-4 border-indigo-200">
                      <form onSubmit={handleAddTask} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                          <div className="md:col-span-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Activity Name</label>
                            <input 
                              placeholder="Morning Walk..."
                              value={newTask.title}
                              onChange={e => setNewTask({...newTask, title: e.target.value})}
                              className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                              required
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Label</label>
                            <select 
                              value={newTask.category}
                              onChange={e => setNewTask({...newTask, category: e.target.value})}
                              className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm appearance-none"
                            >
                              <option>Routine</option>
                              <option>Health</option>
                              <option>Exercise</option>
                              <option>Meeting</option>
                              <option>Prayer</option>
                              <option>Study</option>
                              <option>Goal</option>
                            </select>
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Date & Time</label>
                            <input 
                              type="datetime-local"
                              value={newTask.scheduledAt}
                              onChange={e => setNewTask({...newTask, scheduledAt: e.target.value})}
                              className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button type="button" onClick={() => setShowAddTask(false)} className="px-4 py-2 text-gray-500 font-bold text-sm">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors">Schedule Task</button>
                        </div>
                      </form>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 gap-4">
                {tasks.length > 0 ? tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    className={cn(
                      "group relative bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between transition-all hover:shadow-md",
                      task.completed && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleTask(task.id, task.completed)}
                        className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors",
                          task.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 group-hover:border-indigo-400"
                        )}
                      >
                        {task.completed && <CheckCircle2 size={16} />}
                      </button>
                      <div>
                        <h4 className={cn("font-bold text-gray-800", task.completed && "line-through")}>{task.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                            {task.startTime ? <Calendar size={12} /> : <Moon size={12} />}
                            {task.time}
                            {task.startTime && (
                              <span className="ml-1 text-[10px] text-gray-400 font-medium">
                                • {format(task.startTime.toDate(), 'MMM d')}
                              </span>
                            )}
                          </span>
                          <span className={cn(
                            "text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md",
                            task.priority === 'high' ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"
                          )}>
                            {task.priority || 'medium'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 uppercase text-[10px] font-black text-gray-300">
                      {task.category}
                    </div>
                  </motion.div>
                )) : (
                  <p className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                    No tasks yet. Plan your day by adding your first task!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Habit Tracker */}
            <GlassCard>
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <Activity size={18} className="text-indigo-600" />
                Habit Tracking
              </h3>
              <div className="space-y-6">
                {MOCK_HABITS.map(habit => {
                  const todayStr = format(new Date(), 'yyyy-MM-dd');
                  const logValue = logs
                    .filter(l => l.type === habit.name && l.date === todayStr)
                    .reduce((sum, curr) => sum + curr.value, 0);
                  return <HabitItem key={habit.name} habit={{...habit, value: logValue}} />;
                })}
              </div>
              <button 
                onClick={() => setShowLogModal(true)}
                className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-bold hover:border-indigo-200 hover:text-indigo-400 transition-all"
              >
                + Log Progress
              </button>
            </GlassCard>

            {/* Habit Log Modal */}
            <AnimatePresence>
              {showLogModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowLogModal(false)}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm"
                  >
                    <GlassCard className="shadow-2xl border-white">
                      <h3 className="text-xl font-bold mb-6">Log Daily Health</h3>
                      <form onSubmit={handleAddLog} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Habit Type</label>
                          <select 
                            value={logForm.type}
                            onChange={e => setLogForm({...logForm, type: e.target.value})}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100"
                          >
                            <option>Water</option>
                            <option>Sleep</option>
                            <option>Steps</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Value</label>
                          <div className="relative">
                            <input 
                              type="number"
                              value={logForm.value}
                              onChange={e => setLogForm({...logForm, value: Number(e.target.value)})}
                              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100"
                              placeholder="0"
                            />
                            <span className="absolute right-4 top-4 text-gray-400 font-bold">
                              {logForm.type === 'Water' ? 'ml' : logForm.type === 'Sleep' ? 'hrs' : 'steps'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button 
                            type="button" 
                            onClick={() => setShowLogModal(false)}
                            className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
                          >
                            Log Entry
                          </button>
                        </div>
                      </form>
                    </GlassCard>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* App Features Guide */}
            <div className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-12 -translate-y-12"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Info size={16} />
                  </div>
                  <h4 className="font-bold">App Features Guide</h4>
                </div>
                <div className="space-y-4 text-xs text-indigo-50 leading-relaxed">
                  <p><strong>💧 Hydration & Health:</strong> Track water, sleep, and steps. Circular charts visualize progress toward daily goals.</p>
                  <p><strong>✅ Smart Tasks:</strong> Organize your day. Browser notifications will remind you at the exact scheduled time.</p>
                  <p><strong>🤖 AI Assistant:</strong> Gemini AI analyzes your logs to provide personalized health and productivity tips.</p>
                  <p><strong>🌦️ Weather Update:</strong> Live local weather helps you stay prepared for the day's environment.</p>
                </div>
              </div>
            </div>

            {/* Daily Quote */}
            <div className="p-2">
              <p className="text-gray-400 text-sm italic text-center">
                "The secret of your future is hidden in your daily routine."
              </p>
            </div>
          </div>

        </div>
        </>
        ) : currentTab === 'habits' ? (
          <HabitsTab logs={logs} addLog={addLog} />
        ) : currentTab === 'reminders' ? (
          <RemindersTab tasks={tasks} />
        ) : currentTab === 'analytics' ? (
          <AnalyticsTab tasks={tasks} logs={logs} />
        ) : (
          <AIAssistantTab user={user} tasks={tasks} logs={logs} />
        )}
      </main>
      
      {/* Floating Action Button */}
      {(currentTab === 'dashboard' || currentTab === 'reminders') && (
        <button 
          onClick={() => setShowAddTask(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-300 hover:scale-110 transition-transform z-50 cursor-pointer"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
