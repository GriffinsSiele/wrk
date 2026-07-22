type Props = {
  className?: string;
  /** DEPLOY contrast colour — cream on midnight, ink on cream, cream on deep teal. */
  deployTone?: "cream" | "ink";
  size?: "sm" | "md" | "lg";
};

/**
 * Fixed brand strapline — never reorder or substitute.
 * Inputs in deep ochre; gold plus-signs; DEPLOY in ground contrast.
 */
export function Strapline({
  className = "",
  deployTone = "ink",
  size = "md",
}: Props) {
  const fontSize = size === "sm" ? "0.7rem" : size === "lg" ? "0.95rem" : "0.8rem";
  const deployColor = deployTone === "cream" ? "var(--cream)" : "var(--ink)";

  return (
    <p
      className={`font-display tracking-[0.28em] uppercase ${className}`}
      style={{ fontSize, fontWeight: 500 }}
      aria-label="Learn plus Certify plus Deploy"
    >
      <span style={{ color: "var(--ochre)" }}>Learn</span>
      <span style={{ color: "var(--gold-bright)", margin: "0 0.45em" }}>+</span>
      <span style={{ color: "var(--ochre)" }}>Certify</span>
      <span style={{ color: "var(--gold-bright)", margin: "0 0.45em" }}>+</span>
      <span style={{ color: deployColor }}>Deploy</span>
    </p>
  );
}
