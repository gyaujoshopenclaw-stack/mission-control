# 🚀 Mission Control Center — Plan

> Josh's command center for managing projects and interfacing with OpenClaw.

---

## 1. Vision & Core Features (v1)

### What Makes This "Mission Control"

This isn't Trello. It's a **personal command center** — the single pane of glass where Josh sees everything that matters and talks to his AI. The Kanban board is the backbone, but the frame around it is what makes it special:

- **Status bar** at the top showing OpenClaw status (online/offline), current time, last sync, active tasks count — like a spacecraft dashboard
- **Quick command input** — a spotlight-style bar (`Cmd+K`) to create tasks, search, or eventually send commands to OpenClaw
- **Activity feed** — a slim sidebar showing recent OpenClaw actions ("✅ Completed: Deploy script", "📝 Created: Fix auth bug")
- **Ambient awareness** — subtle visual cues that this system is *alive* (pulse animations on active items, smooth transitions)

### Kanban Board (Primary Feature)

- **Columns:** Backlog → To Do → In Progress → Review → Done → Archived
- **Drag-and-drop** between columns (touch-friendly too)
- **Task cards** show: title, priority badge (🔴🟡🟢), labels (colored chips), assignee (Josh or OpenClaw), due date, description preview
- **Quick-add** at top of any column — just type and hit Enter
- **Inline editing** — click a card to expand it into a detail panel (slide-over, not modal)
- **Filters** — by label, priority, assignee, search text
- **Keyboard shortcuts** — `n` new task, `/` search, `1-6` jump to column, arrow keys to navigate cards

### Fun Elements

- **Launch sequence** on first load — brief 1.5s animation: screen flickers on, status indicators light up sequentially, a subtle "system online" sound (optional, off by default)
- **Task completion** — satisfying confetti burst (small, tasteful) when dragging to Done
- **Easter egg** — Konami code triggers a "Houston, we have a problem" alert with a silly animation
- **Card hover** — subtle glow effect based on priority color
- **Dark mode default** — space theme, obviously. Light mode available but the dark mode is the *real* one
- **Smooth micro-animations** everywhere — cards lift on drag, columns breathe on hover, transitions feel buttery

---

## 2. Tech Stack

### Decision: React + Vite + Tailwind + Express API

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | React 18 + TypeScript | Ecosystem, component model, Claude Code knows it cold |
| **Build** | Vite | Fast, simple, no webpack headaches |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid UI dev, consistent design tokens, great dark mode |
| **Drag & Drop** | @dnd-kit | Modern, accessible, performant, best React DnD lib |
| **State** | Zustand | Tiny, simple, no boilerplate. Redux is overkill here |
| **Backend** | Express.js (lightweight API) | Needed for file I/O to workspace. Runs in same container |
| **Data** | JSON file on disk (`mission-control/data/tasks.json`) | Simple, OpenClaw can read/write it directly, no DB needed |
| **Icons** | Lucide React | Clean, consistent, tree-shakeable |
| **Animations** | Framer Motion | Best React animation lib, handles drag animations too |
| **Sound** | Howler.js (tiny) | For optional UI sounds |

### Why a Backend?

The app runs inside the OpenClaw Docker container. It needs to read/write `tasks.json` on disk — that means a small Express server. This also gives us a clean path to future features (WebSocket for real-time, API for OpenClaw integration).

### Integration with OpenClaw

OpenClaw updates tasks by:
1. **Direct file edit** — Agent reads/writes `tasks.json` (same workspace). This works today with zero additional infra.
2. **REST API** (v1) — Express exposes `GET/POST/PATCH/DELETE /api/tasks`. Agent can call these via `web_fetch` or `exec curl`.
3. **WebSocket** (v2) — Real-time push updates when agent modifies tasks.

### Data Persistence

```
mission-control/data/tasks.json   ← single source of truth
mission-control/data/backups/     ← daily auto-snapshots
```

