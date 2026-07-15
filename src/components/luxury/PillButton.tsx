import { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SERIF } from "./tokens";

type Props = {
  children: ReactNode;
  width?: number;
  height?: number;
  fontSize?: number;
  style?: CSSProperties;
  showArrow?: boolean;
};

/**
 * Presentational teal gradient pill used inside luxury cards.
 * Rendered as a <span> so it can be wrapped by parent <Link>/<button>.
 */
export function PillButton({
  children,
  width = 188,
  height = 54,
  fontSize = 19,
  style,
  showArrow = true,
}: Props) {
  return (
    <span
      className="inline-flex items-center justify-between"
      style={{
        width,
        height,
        paddingLeft: 21,
        paddingRight: 21,
        borderRadius: 14,
        background: "linear-gradient(135deg, #056F73 0%, #07989B 100%)",
        color: "#fff",
        fontFamily: SERIF,
        fontSize,
        lineHeight: `${Math.round(fontSize * 1.16)}px`,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        boxShadow: "0 10px 24px rgba(0,92,96,0.24)",
        ...style,
      }}
    >
      {children}
      {showArrow ? <ArrowRight size={20} strokeWidth={1.75} /> : null}
    </span>
  );
}

export default PillButton;
