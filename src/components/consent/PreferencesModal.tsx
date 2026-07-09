import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { categories, type ConsentCategory } from "@/config/consent.config";
import { useConsent } from "@/hooks/useConsent";
import { type ConsentChoices } from "@/lib/consent/storage";

type EditableCategory = Exclude<ConsentCategory, "essential">;

/**
 * Preferences modal (Ketch-style "purposes" layout). Radix Dialog provides
 * focus trapping, ESC handling, ARIA wiring, and keyboard navigation.
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
  const [expanded, setExpanded] = useState<string | null>(null);

  // Sync draft to the latest saved choices whenever the modal opens.
  useEffect(() => {
    if (showPreferences) {
      setDraft(choices);
      setExpanded(null);
    }
  }, [showPreferences, choices]);

  const toggle = (id: EditableCategory) =>
    setDraft((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Dialog open={showPreferences} onOpenChange={(o) => !o && closePreferences()}>
      <DialogContent className="max-w-xl rounded-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Your Privacy
          </DialogTitle>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Welcome! We're glad you're here and want you to know that we respect
            your privacy and your right to control how we collect, use, and share
            your personal data. Listed below are the purposes for which we process
            your data—please indicate whether you consent to such processing. For
            more information on our privacy practices, including legal bases and
            our use of tracking technologies like cookies, please read our{" "}
            <Link
              to="/privacy-policy"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 px-6 pb-3">
          <h3 className="text-lg font-bold text-foreground">Purposes</h3>
          <div className="flex gap-2.5">
            <Button
              onClick={rejectAll}
              className="rounded-full h-9 px-5"
            >
              Reject All
            </Button>
            <Button
              variant="outline"
              onClick={acceptAll}
              className="rounded-full h-9 px-5"
            >
              Accept All
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[45vh] px-6">
          <div className="flex flex-col divide-y divide-border">
            {categories.map((cat) => {
              const isRequired = cat.required;
              const enabled = isRequired
                ? true
                : draft[cat.id as EditableCategory];
              const isOpen = expanded === cat.id;
              return (
                <div key={cat.id} className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((cur) => (cur === cat.id ? null : cat.id))
                      }
                      className="flex flex-1 items-start gap-2 text-left min-w-0"
                      aria-expanded={isOpen}
                    >
                      <ChevronRight
                        className={cn(
                          "h-5 w-5 shrink-0 mt-0.5 text-muted-foreground transition-transform",
                          isOpen && "rotate-90"
                        )}
                      />
                      <span className="min-w-0">
                        <span className="block text-base font-bold text-foreground">
                          {cat.label}
                        </span>
                        {cat.legalBasis && (
                          <span className="block text-xs text-muted-foreground">
                            Legal Basis: {cat.legalBasis}
                          </span>
                        )}
                      </span>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      {isRequired && (
                        <span className="text-sm font-medium text-foreground">
                          Always Active
                        </span>
                      )}
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

                  {isOpen && (
                    <div className="mt-3 pl-7 pr-2 animate-fade-in">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {cat.description}
                      </p>
                      {cat.examples && cat.examples.length > 0 && (
                        <p className="mt-1.5 text-xs text-muted-foreground/70">
                          e.g. {cat.examples.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-end px-6 py-5 border-t border-border/60 bg-background">
          <Button
            onClick={() => savePreferences(draft)}
            className="rounded-full min-h-11 px-6 bg-gradient-primary border-0"
          >
            Save Choices
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
