import { Phone, MapPin } from "lucide-react";

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

interface HostProfilePreviewProps {
  host: HostProfile;
  showCallButton?: boolean;
}

export function HostProfilePreview({ host, showCallButton = false }: HostProfilePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-lg">
            {host.first_name} {host.last_name}
          </h3>
          {host.company_name && (
            <p className="text-sm text-muted-foreground">{host.company_name}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <a 
            href={`tel:${host.phone}`}
            className="text-sm font-medium hover:underline"
          >
            {host.phone}
          </a>
        </div>

        {host.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{host.location}</span>
          </div>
        )}

        {host.rating !== null && host.rating !== undefined && host.rating > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rating:</span>
            <div className="flex items-center">
              <span className="text-sm">{host.rating.toFixed(1)}/5.0</span>
              <span className="text-yellow-500 ml-1">★</span>
              {host.turo_reviews_count && host.turo_reviews_count > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({host.turo_reviews_count} reviews)
                </span>
              )}
            </div>
          </div>
        )}

        {host.turo_profile_url && (
          <div className="pt-2 border-t">
            <a 
              href={host.turo_profile_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline"
            >
              View Profile on Turo →
            </a>
          </div>
        )}
      </div>

      {showCallButton && (
        <div className="pt-4 border-t space-y-2">
          <button 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => window.open(`tel:${host.phone}`)}
          >
            <Phone className="h-4 w-4" />
            Call Host
          </button>
          <p className="text-xs text-muted-foreground text-center">
            For emergencies or urgent matters, please call directly
          </p>
        </div>
      )}
    </div>
  );
}