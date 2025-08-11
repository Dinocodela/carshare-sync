import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotificationsCard() {
  const { isSupported, isEnabled, loading, enable, disable, sendTest } = usePushNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle id="notifications-section">Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported ? (
          <div className="text-sm text-muted-foreground">Your browser does not support push notifications.</div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="push-toggle">Enable push notifications</Label>
              <div className="text-sm text-muted-foreground">Allow TESLYS to send you updates.</div>
            </div>
            <Switch
              id="push-toggle"
              checked={isEnabled}
              disabled={loading}
              onCheckedChange={(checked) => (checked ? enable() : disable())}
            />
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="outline" disabled={!isEnabled || loading} onClick={sendTest}>Send test notification</Button>
        </div>
      </CardContent>
    </Card>
  );
}
