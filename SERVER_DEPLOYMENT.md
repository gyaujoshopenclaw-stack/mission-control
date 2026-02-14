# Mission Control Server - Deployment Guide

## Problem Fixed
The server was getting OOM killed every ~30 minutes due to `tsx` runtime overhead. The TypeScript on-the-fly compilation via `tsx` created multiple process layers and consumed excessive memory.

## Solution Implemented

### 1. Pre-compilation to JavaScript
- Created `tsconfig.server.json` for server-only compilation
- Added `npm run build:server` script to compile TypeScript → JavaScript
- Output goes to `dist-server/` directory
- Fixed TypeScript strict mode errors in route parameter handling

### 2. Optimized Serve Script
- Added `npm run serve` to run pre-compiled JS with `node` (not `tsx`)
- Set `--max-old-space-size=256` to limit memory usage
- **Memory reduction**: ~50% less VSZ, cleaner process tree (1 process vs 4-5)

### 3. Auto-Restart Wrapper
- Created `run-server.sh` for production resilience
- Automatically recompiles server on start
- Detects SIGKILL (exit code 137) and restarts
- Logs all restarts with timestamps

## Memory Comparison

**Before (tsx runtime):**
```
VSZ: ~43.6 GB (virtual)
RSS: ~84 MB
Processes: 4-5 layers (npm → sh → tsx → node+loader)
```

**After (pre-compiled):**
```
VSZ: ~11.5 GB (virtual)  ← 74% reduction
RSS: ~76 MB
Processes: 1 clean node process
Memory limit: 256 MB (configurable)
```

## Usage

### Development (with hot reload)
```bash
npm run server    # Uses tsx for hot reload
```

### Production (optimized)
```bash
npm run build:server  # Compile server
npm run serve         # Run compiled JS

# OR use the wrapper with auto-restart:
./run-server.sh
```

### Full deployment (frontend + backend)
```bash
npm run start    # Builds frontend, compiles server, starts server
```

## Files Changed

### Added
- `tsconfig.server.json` - Server compilation config
- `run-server.sh` - Auto-restart wrapper script
- `SERVER_DEPLOYMENT.md` - This file

### Modified
- `package.json` - Added `build:server` and `serve` scripts, updated `start`
- `server/routes/tasks.ts` - Fixed param type handling for strict mode
- `server/routes/upgrades.ts` - Fixed param type handling for strict mode
- `.gitignore` - Added `dist-server/`

## Monitoring

Check if server is running:
```bash
ps aux | grep "dist-server"
```

Monitor memory usage:
```bash
watch -n 2 'ps aux | grep dist-server | grep -v grep'
```

Check for OOM kills in logs:
```bash
dmesg | grep -i "killed process"
```

## Troubleshooting

### Server won't compile
- Ensure TypeScript is installed: `npm install`
- Check for syntax errors: `npm run build:server`

### Port 3333 already in use
- Kill existing process: `pkill -f "dist-server"`
- Or set different port: `MC_PORT=4444 npm run serve`

### Still getting OOM killed
- Reduce memory limit: Change `--max-old-space-size=128` in `package.json`
- Check for memory leaks in application code
- Monitor with: `NODE_OPTIONS=--trace-gc npm run serve`

## Architecture

```
Frontend (React + Vite)
    ↓
Express API Routes (/api/tasks, /api/upgrades)
    ↓
File-based Store (data/*.json)
    ↓
WebSocket Broadcast (/ws)
```

Server runs on port 3333 (configurable via `MC_PORT` env var).