Schema (per task):
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string (markdown)",
  "status": "backlog|todo|in-progress|review|done|archived",
  "priority": "critical|high|medium|low",
  "labels": ["string"],
  "assignee": "josh|openclaw",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "dueDate": "ISO8601|null",
  "order": "number (position within column)"
}
```

### Migration from KANBAN.md

A one-time script parses the existing `KANBAN.md` and converts tasks into `tasks.json`. We keep `KANBAN.md` as a read-only generated view for backward compatibility (agent regenerates it on changes).

---

## 3. UI/UX Design Direction

### Theme: "Deep Space Ops"

Dark background (#0a0e1a), accent colors in electric blue (#3b82f6) and subtle cyan (#06b6d4). Cards are semi-transparent glass-morphism panels with soft borders. Status indicators glow. Typography is clean sans-serif (Inter). The overall feel: **you're running a space mission, but it's cozy and usable, not cosplay.**

Key design principles:
- **Information density without clutter** — show a lot, but make it scannable
- **Color = meaning** — priority colors, status colors, label colors are consistent everywhere
- **Motion = feedback** — every action has a response, but nothing is gratuitous
- **Dark-first** — the light theme works but dark is the primary experience

### Key Screens/Views

1. **Main Dashboard** (default view)
   - Top: Status bar (OpenClaw status, time, task counts, quick-command trigger)
   - Center: Kanban board (full width, horizontally scrollable columns)
   - Right: Activity feed panel (collapsible, ~280px)

2. **Task Detail** (slide-over panel)
   - Opens from right when clicking a card
   - Full task editing: title, description (markdown editor), priority, labels, dates
   - Activity log for that task at bottom
   - Doesn't navigate away from the board

3. **Command Palette** (`Cmd+K`)
   - Floating overlay — search tasks, create new, quick-filter, jump to views
   - Fuzzy search, keyboard-navigable

### Mobile Responsiveness

- **Tablet:** Board scrolls horizontally, activity feed hidden behind toggle
- **Phone:** Single-column view — pick a status column from a tab bar, swipe between them. Task detail goes full-screen.
- Breakpoints: 640px (phone), 1024px (tablet), 1280px+ (desktop)

### Accessibility

- Full keyboard navigation (tab order, focus rings, arrow key movement)
- ARIA labels on all interactive elements (dnd-kit handles drag a11y)
- Color-blind safe palette (priority uses shape + color, not color alone)
- Reduced-motion media query disables animations
- Minimum contrast ratios on all text (WCAG AA)

---

## 4. Architecture

### Folder Structure

```
mission-control/
├── PLAN.md                  ← this file
├── data/
│   ├── tasks.json           ← task data (source of truth)
│   └── backups/             ← daily snapshots
├── server/
│   ├── index.ts             ← Express entry point
│   ├── routes/
│   │   └── tasks.ts         ← CRUD API
│   ├── services/
│   │   └── taskStore.ts     ← file I/O, validation
│   └── middleware/
│       └── cors.ts
├── src/
│   ├── main.tsx             ← app entry
│   ├── App.tsx              ← layout + routing
│   ├── components/
│   │   ├── Board/
│   │   │   ├── Board.tsx         ← kanban container
│   │   │   ├── Column.tsx        ← single column
│   │   │   ├── TaskCard.tsx      ← draggable card
│   │   │   └── QuickAdd.tsx      ← inline task creation
│   │   ├── TaskDetail/
│   │   │   ├── TaskDetail.tsx    ← slide-over panel
│   │   │   └── MarkdownEditor.tsx
│   │   ├── StatusBar/
│   │   │   └── StatusBar.tsx     ← top bar
│   │   ├── ActivityFeed/
│   │   │   └── ActivityFeed.tsx  ← right sidebar
│   │   ├── CommandPalette/
│   │   │   └── CommandPalette.tsx
│   │   └── ui/                   ← shadcn components
│   ├── stores/
│   │   └── taskStore.ts     ← Zustand store
│   ├── hooks/
│   │   ├── useTasks.ts      ← API calls
│   │   └── useKeyboard.ts   ← shortcut handling
│   ├── lib/
│   │   ├── api.ts           ← fetch wrapper
│   │   ├── sounds.ts        ← sound effects
│   │   └── confetti.ts      ← completion celebration
│   ├── types/
│   │   └── task.ts          ← TypeScript interfaces
│   └── styles/
│       └── globals.css      ← Tailwind base + custom
├── public/
│   └── sounds/              ← optional UI sounds
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### Data Flow

```
User drags card → dnd-kit event → Zustand store update (optimistic) → API PATCH /tasks/:id
                                                                         ↓
                                                                    taskStore.ts writes tasks.json
                                                                         ↓
                                                                    Response confirms → UI stays
                                                                    (or rolls back on error)

OpenClaw agent → exec: curl PATCH /api/tasks/:id → taskStore.ts writes tasks.json
              → OR direct edit of tasks.json (agent reads/writes file)
```

For v1, polling every 5s keeps the UI in sync with agent-side file changes. WebSocket replaces this in v2.

### How OpenClaw Updates Tasks Programmatically

The agent has three paths (all valid in v1):

