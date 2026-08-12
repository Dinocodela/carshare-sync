import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusPill } from "./StatusPill";
import {
  DEFAULT_TIMEZONE,
  useSocialPosts,
  useSocialSettings,
  type PostStatus,
} from "@/hooks/social/useSocial";
import { formatInZone, utcISOToZonedParts } from "@/lib/socialTime";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SocialCalendar() {
  const { data: posts } = useSocialPosts("all");
  const { data: settings } = useSocialSettings();
  const timezone = settings?.timezone ?? DEFAULT_TIMEZONE;

  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const byDay = useMemo(() => {
    const map = new Map<string, { id: string; title: string; status: PostStatus; at: string }[]>();
    for (const post of posts ?? []) {
      const iso = post.published_at ?? post.scheduled_at;
      if (!iso) continue;
      const { date } = utcISOToZonedParts(iso, timezone);
      const list = map.get(date) ?? [];
      list.push({
        id: post.id,
        title: post.title || post.caption.slice(0, 30),
        status: post.status as PostStatus,
        at: iso,
      });
      map.set(date, list);
    }
    return map;
  }, [posts, timezone]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(cursor);

  const keyFor = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <Card>
      <CardContent className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{monthLabel}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{timezone}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-border">
          {cells.map((day, index) => {
            const items = day ? (byDay.get(keyFor(day)) ?? []) : [];
            return (
              <div
                key={index}
                className="min-h-[92px] bg-card p-1.5 text-left align-top"
              >
                {day && (
                  <>
                    <div className="mb-1 text-xs text-muted-foreground">{day}</div>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <div key={item.id} className="rounded bg-muted/60 p-1">
                          <StatusPill
                            status={item.status}
                            className="mb-0.5 px-1 py-0 text-[10px]"
                          />
                          <p className="truncate text-[11px] leading-tight">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatInZone(item.at, timezone).split(", ").pop()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
