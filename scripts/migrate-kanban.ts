import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const KANBAN_PATH = path.join(process.cwd(), '..', 'KANBAN.md');
const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

const statusMap: Record<string, string> = {
  'Backlog': 'backlog',
  'In Progress': 'in-progress',
  'Review': 'review',
  'Completed': 'done',
};

const content = fs.readFileSync(KANBAN_PATH, 'utf-8');
const tasks: any[] = [];
let currentSection = '';
let currentSubsection = '';
let order = 0;

for (const line of content.split('\n')) {
  const sectionMatch = line.match(/^## (.+)/);
  if (sectionMatch) {
    currentSection = sectionMatch[1].trim();
    order = 0;
    continue;
  }
  const subMatch = line.match(/^### (.+)/);
  if (subMatch) {
    currentSubsection = subMatch[1].trim();
    continue;
  }
  // Match both bold and non-bold task lines
  const taskMatch = line.match(/^- \[( |x)\] (?:\*\*(.+?)\*\*(?::?\s*(.*))?|(.+))$/);
  if (taskMatch && statusMap[currentSection]) {
    const done = taskMatch[1] === 'x';
    const title = (taskMatch[2] || taskMatch[4] || '').trim();
    const desc = (taskMatch[3] || '').trim();
    if (!title) continue;
    tasks.push({
      id: uuidv4(),
      title,
      description: desc,
      status: done ? 'done' : statusMap[currentSection],
      priority: 'medium',
      labels: currentSubsection ? [currentSubsection.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')] : [],
      assignee: 'josh',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: null,
      order: order++,
    });
  }
}

fs.mkdirSync(path.dirname(TASKS_FILE), { recursive: true });
fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
console.log(`✅ Migrated ${tasks.length} tasks from KANBAN.md`);
