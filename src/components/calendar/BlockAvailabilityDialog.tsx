import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Trash2, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { CarBlock } from "@/hooks/useCarBlocks";
import { CalendarCar } from "@/hooks/useBookingsCalendar";
import { formatCarName } from "@/lib/carName";

export interface BlockDialogState {
  car: CalendarCar;
  startDate: Date;
  endDate: Date;
  existing?: CarBlock | null;
}

interface Props {
  state: BlockDialogState | null;
  onClose: () => void;
  onCreate: (input: {
    car_id: string;
    start_at: string;
    end_at: string;
    notes?: string | null;
  }) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
}

const toDateInput = (d: Date) => format(d, "yyyy-MM-dd");
const combine = (dateStr: string, timeStr: string) => {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
};

export function BlockAvailabilityDialog({
  state,
  onClose,
  onCreate,
  onDelete,
}: Props) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("18:00");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const existing = state?.existing || null;

  useEffect(() => {
    if (!state) return;
    if (existing) {
      const s = new Date(existing.start_at);
      const e = new Date(existing.end_at);
      setStartDate(toDateInput(s));
      setStartTime(format(s, "HH:mm"));
      setEndDate(toDateInput(e));
      setEndTime(format(e, "HH:mm"));
      setNotes(existing.notes || "");
    } else {
      setStartDate(toDateInput(state.startDate));
      setStartTime("09:00");
      setEndDate(toDateInput(state.endDate));
      setEndTime("18:00");
      setNotes("");
    }
  }, [state, existing]);

  if (!state) return null;

  const carLabel =
    state.car.nickname?.trim() ||
    (state.car.model
      ? `${state.car.make ?? ""} ${state.car.model}`.trim()
      : formatCarName(state.car));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startAt = combine(startDate, startTime);
    const endAt = combine(endDate, endTime);
    if (endAt <= startAt) {
      toast({
        title: "Invalid range",
        description: "End must be after start.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await onCreate({
        car_id: state.car.id,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        notes: notes.trim() || null,
      });
      toast({
        title: "Dates blocked",
        description: `${carLabel} is now unavailable for the selected range.`,
      });
      onClose();
    } catch (err: any) {
      toast({
        title: "Could not block dates",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    setDeleting(true);
    try {
      await onDelete(existing.id);
      toast({ title: "Block removed" });
      onClose();
    } catch (err: any) {
      toast({
        title: "Could not remove block",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!state} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            {existing ? "Blocked dates" : "Block availability"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground pt-1">{carLabel}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-xs">
                Start date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-xs">
                Start time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-xs">
                End date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-xs">
                End time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs">
              Notes <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g. Maintenance, owner using the car"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 200))}
              rows={2}
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {notes.length}/200
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            {existing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                className="text-destructive hover:text-destructive"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove block
                  </>
                )}
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : existing ? (
                "Update block"
              ) : (
                "Block dates"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
