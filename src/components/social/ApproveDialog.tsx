import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { COMPLIANCE_CHECKLIST, useApprovePosts } from "@/hooks/social/useSocial";

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postIds: string[];
  /** Label shown in the description, e.g. "3 posts awaiting review". */
  subject: string;
}

export function ApproveDialog({ open, onOpenChange, postIds, subject }: ApproveDialogProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [moveToScheduled, setMoveToScheduled] = useState(false);
  const approve = useApprovePosts();

  const allChecked = COMPLIANCE_CHECKLIST.every((item) => checked[item.key]);

  const reset = () => {
    setChecked({});
    setNotes("");
    setMoveToScheduled(false);
  };

  const handleApprove = async () => {
    await approve.mutateAsync({
      post_ids: postIds,
      checklist: Object.fromEntries(COMPLIANCE_CHECKLIST.map((i) => [i.key, !!checked[i.key]])),
      notes: notes.trim() || undefined,
      move_to_scheduled: moveToScheduled,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compliance approval</DialogTitle>
          <DialogDescription>
            Approving {subject}. Every item must be confirmed by you — this is recorded as a
            legal audit trail with your name and the time of approval.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[45vh] pr-3">
          <div className="space-y-3">
            {COMPLIANCE_CHECKLIST.map((item) => (
              <div key={item.key} className="flex items-start gap-3">
                <Checkbox
                  id={`chk-${item.key}`}
                  checked={!!checked[item.key]}
                  onCheckedChange={(value) =>
                    setChecked((prev) => ({ ...prev, [item.key]: value === true }))
                  }
                />
                <Label htmlFor={`chk-${item.key}`} className="text-sm font-normal leading-snug">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-2">
          <Label htmlFor="approval-notes">Notes (optional)</Label>
          <Textarea
            id="approval-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything the audit log should capture"
            rows={2}
          />
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="move-scheduled"
            checked={moveToScheduled}
            onCheckedChange={(value) => setMoveToScheduled(value === true)}
          />
          <Label htmlFor="move-scheduled" className="text-sm font-normal leading-snug">
            Also move to Scheduled (only applies to posts that already have a scheduled time)
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={!allChecked || postIds.length === 0 || approve.isPending}
          >
            {approve.isPending ? "Approving…" : `Approve ${postIds.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
