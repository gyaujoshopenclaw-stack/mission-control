import { create } from 'zustand';
import { api } from '../lib/api';
import type { Task, Activity, TaskStatus, AppTab, ThemeName, Upgrade } from '../types/task';
import { DEFAULT_VISIBLE_COLUMNS } from '../types/task';

export type Density = 'compact' | 'comfortable' | 'spacious';
export type KaiStatus = 'online' | 'thinking' | 'offline';

interface TaskStore {
  tasks: Task[];
  activity: Activity[];
  selectedTaskId: string | null;
  searchQuery: string;
  filterPriority: string | null;
  filterLabel: string | null;
  commandPaletteOpen: boolean;
  loading: boolean;
  lastCompletedAt: number;
  density: Density;
  activeTab: AppTab;
  visibleColumns: TaskStatus[];
  kaiStatus: KaiStatus;
  sidebarOpen: boolean;
  showQuickStats: boolean;
  showActivityFeed: boolean;
  showUpgradesPanel: boolean;
  theme: ThemeName;
  upgrades: Upgrade[];

  fetchTasks: () => Promise<void>;
  fetchActivity: () => Promise<void>;
  fetchUpgrades: () => Promise<void>;
  updateUpgrade: (id: string, data: Partial<Upgrade>) => Promise<void>;
  deleteUpgrade: (id: string) => Promise<void>;
  generateUpgrades: () => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, newStatus: TaskStatus, newOrder: number) => Promise<void>;
  reorderTasks: (updates: { id: string; status: string; order: number }[]) => Promise<void>;
  selectTask: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setFilterPriority: (p: string | null) => void;
  setFilterLabel: (l: string | null) => void;
  toggleCommandPalette: () => void;
  setLastCompletedAt: (ts: number) => void;
  setDensity: (d: Density) => void;
  setActiveTab: (tab: AppTab) => void;
  setVisibleColumns: (cols: TaskStatus[]) => void;
  toggleColumnVisibility: (col: TaskStatus) => void;
  setKaiStatus: (s: KaiStatus) => void;
  toggleSidebar: () => void;
  setShowQuickStats: (v: boolean) => void;
  setShowActivityFeed: (v: boolean) => void;
  setShowUpgradesPanel: (v: boolean) => void;
  setTheme: (t: ThemeName) => void;

  getFilteredTasks: (status: TaskStatus) => Task[];
}

function loadDensity(): Density {
  try {
    const v = localStorage.getItem('mc-density');
    if (v === 'compact' || v === 'comfortable' || v === 'spacious') return v;
  } catch {}
  return 'comfortable';
}

function loadVisibleColumns(): TaskStatus[] {
  try {
    const v = localStorage.getItem('mc-visible-columns');
    if (v) return JSON.parse(v);
  } catch {}
  return DEFAULT_VISIBLE_COLUMNS;
}

function loadShowQuickStats(): boolean {
  try {
    const v = localStorage.getItem('mc-show-quick-stats');
    if (v !== null) return JSON.parse(v);
  } catch {}
  return true;
}

function loadShowActivityFeed(): boolean {
  try {
    const v = localStorage.getItem('mc-show-activity-feed');
    if (v !== null) return JSON.parse(v);
  } catch {}
  return true;
}

function loadShowUpgradesPanel(): boolean {
  try {
    const v = localStorage.getItem('mc-show-upgrades-panel');
    if (v !== null) return JSON.parse(v);
  } catch {}
  return true;
}

