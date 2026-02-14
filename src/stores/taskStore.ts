import { create } from 'zustand';
import { api } from '../lib/api';
import type { Task, Activity, TaskStatus, AppTab } from '../types/task';
import { DEFAULT_VISIBLE_COLUMNS } from '../types/task';

export type Density = 'compact' | 'comfortable' | 'spacious';
export type ClawStatus = 'online' | 'thinking' | 'offline';

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
  clawStatus: ClawStatus;
  sidebarOpen: boolean;

  fetchTasks: () => Promise<void>;
  fetchActivity: () => Promise<void>;
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
  setClawStatus: (s: ClawStatus) => void;
  toggleSidebar: () => void;

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
  clawStatus: 'online',
  sidebarOpen: true,

  fetchTasks: async () => {
    const tasks = await api.getTasks();
    set({ tasks });
  },

  fetchActivity: async () => {
    const activity = await api.getActivity();
    set({ activity });
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
  setClawStatus: (s) => set({ clawStatus: s }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

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
