import { Eye, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HostProfilePreview } from "./HostProfilePreview";

interface HostProfile {
  first_name: string | null;
  last_name: string | null;
  company_name?: string | null;
  phone: string;
  location?: string | null;
  rating?: number | null;
  turo_reviews_count?: number | null;
  turo_profile_url?: string | null;
}

interface HostProfilePreviewDialogProps {
  host: HostProfile;
}

export function HostProfilePreviewDialog({ host }: HostProfilePreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Eye className="h-4 w-4 mr-2" />
          Preview My Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How Clients See Your Profile</DialogTitle>
          <DialogDescription>
            This is how your profile appears to clients when they view their hosted car details.
          </DialogDescription>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4" />
              Host Contact
            </CardTitle>
            <CardDescription className="text-sm">
              Get in touch with your host for any questions or concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HostProfilePreview host={host} showCallButton={true} />
          </CardContent>
        </Card>
        
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <p className="font-medium mb-1">💡 Profile Tip:</p>
          <p>Make sure all your information is complete and professional to build trust with clients.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}