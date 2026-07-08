import { useEffect, useState } from "react";
import { Check, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { categories, type ConsentCategory } from "@/config/consent.config";
import { useConsent } from "@/hooks/useConsent";
import {
  ACCEPT_ALL,
  REJECT_ALL,
  type ConsentChoices,
} from "@/lib/consent/storage";

type EditableCategory = Exclude<ConsentCategory, "essential">;

/**
 * Preferences modal. Radix Dialog provides focus trapping, ESC handling,
 * ARIA wiring, and keyboard navigation out of the box.
 */
export function PreferencesModal() {
  const {
    showPreferences,
    closePreferences,
    choices,
    acceptAll,
    rejectAll,
    savePreferences,
  } = useConsent();

  const [draft, setDraft] = useState<ConsentChoices>(choices);

  // Sync draft to the latest saved choices whenever the modal opens.
  useEffect(() => {
    if (showPreferences) setDraft(choices);
  }, [showPreferences, choices]);

  const toggle = (id: EditableCategory) =>
    setDraft((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Dialog open={showPreferences} onOpenChange={(o) => !o && closePreferences()}>
      <DialogContent className="max-w-lg rounded-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">Privacy Preferences</DialogTitle>
          <DialogDescription>
            Choose which cookies and technologies you allow. You can change these
            anytime in the Privacy Center.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] px-6">
          <div className="flex flex-col gap-3 pb-2">
            {categories.map((cat) => {
              const isRequired = cat.required;
              const enabled = isRequired
                ? true
                : draft[cat.id as EditableCategory];
              return (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-border/60 bg-muted/30 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {cat.label}
                        </h3>
                        {isRequired && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            <Lock className="h-2.5 w-2.5" /> Always on
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {cat.description}
                      </p>
                      {cat.examples && cat.examples.length > 0 && (
                        <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                          e.g. {cat.examples.join(", ")}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={enabled}
                      disabled={isRequired}
                      onCheckedChange={() =>
                        !isRequired && toggle(cat.id as EditableCategory)
                      }
                      aria-label={`Toggle ${cat.label}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2.5 px-6 py-5 border-t border-border/60 bg-background">
          <Button
            variant="ghost"
            onClick={rejectAll}
            className="rounded-full min-h-11 sm:mr-auto"
          >
            Reject All
          </Button>
          <Button
            variant="outline"
            onClick={() => savePreferences(draft)}
            className="rounded-full min-h-11"
          >
            <Check className="h-4 w-4" /> Save Preferences
          </Button>
          <Button
            onClick={acceptAll}
            className="rounded-full min-h-11 bg-gradient-primary border-0"
          >
            Accept All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ACCEPT_ALL, REJECT_ALL };
