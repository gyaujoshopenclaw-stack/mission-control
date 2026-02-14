#!/bin/bash
# Mission Control Server Runner with Auto-Restart
# This wrapper restarts the server if it crashes or gets OOM killed

cd "$(dirname "$0")"

echo "🚀 Mission Control Server Runner starting..."
echo "📦 Compiling server..."
npm run build:server

if [ $? -ne 0 ]; then
  echo "❌ Server compilation failed!"
  exit 1
fi

echo "✅ Server compiled successfully"
echo "🔄 Starting server with auto-restart..."
echo ""

# Export memory limit
export NODE_OPTIONS="--max-old-space-size=256"

while true; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Mission Control server on port ${MC_PORT:-3333}..."
  node dist-server/index.js
  EXIT_CODE=$?
  
  if [ $EXIT_CODE -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server exited normally (code 0)"
    break
  elif [ $EXIT_CODE -eq 137 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Server was SIGKILL'd (OOM likely), restarting in 3s..."
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Server crashed (exit code $EXIT_CODE), restarting in 3s..."
  fi
  
  sleep 3
done
