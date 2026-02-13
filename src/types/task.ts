export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'archived';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskAssignee = 'josh' | 'openclaw';

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
