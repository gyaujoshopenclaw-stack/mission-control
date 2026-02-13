import { useEffect, useState, useCallback } from 'react';
import { useTaskStore } from './stores/taskStore';
import { StatusBar } from './components/StatusBar/StatusBar';
import { Board } from './components/Board/Board';
import { ActivityFeed } from './components/ActivityFeed/ActivityFeed';
import { TaskDetail } from './components/TaskDetail/TaskDetail';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { LaunchSequence } from './components/LaunchSequence';

function App() {
  const { fetchTasks, fetchActivity, selectedTaskId } = useTaskStore();
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchActivity();
    // Poll every 5s for external changes
    const interval = setInterval(() => {
      fetchTasks();
      fetchActivity();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks, fetchActivity]);

  // Keyboard shortcuts
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
    <>
      <StatusBar />
      <div className="flex flex-1 overflow-hidden">
        <Board />
        <ActivityFeed />
      </div>
      {selectedTaskId && <TaskDetail />}
      <CommandPalette />
    </>
  );
}

export default App;
