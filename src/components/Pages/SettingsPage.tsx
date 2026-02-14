import { Settings, Monitor, Palette } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import type { ThemeName } from '../../types/task';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const THEMES: { id: ThemeName; label: string; description: string; preview: string[] }[] = [
  {
    id: 'space-ops',
    label: 'Space Ops',
    description: 'Cool navy & blue tones with electric blue accents',
    preview: ['oklch(0.13 0.015 260)', 'oklch(0.17 0.015 260)', 'oklch(0.62 0.17 255)', 'oklch(0.22 0.015 260)'],
  },
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Warm neutral grays with amber gold accents',
    preview: ['oklch(0.14 0.005 270)', 'oklch(0.18 0.006 270)', 'oklch(0.72 0.16 75)', 'oklch(0.22 0.006 270)'],
  },
];

export function SettingsPage() {
  const {
    showQuickStats,
    setShowQuickStats,
    showActivityFeed,
    setShowActivityFeed,
    showUpgradesPanel,
    setShowUpgradesPanel,
    theme,
    setTheme,
  } = useTaskStore();

  return (
    <div className="flex-1 flex flex-col overflow-auto p-4 md:p-6 gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
          <Settings size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Settings</h2>
          <p className="text-xs text-muted-foreground">Customize your Mission Control experience</p>
        </div>
      </div>

      {/* Dashboard Panels Section */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center gap-2">
            <Monitor size={16} className="text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Dashboard Panels</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            Toggle bottom panels on the dashboard. Disabling all gives the Kanban board full screen height.
          </p>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Quick Stats</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Show completion rate, active tasks, and critical items</p>
            </div>
            <Switch
              checked={showQuickStats}
              onCheckedChange={setShowQuickStats}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Activity Feed</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Show recent task activity and changes</p>
            </div>
            <Switch
              checked={showActivityFeed}
              onCheckedChange={setShowActivityFeed}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Upgrades Panel</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Show Kai's upgrade suggestions and self-improvement tasks</p>
            </div>
            <Switch
              checked={showUpgradesPanel}
              onCheckedChange={setShowUpgradesPanel}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Section */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Color Theme</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            Choose a color scheme for the entire application.
          </p>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  'flex flex-col gap-3 p-4 rounded-lg border transition-all text-left',
                  theme === t.id
                    ? 'border-primary ring-2 ring-primary/25 bg-primary/5'
                    : 'border-border hover:border-primary/30 bg-card',
                )}
              >
                <div className="flex gap-1.5">
                  {t.preview.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
