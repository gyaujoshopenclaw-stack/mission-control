import { useState, useMemo, useCallback } from 'react';
import { Zap, Search, ArrowUpDown, ChevronDown, Sparkles, Loader2, Layers, Filter } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import type { UpgradeStatus, Upgrade } from '../../types/task';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type SortField = 'rank' | 'created' | 'title' | 'status';
type ViewFilter = 'active' | 'all' | 'archived';

const STATUS_OPTIONS: { id: UpgradeStatus; label: string }[] = [
  { id: 'proposed', label: 'Proposed' },
  { id: 'approved', label: 'Approved' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

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

const CATEGORY_DOT_COLORS: Record<string, string> = {
  tool: 'bg-purple-400',
  feature: 'bg-cyan-400',
  integration: 'bg-indigo-400',
  optimization: 'bg-orange-400',
  automation: 'bg-teal-400',
};

const STATUS_ORDER: Record<string, number> = {
  'in-progress': 0,
  approved: 1,
  proposed: 2,
  completed: 3,
  cancelled: 4,
};

const ACTIVE_STATUSES = new Set(['proposed', 'approved', 'in-progress']);
const ARCHIVED_STATUSES = new Set(['completed', 'cancelled']);

function UpgradeRow({
  upgrade,
  selected,
  onToggleSelect,
  onUpdateStatus,
  showBorder,
}: {
  upgrade: Upgrade;
  selected: boolean;
  onToggleSelect: () => void;
  onUpdateStatus: (status: UpgradeStatus) => void;
  showBorder: boolean;
}) {
  const createdDate = new Date(upgrade.createdAt);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors',
        showBorder && 'border-b border-border',
        selected && 'bg-primary/5',
        'hover:bg-accent/50',
      )}
    >
      <button
        onClick={onToggleSelect}
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
          selected
            ? 'bg-primary border-primary'
            : 'border-border hover:border-primary/50',
        )}
      >
        {selected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary-foreground" />
          </svg>
        )}
      </button>

      <span className="text-[0.65rem] font-mono text-muted-foreground w-5 text-right shrink-0">
        #{upgrade.rank}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground truncate">
            {upgrade.title}
          </span>
          <Badge
            variant="outline"
            className={cn('text-[0.6rem] px-1.5 py-0 h-4 shrink-0', CATEGORY_COLORS[upgrade.category] || CATEGORY_COLORS.feature)}
          >
            {upgrade.category}
          </Badge>
        </div>
        <p className="text-[0.65rem] text-muted-foreground truncate mt-0.5">
          {upgrade.estimatedImpact}
        </p>
      </div>

      <Badge
        variant="outline"
        className={cn('text-[0.6rem] px-1.5 py-0 h-5 shrink-0', STATUS_COLORS[upgrade.status] || STATUS_COLORS.proposed)}
      >
        {upgrade.status}
      </Badge>

      <span className="text-[0.65rem] text-muted-foreground shrink-0 hidden sm:block">
        {createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
            Status <ChevronDown size={12} className="ml-0.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {STATUS_OPTIONS.map(s => (
            <DropdownMenuItem key={s.id} onClick={() => onUpdateStatus(s.id)}>
              {s.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function UpgradesPage() {
  const { upgrades, updateUpgrade, generateUpgrades, kaiStatus } = useTaskStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('rank');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('active');
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isGenerating = kaiStatus === 'thinking';

  const filteredUpgrades = useMemo(() => {
    let filtered = [...upgrades];

    // View filter
    if (viewFilter === 'active') {
      filtered = filtered.filter(u => ACTIVE_STATUSES.has(u.status));
    } else if (viewFilter === 'archived') {
      filtered = filtered.filter(u => ARCHIVED_STATUSES.has(u.status));
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        u => u.title.toLowerCase().includes(q) ||
             u.description.toLowerCase().includes(q) ||
             u.category.toLowerCase().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return a.rank - b.rank;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [upgrades, search, sortBy, viewFilter]);

  const groupedUpgrades = useMemo(() => {
    if (!groupByCategory) return null;
    const groups = new Map<string, Upgrade[]>();
    for (const u of filteredUpgrades) {
      const cat = u.category || 'other';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(u);
    }
    return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }, [filteredUpgrades, groupByCategory]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === filteredUpgrades.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUpgrades.map(u => u.id)));
    }
  }, [filteredUpgrades, selectedIds.size]);

  const bulkUpdateStatus = useCallback(async (status: UpgradeStatus) => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await updateUpgrade(id, { status });
    }
    setSelectedIds(new Set());
  }, [selectedIds, updateUpgrade]);

  const updateOneStatus = useCallback(async (id: string, status: UpgradeStatus) => {
    await updateUpgrade(id, { status });
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [updateUpgrade]);

  const activeCount = upgrades.filter(u => ACTIVE_STATUSES.has(u.status)).length;
  const archivedCount = upgrades.filter(u => ARCHIVED_STATUSES.has(u.status)).length;

  const renderUpgradeList = (items: Upgrade[]) => (
    <>
      {items.map((upgrade, i) => (
        <UpgradeRow
          key={upgrade.id}
          upgrade={upgrade}
          selected={selectedIds.has(upgrade.id)}
          onToggleSelect={() => toggleSelect(upgrade.id)}
          onUpdateStatus={(status) => updateOneStatus(upgrade.id, status)}
          showBorder={i < items.length - 1}
        />
      ))}
    </>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <Zap size={20} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Upgrades</h2>
            <p className="text-xs text-muted-foreground">
              {activeCount} active · {archivedCount} archived · {upgrades.length} total (max 10 active)
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={generateUpgrades}
          disabled={isGenerating || activeCount >= 10}
        >
          {isGenerating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {isGenerating ? 'Kai is thinking...' : 'Generate Upgrades'}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search upgrades..."
            className="pl-8 h-9 text-sm"
          />
        </div>

        <Select value={viewFilter} onValueChange={(v) => setViewFilter(v as ViewFilter)}>
          <SelectTrigger className="w-[130px] h-9">
            <Filter size={13} className="mr-1.5 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
          <SelectTrigger className="w-[150px] h-9">
            <ArrowUpDown size={13} className="mr-1.5 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rank">By Rank</SelectItem>
            <SelectItem value="created">Newest First</SelectItem>
            <SelectItem value="status">By Status</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={groupByCategory ? 'secondary' : 'outline'}
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => setGroupByCategory(v => !v)}
        >
          <Layers size={13} />
          Group
        </Button>

        {selectedIds.size > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-9">
                Update {selectedIds.size} selected
                <ChevronDown size={13} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_OPTIONS.map(s => (
                <DropdownMenuItem key={s.id} onClick={() => bulkUpdateStatus(s.id)}>
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Select all */}
      {filteredUpgrades.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={selectAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {selectedIds.size === filteredUpgrades.length ? 'Deselect all' : 'Select all'}
          </button>
          {selectedIds.size > 0 && (
            <Badge variant="secondary" className="text-[0.6rem]">
              {selectedIds.size} selected
            </Badge>
          )}
        </div>
      )}

      {/* Upgrades List */}
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {filteredUpgrades.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <Zap size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {search
                  ? 'No upgrades match your search'
                  : viewFilter === 'archived'
                    ? 'No archived upgrades'
                    : 'No upgrades yet. Click "Generate Upgrades" to let Kai suggest improvements.'}
              </p>
            </div>
          )}

          {/* Grouped view */}
          {groupedUpgrades && filteredUpgrades.length > 0 && (
            <>
              {[...groupedUpgrades.entries()].map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border sticky top-0 z-10">
                    <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', CATEGORY_DOT_COLORS[category] || 'bg-muted-foreground')} />
                    <span className="text-xs font-semibold text-foreground capitalize">{category}</span>
                    <Badge variant="secondary" className="text-[0.55rem] px-1.5 py-0 h-4">
                      {items.length}
                    </Badge>
                  </div>
                  {renderUpgradeList(items)}
                </div>
              ))}
            </>
          )}

          {/* Flat view */}
          {!groupedUpgrades && filteredUpgrades.length > 0 && renderUpgradeList(filteredUpgrades)}
        </ScrollArea>
      </Card>
    </div>
  );
}
