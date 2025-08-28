import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotificationsCard() {
  const { isSupported, isEnabled, loading, enable, disable, sendTest } =
    usePushNotifications();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle id="notifications-section" className="text-xl">
          Notifications
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isSupported ? (
          <div className="text-sm text-muted-foreground">
            Your browser does not support push notifications.
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="push-toggle" className="font-medium">
                Enable push notifications
              </Label>
              <div className="text-sm text-muted-foreground">
                Allow TESLYS to send you updates.
              </div>
            </div>

            {/* Explicit sizing to avoid “oval” look; primary color when checked */}
            <Switch
              id="push-toggle"
              checked={isEnabled}
              disabled={loading}
              onCheckedChange={(checked) => (checked ? enable() : disable())}
              className="h-6 w-11 data-[state=checked]:bg-primary"
              aria-label="Enable push notifications"
            />
          </div>
        )}

        {/* Full-width CTA */}
        <Button
          variant="outline"
          disabled={!isEnabled || loading}
          onClick={sendTest}
          className="w-full"
        >
          {loading ? "Sending…" : "Send test notification"}
        </Button>
      </CardContent>
    </Card>
  );
}
