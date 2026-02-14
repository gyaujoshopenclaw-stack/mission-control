import { FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function DocsPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="max-w-md">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <FileText size={28} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Documentation</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Project docs, API reference, and Kai integration guides will live here.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ExternalLink size={12} />
            Coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
