import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShareCarDialogProps {
  carId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareCarDialog({ carId, open, onOpenChange }: ShareCarDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'viewer'|'editor'>('viewer');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reset = () => {
    setEmail('');
    setPermission('viewer');
  };

  const handleShare = async () => {
    if (!carId) return;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-car-access', {
        body: { carId, email, permission },
      });
      if (error) throw error as any;

      toast({ title: 'Access granted', description: `Shared with ${email} as ${permission}.` });
      reset();
      onOpenChange(false);
    } catch (e: any) {
      const message = e?.message || 'Failed to share access';
      toast({ title: 'Share failed', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share vehicle access</DialogTitle>
          <DialogDescription>Grant another client access to this car's data.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Client email</Label>
            <Input id="email" type="email" placeholder="client@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Permission</Label>
            <Select value={permission} onValueChange={(v) => setPermission(v as 'viewer'|'editor')}>
              <SelectTrigger>
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer (read-only)</SelectItem>
                <SelectItem value="editor">Editor (can modify fixed expenses)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleShare} disabled={loading || !carId}>{loading ? 'Sharing...' : 'Share'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
