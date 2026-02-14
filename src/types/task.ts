export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'archived';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskAssignee = 'josh' | 'kai';

export interface Task {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[];
  assignee: TaskAssignee;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  order: number;
}

export interface Activity {
  id: string;
  action: 'created' | 'updated' | 'moved' | 'deleted';
  taskTitle: string;
  details: string;
  timestamp: string;
}

export const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
  { id: 'archived', title: 'Archived' },
];

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; emoji: string; color: string }> = {
  critical: { label: 'Critical', emoji: '🔴', color: '#ef4444' },
  high: { label: 'High', emoji: '🟡', color: '#eab308' },
  medium: { label: 'Medium', emoji: '🟢', color: '#22c55e' },
  low: { label: 'Low', emoji: '🔵', color: '#3b82f6' },
};

export type AppTab = 'dashboard' | 'backlog' | 'upgrades' | 'docs' | 'log' | 'settings';
export type ThemeName = 'space-ops' | 'midnight';

export type UpgradeStatus = 'proposed' | 'approved' | 'in-progress' | 'completed' | 'cancelled';

export interface Upgrade {
  id: string;
  title: string;
  description: string;
  category: string;
  status: UpgradeStatus;
  rank: number;
  estimatedImpact: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_VISIBLE_COLUMNS: TaskStatus[] = ['todo', 'in-progress', 'done', 'archived'];
