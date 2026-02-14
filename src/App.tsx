import { useEffect, useState, useCallback } from 'react';
import { useTaskStore } from './stores/taskStore';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TopNavBar } from './components/StatusBar/TopNavBar';
import { Board } from './components/Board/Board';
import { ActivityFeed } from './components/ActivityFeed/ActivityFeed';
import { QuickStats } from './components/Dashboard/QuickStats';
import { TaskDetail } from './components/TaskDetail/TaskDetail';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { LaunchSequence } from './components/LaunchSequence';
import { DocsPage } from './components/Pages/DocsPage';
import { LogPage } from './components/Pages/LogPage';
import { connectWebSocket, disconnectWebSocket } from './lib/websocket';

function App() {
  const { fetchTasks, fetchActivity, density, activeTab } = useTaskStore();
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
    <div className={`density-${density} flex h-full`}>
      {/* Left sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopNavBar />

        {/* Page content */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <Board />
            {/* Bottom panels */}
            <div className="hidden md:flex gap-4 px-6 py-3 shrink-0">
              <ActivityFeed />
              <QuickStats />
            </div>
          </div>
        )}

        {activeTab === 'docs' && <DocsPage />}
        {activeTab === 'log' && <LogPage />}
      </div>

      {/* Overlays */}
      <TaskDetail />
      <CommandPalette />
    </div>
  );
}

export default App;
