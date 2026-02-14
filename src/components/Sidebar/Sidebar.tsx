import { LayoutDashboard, FileText, ScrollText, BarChart3, Settings, HelpCircle, Menu } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import type { AppTab } from '../../types/task';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAV_ITEMS: { id: AppTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'docs', label: 'Docs', icon: FileText },
  { id: 'log', label: 'Log', icon: ScrollText },
];

const FUTURE_NAV = [
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
  { label: 'Support', icon: HelpCircle },
];

const STATUS_TEXT: Record<string, string> = {
  online: 'Ready for tasks',
  thinking: 'Thinking...',
  offline: 'Offline',
};

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { activeTab, setActiveTab, clawStatus } = useTaskStore();

  return (
    <div className="flex flex-col items-center h-full py-6">
      {/* Mascot with glowing ring */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-28 h-28 rounded-full flex items-center justify-center animate-ring-glow">
          <div className="w-24 h-24 rounded-full bg-secondary border-[3px] border-amber-400/50 flex items-center justify-center">
            <span className="text-5xl animate-mascot-float">&#x1F916;</span>
          </div>
        </div>
        <h2 className="text-base font-bold text-foreground mt-3">Open Claw</h2>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              clawStatus === 'online' && 'bg-emerald-400 animate-status-blink',
              clawStatus === 'thinking' && 'bg-amber-400 animate-status-blink',
              clawStatus === 'offline' && 'bg-red-400',
            )}
          />
          <span className="text-xs text-muted-foreground capitalize">{clawStatus}</span>
        </div>
      </div>

      {/* Status message */}
      <div className="text-xs text-muted-foreground text-center px-4 mb-6">
        {STATUS_TEXT[clawStatus]}
      </div>

      {/* Main navigation */}
      <nav className="w-full px-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              onClick={() => {
                setActiveTab(item.id);
                onNavClick?.();
              }}
              className={cn(
                'w-full justify-start gap-3 text-sm',
                isActive && 'text-primary',
              )}
            >
              <Icon size={16} />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Separator className="w-4/5 my-4" />

      {/* Future nav items (dimmed) */}
      <TooltipProvider>
        <nav className="w-full px-3 space-y-1">
          {FUTURE_NAV.map(item => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    disabled
                    className="w-full justify-start gap-3 text-sm opacity-50"
                  >
                    <Icon size={16} />
                    {item.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Coming soon</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </TooltipProvider>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useTaskStore();

  return (
    <>
      {/* Mobile hamburger toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="lg:hidden fixed top-3 left-3 z-50"
      >
        <Menu size={20} />
      </Button>

      {/* Mobile sidebar as Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={(open) => { if (!open) toggleSidebar(); }}>
        <SheetContent side="left" className="w-[200px] bg-sidebar p-0 lg:hidden">
          <SidebarContent onNavClick={toggleSidebar} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[200px] shrink-0 h-full bg-sidebar border-r border-sidebar-border flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
