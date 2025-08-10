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

      if (error) {
        // Try to extract detailed error info returned by the Edge Function
        const status = (error as any)?.context?.responseStatus ?? (error as any)?.status;
        let detailedDescription: string | undefined;
        try {
          const responseText = (error as any)?.context?.responseText;
          if (responseText) {
            const parsed = JSON.parse(responseText);
            detailedDescription = parsed?.error || parsed?.message;
          }
        } catch (_) {
          // ignore JSON parse errors
        }

        const fallback = (error as any)?.message || 'Failed to share access';
        const description = detailedDescription
          || (status === 404 ? 'No user found with that email. Ask them to sign up first.'
              : status === 403 ? 'Only the car owner can share access.'
              : status === 401 ? 'You must be signed in to share access.'
              : fallback);

        console.error('share-car-access error:', error);
        toast({ title: 'Share failed', description, variant: 'destructive' });
        return;
      }

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
