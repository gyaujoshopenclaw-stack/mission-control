import { Zap, Sparkles, Loader2 } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  proposed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'in-progress': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  completed: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const CATEGORY_COLORS: Record<string, string> = {
  tool: 'bg-purple-500/15 text-purple-400',
  feature: 'bg-cyan-500/15 text-cyan-400',
  integration: 'bg-indigo-500/15 text-indigo-400',
  optimization: 'bg-orange-500/15 text-orange-400',
  automation: 'bg-teal-500/15 text-teal-400',
};

export function UpgradesPanel() {
  const { upgrades, generateUpgrades, kaiStatus, setActiveTab } = useTaskStore();
  const isGenerating = kaiStatus === 'thinking';

  const activeUpgrades = upgrades
    .filter(u => u.status !== 'completed' && u.status !== 'cancelled')
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);

  return (
    <Card className="flex-1 min-w-0">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
            <Zap size={12} className="text-amber-400" />
            Upgrades
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[0.65rem] text-muted-foreground hover:text-foreground"
              onClick={() => setActiveTab('upgrades')}
            >
              View all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[0.65rem] gap-1"
              onClick={generateUpgrades}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <Sparkles size={10} />
              )}
              {isGenerating ? 'Thinking...' : 'Generate'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <ScrollArea className="h-[180px]">
          <div className="space-y-0.5">
            {activeUpgrades.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Zap size={16} className="text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">
                  No upgrades yet. Generate some to get started.
                </p>
              </div>
            )}
            {activeUpgrades.map(u => (
              <button
                key={u.id}
                onClick={() => setActiveTab('upgrades')}
                className="flex items-center gap-2.5 py-1.5 w-full text-left hover:bg-accent/50 rounded px-1 transition-colors animate-fade-in"
              >
                <span className="text-[0.6rem] font-mono text-muted-foreground w-4 text-right shrink-0">
                  #{u.rank}
                </span>
                <span className="text-xs text-foreground truncate flex-1">{u.title}</span>
                <Badge
                  variant="outline"
                  className={cn('text-[0.55rem] px-1.5 py-0 h-4', CATEGORY_COLORS[u.category] || CATEGORY_COLORS.feature)}
                >
                  {u.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn('text-[0.55rem] px-1.5 py-0 h-4', STATUS_COLORS[u.status] || STATUS_COLORS.proposed)}
                >
                  {u.status}
                </Badge>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
