import { LucideIcon } from "lucide-react";
import { C, SERIF, SANS } from "./tokens";

type Props = {
  icon: LucideIcon;
  title: string;
  sub: string;
  showDivider?: boolean;
};

export function TrustBadge({ icon: Icon, title, sub, showDivider }: Props) {
  return (
    <div
      className="relative flex flex-col items-center text-center"
      style={{ padding: "0 6px" }}
    >
      {showDivider && (
        <span
          aria-hidden
          className="absolute left-0 top-[8px]"
          style={{ width: 1, height: 54, background: C.border }}
        />
      )}

      <Icon size={27} strokeWidth={1.45} color={C.tealDark} />

      <div
        style={{
          marginTop: 7,
          fontFamily: SERIF,
          fontSize: 12,
          lineHeight: "14px",
          fontWeight: 600,
          color: C.headline,
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 2,
          fontFamily: SANS,
          fontSize: 9,
          lineHeight: "12px",
          color: C.muted,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

export default TrustBadge;
