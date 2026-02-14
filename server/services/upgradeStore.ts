import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const DATA_DIR = path.join(process.cwd(), 'data');
const UPGRADES_FILE = path.join(DATA_DIR, 'upgrades.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const MAX_ACTIVE_UPGRADES = 10;
const ACTIVE_STATUSES = ['proposed', 'approved', 'in-progress'];

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPGRADES_FILE)) fs.writeFileSync(UPGRADES_FILE, '[]');

// Broadcast callback
let broadcastFn: ((event: { type: string; payload: unknown }) => void) | null = null;
export function setUpgradeBroadcast(fn: (event: { type: string; payload: unknown }) => void) {
  broadcastFn = fn;
}
function broadcast(type: string, payload: unknown) {
  if (broadcastFn) broadcastFn({ type, payload });
}

function readJSON(file: string): any[] {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return []; }
}

function writeJSON(file: string, data: any[]) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function getAllUpgrades(status?: string) {
  const upgrades = readJSON(UPGRADES_FILE);
  if (status) return upgrades.filter((u: any) => u.status === status);
  return upgrades;
}

export function getUpgrade(id: string) {
  return readJSON(UPGRADES_FILE).find((u: any) => u.id === id) || null;
}

export function createUpgrade(data: any) {
  const upgrades = readJSON(UPGRADES_FILE);
  const upgrade = {
    id: uuidv4(),
    title: data.title || 'Untitled Upgrade',
    description: data.description || '',
    category: data.category || 'feature',
    status: data.status || 'proposed',
    rank: data.rank ?? upgrades.length + 1,
    estimatedImpact: data.estimatedImpact || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  upgrades.push(upgrade);
  writeJSON(UPGRADES_FILE, upgrades);
  broadcast('upgrade.created', upgrade);
  return upgrade;
}

export function updateUpgrade(id: string, data: any) {
  const upgrades = readJSON(UPGRADES_FILE);
  const idx = upgrades.findIndex((u: any) => u.id === id);
  if (idx === -1) return null;
  const old = upgrades[idx];
  const updated = { ...old, ...data, id: old.id, createdAt: old.createdAt, updatedAt: new Date().toISOString() };
  upgrades[idx] = updated;
  writeJSON(UPGRADES_FILE, upgrades);
  broadcast('upgrade.updated', updated);
  return updated;
}

export function deleteUpgrade(id: string) {
  const upgrades = readJSON(UPGRADES_FILE);
  const idx = upgrades.findIndex((u: any) => u.id === id);
  if (idx === -1) return false;
  const upgrade = upgrades[idx];
  upgrades.splice(idx, 1);
  writeJSON(UPGRADES_FILE, upgrades);
  broadcast('upgrade.deleted', { id, title: upgrade.title });
  return true;
}

export async function generateUpgrades(): Promise<any[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('ANTHROPIC_API_KEY not configured. Please set it in your .env file.');
  }

  const upgrades = readJSON(UPGRADES_FILE);
  const tasks = readJSON(TASKS_FILE);

  // Check active upgrade count
  const activeCount = upgrades.filter((u: any) => ACTIVE_STATUSES.includes(u.status)).length;
  if (activeCount >= MAX_ACTIVE_UPGRADES) {
    throw new Error(`Maximum active upgrades (${MAX_ACTIVE_UPGRADES}) reached. Complete or cancel existing upgrades first.`);
  }

  const slotsAvailable = MAX_ACTIVE_UPGRADES - activeCount;
  const toGenerate = Math.min(5, slotsAvailable);

  const client = new Anthropic({ apiKey });

  const existingUpgradesSummary = upgrades.map((u: any) =>
    `- [${u.status}] ${u.title}: ${u.description} (Category: ${u.category}, Impact: ${u.estimatedImpact})`
  ).join('\n') || 'No existing upgrades.';

  const tasksSummary = tasks.slice(0, 30).map((t: any) =>
    `- [${t.status}] ${t.title} (Priority: ${t.priority}, Labels: ${t.labels.join(', ') || 'none'})`
  ).join('\n') || 'No tasks.';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    system: `You are Kai, an AI assistant that helps manage tasks and improve systems. You are analyzing your own capabilities and the user's workflow to suggest upgrades that would make you more powerful and valuable.

You should think about:
- New tools or integrations that would expand your capabilities
- Features that would improve the user's workflow
- Automations that could save time
- Skills or functionalities you could learn/build
- Optimizations to existing systems

Each upgrade should be specific, actionable, and clearly valuable. Focus on what would bring the most impact.`,
    messages: [{
      role: 'user',
      content: `Analyze the current system state and suggest ${toGenerate} high-value upgrades.

EXISTING UPGRADES (avoid duplicates):
${existingUpgradesSummary}

CURRENT TASKS (for context on what the user is working on):
${tasksSummary}

Respond with a JSON array of exactly ${toGenerate} upgrades. Each upgrade should have:
- "title": short, clear name (max 60 chars)
- "description": what it does and why it's valuable (2-3 sentences)
- "category": one of "tool", "feature", "integration", "optimization", "automation"
- "estimatedImpact": brief impact statement starting with "High", "Medium", or "Low"

Respond ONLY with the JSON array, no other text.`
    }],
  });

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from AI');
  }

  let suggestions: any[];
  try {
    const jsonText = textContent.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    suggestions = JSON.parse(jsonText);
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }

  if (!Array.isArray(suggestions)) {
    throw new Error('AI response is not an array');
  }

  // Create upgrade records
  const created: any[] = [];
  for (let i = 0; i < suggestions.length; i++) {
    const s = suggestions[i];
    const upgrade = createUpgrade({
      title: s.title || 'Untitled',
      description: s.description || '',
      category: s.category || 'feature',
      status: 'proposed',
      estimatedImpact: s.estimatedImpact || '',
    });
    created.push(upgrade);
  }

  // Re-rank all active upgrades
  await rerankUpgrades();

  return created;
}

export async function rerankUpgrades(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') return;

  const upgrades = readJSON(UPGRADES_FILE);
  const active = upgrades.filter((u: any) => ACTIVE_STATUSES.includes(u.status));

  if (active.length <= 1) return;

  const client = new Anthropic({ apiKey });

  const upgradeList = active.map((u: any, i: number) =>
    `${i + 1}. "${u.title}" - ${u.description} (Impact: ${u.estimatedImpact})`
  ).join('\n');

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Rank these upgrades from highest to lowest value. Consider impact, feasibility, and strategic importance.

${upgradeList}

Respond ONLY with a JSON array of the original numbers in ranked order (highest value first). Example: [3, 1, 2]`
      }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') return;

    const jsonText = textContent.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const ranking: number[] = JSON.parse(jsonText);

    if (!Array.isArray(ranking)) return;

    // Apply ranking
    for (let rank = 0; rank < ranking.length; rank++) {
      const originalIdx = ranking[rank] - 1;
      if (originalIdx >= 0 && originalIdx < active.length) {
        const upgradeId = active[originalIdx].id;
        const globalIdx = upgrades.findIndex((u: any) => u.id === upgradeId);
        if (globalIdx !== -1) {
          upgrades[globalIdx] = { ...upgrades[globalIdx], rank: rank + 1, updatedAt: new Date().toISOString() };
        }
      }
    }

    writeJSON(UPGRADES_FILE, upgrades);
    broadcast('upgrade.updated', { rerank: true });
  } catch {
    // Silently fail ranking — upgrades are still created
  }
}
