import { C } from "./tokens";

type Props = { tone?: "light" | "dark" };

export function DiamondDivider({ tone = "light" }: Props) {
  const line = tone === "light" ? C.divider : "rgba(255,255,255,0.35)";
  const diamond = tone === "light" ? C.teal : "#C6A15B";

  return (
    <div className="flex items-center justify-center" aria-hidden>
      <span style={{ height: 1, width: 42, background: line }} />
      <span style={{ width: 12 }} />
      <span
        style={{
          width: 9,
          height: 9,
          background: diamond,
          transform: "rotate(45deg)",
          display: "inline-block",
        }}
      />
      <span style={{ width: 12 }} />
      <span style={{ height: 1, width: 42, background: line }} />
    </div>
  );
}

export default DiamondDivider;
