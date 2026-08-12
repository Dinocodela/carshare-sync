import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { usePublishAttempts, useRetryPublish } from "@/hooks/social/useSocialAudit";
import {
  DEFAULT_TIMEZONE,
  useSocialAccount,
  useSocialPosts,
  useSocialSettings,
} from "@/hooks/social/useSocial";
import { formatInZone } from "@/lib/socialTime";

export function PublishAttempts() {
  const { data: attempts, isLoading } = usePublishAttempts();
  const { data: posts } = useSocialPosts("all");
  const { data: settings } = useSocialSettings();
  const { data: account } = useSocialAccount();
  const retry = useRetryPublish();

  const timezone = settings?.timezone ?? DEFAULT_TIMEZONE;
  const connected = account?.status === "connected";

  const postById = useMemo(
    () => new Map((posts ?? []).map((p) => [p.id, p])),
    [posts],
  );

  const problem = useMemo(
    () => (attempts ?? []).filter((a) => a.status !== "succeeded"),
    [attempts],
  );

  return (
    <div className="space-y-4">
      {!connected && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Instagram not connected</AlertTitle>
          <AlertDescription>
            Retries will fail until Instagram is reconnected in Settings.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading publish attempts…</p>
      ) : problem.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No failed or in-flight publish attempts.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {problem.map((attempt) => {
            const post = postById.get(attempt.post_id);
            return (
              <Card key={attempt.id}>
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={attempt.status === "failed" ? "destructive" : "secondary"}>
                        {attempt.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        attempt #{attempt.attempt_count}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-medium">
                      {post?.title || post?.caption.slice(0, 70) || attempt.post_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatInZone(attempt.created_at, timezone)}
                      {attempt.error_message ? ` · ${attempt.error_message}` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={retry.isPending || !connected}
                    onClick={() => retry.mutate(attempt.post_id)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Retry
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
