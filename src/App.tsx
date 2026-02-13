import { useEffect, useState, useCallback } from 'react';
import { useTaskStore } from './stores/taskStore';
import { StatusBar } from './components/StatusBar/StatusBar';
import { Board } from './components/Board/Board';
import { ActivityFeed } from './components/ActivityFeed/ActivityFeed';
import { TaskDetail } from './components/TaskDetail/TaskDetail';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { LaunchSequence } from './components/LaunchSequence';
import { connectWebSocket, disconnectWebSocket } from './lib/websocket';

function App() {
  const { fetchTasks, fetchActivity, selectedTaskId, density } = useTaskStore();
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchActivity();
    connectWebSocket();
    return () => disconnectWebSocket();
  }, [fetchTasks, fetchActivity]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'n') {
        e.preventDefault();
        useTaskStore.getState().toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLaunchComplete = useCallback(() => setLaunched(true), []);

  if (!launched) {
    return <LaunchSequence onComplete={handleLaunchComplete} />;
  }

  return (
    <div className={`density-${density} flex flex-col h-full`}>
      <StatusBar />
      <div className="flex flex-1 overflow-hidden">
        <Board />
        <ActivityFeed />
      </div>
      {selectedTaskId && <TaskDetail />}
      <CommandPalette />
    </div>
  );
}

export default App;