1. **API calls** — `web_fetch` to `http://localhost:3333/api/tasks` with JSON body. Clean, validated, immediate.
2. **File edit** — Agent edits `tasks.json` directly. UI picks up changes on next poll.
3. **Helper script** — A tiny CLI script `mission-control/scripts/task.sh` that wraps curl for common operations:
   ```bash
   ./task.sh create "Fix login bug" --priority high --label backend
   ./task.sh move <id> done
   ./task.sh list in-progress
   ```

---

## 5. Phased Roadmap

### v1 — "First Launch" (BUILD THIS NOW)

- ✅ Kanban board with drag-and-drop (6 columns)
- ✅ Task CRUD (create, edit, delete, reorder)
- ✅ Priority badges, labels, assignee
- ✅ Task detail slide-over panel
- ✅ Status bar with task counts
- ✅ Command palette (Cmd+K) for search + quick-create
- ✅ Dark theme ("Deep Space Ops")
- ✅ Express API for task management
- ✅ Migration script from KANBAN.md
- ✅ Basic activity feed (log of recent changes)
- ✅ Fun: launch animation, completion confetti, card hover effects
- ✅ Keyboard shortcuts
- ✅ Mobile-responsive layout
- ✅ Auto-backup of tasks.json

### v2 — "Comms Online"

- Chat panel — talk to OpenClaw from the web app (Telegram bridge or direct API)
- Real-time sync via WebSocket (no more polling)
- Dashboard widgets (task burndown, completion rate, active time)
- Notification system (browser notifications for agent updates)
- Light theme option
- Task templates (recurring task patterns)
- Due date reminders with calendar view
- Multiple boards / projects

### v3 — "Full Command Center"

- Voice input — speak commands to OpenClaw
- Live terminal view — see what OpenClaw is doing in real-time
- File browser — navigate workspace from the web
- Email/calendar integration panels
- Custom dashboard layouts (drag widgets around)
- Ambient mode — a big-screen "mission status" display
- Multi-user (if Josh ever wants to share access)
- Mobile PWA with push notifications

---

## 6. Build Plan

### Steps to Build v1

| # | Step | Est. Complexity |
|---|------|----------------|
| 1 | Scaffold project (Vite + React + TS + Tailwind + shadcn) | Low |
| 2 | Set up Express server with task CRUD API + file persistence | Medium |
| 3 | Define TypeScript types, Zustand store, API hooks | Low |
| 4 | Build Kanban Board — columns, cards, drag-and-drop with dnd-kit | High |
| 5 | Build Task Detail slide-over panel with editing | Medium |
| 6 | Build Status Bar | Low |
| 7 | Build Command Palette (Cmd+K) | Medium |
| 8 | Build Activity Feed sidebar | Low |
| 9 | Add animations (Framer Motion), confetti, launch sequence | Medium |
| 10 | Keyboard shortcuts | Low |
| 11 | Mobile responsive layout | Medium |
| 12 | KANBAN.md migration script | Low |
| 13 | Task CLI helper script | Low |
| 14 | Polish, test, deploy | Medium |

**Total: ~14 steps.** Claude Code handles all of them — this is a single-session or two-session build.

### How It Gets Built

Claude Code (`claude`) handles the entire implementation. The approach:
1. Scaffold everything in one pass
2. Build server + API first (testable independently)
3. Build UI components bottom-up (Card → Column → Board → Layout)
4. Wire up state management + API integration
5. Add polish layer (animations, sounds, responsive)
6. Test manually in browser

### Testing Strategy

- **API:** Quick curl-based smoke tests against the Express server
- **UI:** Manual browser testing via the browser tool (snapshot + screenshot)
- **Type safety:** TypeScript catches structural bugs at build time
- **No unit test framework for v1** — the app is UI-heavy and changes fast. Manual testing + TypeScript + ESLint is the right tradeoff. Add Vitest in v2 for API/store logic.

### Deployment / Access

The Express server serves both the API and the built frontend (Vite builds to `dist/`, Express serves it statically). Single process, single port.

- **Port:** 3333 (or configurable via env)
- **Access:** Exposed via Docker port mapping (Josh configures `-p 3333:3333` or via OpenClaw's existing proxy)
- **Start command:** `node server/index.js` (compiled) or `tsx server/index.ts` (dev)

---

## Summary

This is a **React + Express app** with a **space-ops dark theme**, **drag-and-drop Kanban board**, and the scaffolding to grow into Josh's full AI command center. v1 is focused and shippable — a beautiful, functional task board that OpenClaw can read and write. Everything after that builds on a solid foundation.

Let's launch. 🚀
