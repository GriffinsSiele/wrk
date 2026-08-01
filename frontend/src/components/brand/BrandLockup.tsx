import { BrandMark, type BrandMarkVariant } from "./BrandMark";

type Props = {
  variant?: BrandMarkVariant;
  markSize?: number;
  /** "stacked" = mark above wordmark (primary lockup, pages 03). "inline" = nav. */
  layout?: "stacked" | "inline";
  tone?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
};

/**
 * Primary lockup per brand book pages 03 & 05:
 * mark + OLYNIXX (wide-tracked capitals) / PRAXIS (small caps between bronze rules).
 * No official wordmark SVG in the pack, typed in Playfair Display only.
 */
export function BrandLockup({
  variant = "transparent",
  markSize = 48,
  layout = "inline",
  tone = "dark",
  showTagline = false,
  className = "",
}: Props) {
  const nameColor = tone === "light" ? "var(--cream)" : "var(--ink)";
  const praxisColor = "var(--ochre)";
  const ruleColor = "var(--bronze)";

  if (layout === "stacked") {
    return (<div className={`flex flex-col items-center text-center ${className}`}>
        <BrandMark variant={variant} size={markSize} priority />
        <div className="mt-5" style={{ color: nameColor }}>
          <div
            className="font-display uppercase"
            style={{
              fontSize: "clamp(1.15rem, 2.4vw, 1.55rem)",
              fontWeight: 500,
              letterSpacing: "0.32em",
              paddingLeft: "0.32em",
            }}
          >
            OLYNIXX
          </div>
          <div
            className="mx-auto my-2.5 flex items-center justify-center gap-3"
            aria-hidden
          >
            <span style={{ width: 28, height: 1, background: ruleColor }} />
            <div
              className="font-display uppercase"
              style={{
                fontSize: "0.68rem",
                color: praxisColor,
                fontWeight: 500,
                letterSpacing: "0.45em",
                paddingLeft: "0.45em",
              }}
            >
              PRAXIS
            </div>
            <span style={{ width: 28, height: 1, background: ruleColor }} />
          </div>
        </div>
        {showTagline && (<p
            className="font-body italic mt-4 text-[15px] max-w-xs"
            style={{ color: tone === "light" ? "rgba(242,237,227,0.72)" : "var(--bronze)" }}
          >
            Where trusted specialists are made.
          </p>)}
      </div>);
  }

  return (<div className={`flex items-center gap-3 ${className}`}>
      <BrandMark variant={variant} size={markSize} priority />
      <div className="leading-none" style={{ color: nameColor }}>
        <div
          className="font-display uppercase"
          style={{
            fontSize: "0.92rem",
            fontWeight: 500,
            letterSpacing: "0.26em",
            paddingLeft: "0.26em",
          }}
        >
          OLYNIXX
        </div>
        <div
          className="mt-1.5 font-display uppercase"
          style={{
            fontSize: "0.58rem",
            color: praxisColor,
            fontWeight: 500,
            letterSpacing: "0.4em",
            paddingLeft: "0.4em",
          }}
        >
          PRAXIS
        </div>
      </div>
    </div>);
}