function loadTheme(): ThemeName {
  try {
    const v = localStorage.getItem('mc-theme');
    if (v === 'space-ops' || v === 'midnight') return v;
  } catch {}
  return 'space-ops';
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  activity: [],
  selectedTaskId: null,
  searchQuery: '',
  filterPriority: null,
  filterLabel: null,
  commandPaletteOpen: false,
  loading: false,
  lastCompletedAt: 0,
  density: loadDensity(),
  activeTab: 'dashboard',
  visibleColumns: loadVisibleColumns(),
  kaiStatus: 'online',
  sidebarOpen: false,
  showQuickStats: loadShowQuickStats(),
  showActivityFeed: loadShowActivityFeed(),
  showUpgradesPanel: loadShowUpgradesPanel(),
  theme: loadTheme(),
  upgrades: [],

  fetchTasks: async () => {
    const tasks = await api.getTasks();
    set({ tasks });
  },

  fetchActivity: async () => {
    const activity = await api.getActivity();
    set({ activity });
  },

  fetchUpgrades: async () => {
    const upgrades = await api.getUpgrades();
    set({ upgrades });
  },

  updateUpgrade: async (id, data) => {
    await api.updateUpgrade(id, data);
    await get().fetchUpgrades();
  },

  deleteUpgrade: async (id) => {
    await api.deleteUpgrade(id);
    await get().fetchUpgrades();
  },

  generateUpgrades: async () => {
    set({ kaiStatus: 'thinking' });
    try {
      await api.generateUpgrades();
      await get().fetchUpgrades();
    } finally {
      set({ kaiStatus: 'online' });
    }
  },

  createTask: async (data) => {
    const task = await api.createTask(data);
    await get().fetchTasks();
    await get().fetchActivity();
    return task;
  },

  updateTask: async (id, data) => {
    await api.updateTask(id, data);
    await get().fetchTasks();
    await get().fetchActivity();
  },

  deleteTask: async (id) => {
    await api.deleteTask(id);
    set({ selectedTaskId: null });
    await get().fetchTasks();
    await get().fetchActivity();
  },

  moveTask: async (id, newStatus, newOrder) => {
    set(state => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, status: newStatus, order: newOrder } : t)
    }));
    await api.updateTask(id, { status: newStatus, order: newOrder });
    await get().fetchActivity();
  },

  reorderTasks: async (updates) => {
    set(state => {
      const newTasks = [...state.tasks];
      for (const u of updates) {
        const idx = newTasks.findIndex(t => t.id === u.id);
        if (idx !== -1) {
          newTasks[idx] = { ...newTasks[idx], status: u.status as TaskStatus, order: u.order };
        }
      }
      return { tasks: newTasks };
    });
    await api.reorderTasks(updates);
  },

  selectTask: (id) => set({ selectedTaskId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterPriority: (p) => set({ filterPriority: p }),
  setFilterLabel: (l) => set({ filterLabel: l }),
  toggleCommandPalette: () => set(s => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setLastCompletedAt: (ts) => set({ lastCompletedAt: ts }),
  setDensity: (d) => {
    localStorage.setItem('mc-density', d);
    set({ density: d });
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
  setVisibleColumns: (cols) => {
    localStorage.setItem('mc-visible-columns', JSON.stringify(cols));
    set({ visibleColumns: cols });
  },
  toggleColumnVisibility: (col) => {
    const { visibleColumns } = get();
    const next = visibleColumns.includes(col)
      ? visibleColumns.filter(c => c !== col)
      : [...visibleColumns, col];
    localStorage.setItem('mc-visible-columns', JSON.stringify(next));
    set({ visibleColumns: next });
  },
  setKaiStatus: (s) => set({ kaiStatus: s }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setShowQuickStats: (v) => {
    localStorage.setItem('mc-show-quick-stats', JSON.stringify(v));
    set({ showQuickStats: v });
  },
  setShowActivityFeed: (v) => {
    localStorage.setItem('mc-show-activity-feed', JSON.stringify(v));
    set({ showActivityFeed: v });
  },
  setShowUpgradesPanel: (v) => {
    localStorage.setItem('mc-show-upgrades-panel', JSON.stringify(v));
    set({ showUpgradesPanel: v });
  },
  setTheme: (t) => {
    localStorage.setItem('mc-theme', t);
    document.documentElement.setAttribute('data-theme', t);
    set({ theme: t });
  },

  getFilteredTasks: (status) => {
    const { tasks, searchQuery, filterPriority, filterLabel } = get();
    return tasks
      .filter(t => t.status === status)
      .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(t => !filterPriority || t.priority === filterPriority)
      .filter(t => !filterLabel || t.labels.includes(filterLabel))
      .sort((a, b) => a.order - b.order);
  },
}));
