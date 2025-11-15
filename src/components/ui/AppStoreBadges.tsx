import appStoreBadge from "@/assets/app-store-badge.svg";
import googlePlayBadge from "@/assets/google-play-badge.png";

interface AppStoreBadgesProps {
  heading?: string;
  size?: "default" | "small";
}

export function AppStoreBadges({ heading, size = "default" }: AppStoreBadgesProps) {
  const appStoreUrl = "https://apps.apple.com/us/app/teslys/id6751721668";
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.app.teslys&hl=en_US";
  
  const appStoreBadgeSize = size === "small" ? "h-[40px]" : "h-[50px]";
  const googlePlayBadgeSize = size === "small" ? "h-[48px]" : "h-[60px]";
  
  return (
    <div className="flex flex-col items-center gap-3">
      {heading && (
        <p className="text-sm text-muted-foreground">{heading}</p>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <a
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          <img 
            src={appStoreBadge} 
            alt="Download on the App Store" 
            className={`${appStoreBadgeSize} object-contain`}
          />
        </a>
        <a
          href={playStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          <img 
            src={googlePlayBadge} 
            alt="Get it on Google Play" 
            className={`${googlePlayBadgeSize} object-contain`}
          />
        </a>
      </div>
    </div>
  );
}
