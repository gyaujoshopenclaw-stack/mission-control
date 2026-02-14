import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');
const META_FILE = path.join(DATA_DIR, 'meta.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

// Ensure dirs exist
[DATA_DIR, BACKUPS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// Initialize files if missing
if (!fs.existsSync(TASKS_FILE)) fs.writeFileSync(TASKS_FILE, '[]');
if (!fs.existsSync(ACTIVITY_FILE)) fs.writeFileSync(ACTIVITY_FILE, '[]');
if (!fs.existsSync(META_FILE)) fs.writeFileSync(META_FILE, JSON.stringify({ nextTaskNumber: 1 }));

// Broadcast callback - set by server/index.ts
let broadcastFn: ((event: { type: string; payload: unknown }) => void) | null = null;
export function setBroadcast(fn: (event: { type: string; payload: unknown }) => void) {
  broadcastFn = fn;
}
function broadcast(type: string, payload: unknown) {
  if (broadcastFn) broadcastFn({ type, payload });
}

function readJSON(file: string): any[] {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return []; }
}

function readMeta(): { nextTaskNumber: number } {
  try { return JSON.parse(fs.readFileSync(META_FILE, 'utf-8')); }
  catch { return { nextTaskNumber: 1 }; }
}

function writeMeta(meta: { nextTaskNumber: number }) {
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}

function writeJSON(file: string, data: any[]) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function logActivity(action: string, taskTitle: string, details: string) {
  const activities = readJSON(ACTIVITY_FILE);
  activities.unshift({ id: uuidv4(), action, taskTitle, details, timestamp: new Date().toISOString() });
  if (activities.length > 200) activities.length = 200;
  writeJSON(ACTIVITY_FILE, activities);
}

function autoBackup() {
  const today = new Date().toISOString().slice(0, 10);
  const backupFile = path.join(BACKUPS_DIR, `tasks-${today}.json`);
  if (!fs.existsSync(backupFile)) {
    try { fs.copyFileSync(TASKS_FILE, backupFile); } catch {}
  }
}

export function getAllTasks(status?: string) {
  autoBackup();
  const tasks = readJSON(TASKS_FILE);
  if (status) return tasks.filter((t: any) => t.status === status);
  return tasks;
}

export function getTask(id: string) {
  return readJSON(TASKS_FILE).find((t: any) => t.id === id) || null;
}

export function createTask(data: any) {
  const tasks = readJSON(TASKS_FILE);
  const meta = readMeta();
  const sameStatus = tasks.filter((t: any) => t.status === (data.status || 'backlog'));
  const taskNumber = `MC-${meta.nextTaskNumber}`;
  meta.nextTaskNumber++;
  writeMeta(meta);

  const task = {
    id: uuidv4(),
    taskNumber,
    title: data.title || 'Untitled',
    description: data.description || '',
    status: data.status || 'backlog',
    priority: data.priority || 'medium',
    labels: data.labels || [],
    assignee: data.assignee || 'josh',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: data.dueDate || null,
    order: data.order ?? sameStatus.length,
  };
  tasks.push(task);
  writeJSON(TASKS_FILE, tasks);
  logActivity('created', task.title, `Created in ${task.status}`);
  broadcast('task.created', task);
  return task;
}

export function updateTask(id: string, data: any) {
  const tasks = readJSON(TASKS_FILE);
  const idx = tasks.findIndex((t: any) => t.id === id);
  if (idx === -1) return null;
  const old = tasks[idx];
  const updated = { ...old, ...data, id: old.id, taskNumber: old.taskNumber, createdAt: old.createdAt, updatedAt: new Date().toISOString() };
  tasks[idx] = updated;
  writeJSON(TASKS_FILE, tasks);

  if (old.status !== updated.status) {
    logActivity('moved', updated.title, `${old.status} → ${updated.status}`);
    broadcast('task.moved', updated);
  } else {
    logActivity('updated', updated.title, 'Task updated');
    broadcast('task.updated', updated);
  }
  return updated;
}

export function deleteTask(id: string) {
  const tasks = readJSON(TASKS_FILE);
  const idx = tasks.findIndex((t: any) => t.id === id);
  if (idx === -1) return false;
  const task = tasks[idx];
  tasks.splice(idx, 1);
  writeJSON(TASKS_FILE, tasks);
  logActivity('deleted', task.title, 'Task deleted');
  broadcast('task.deleted', { id, title: task.title });
  return true;
}

export function getActivity(limit = 50) {
  return readJSON(ACTIVITY_FILE).slice(0, limit);
}

export function reorderTasks(updates: { id: string; status: string; order: number }[]) {
  const tasks = readJSON(TASKS_FILE);
  for (const u of updates) {
    const idx = tasks.findIndex((t: any) => t.id === u.id);
    if (idx !== -1) {
      const old = tasks[idx];
      if (old.status !== u.status) {
        logActivity('moved', old.title, `${old.status} → ${u.status}`);
      }
      tasks[idx] = { ...old, status: u.status, order: u.order, updatedAt: new Date().toISOString() };
    }
  }
  writeJSON(TASKS_FILE, tasks);
  broadcast('task.updated', { reorder: true, updates });
}
