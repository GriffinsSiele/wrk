import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--cream)", color: "var(--ink)" }}
    >
      <div className="text-center max-w-md">
        <BrandMark variant="transparent" size={56} />
        <p
          className="font-display mt-8 text-[11px] tracking-[0.28em] uppercase"
          style={{ color: "var(--ochre)" }}
        >
          404
        </p>
        <h1
          className="font-display mt-3 text-3xl sm:text-4xl"
          style={{ fontWeight: 500 }}
        >
          Page not found
        </h1>
        <p
          className="font-body mt-4 text-[15px] leading-relaxed"
          style={{ color: "rgba(12,15,18,0.58)" }}
        >
          That route doesn&apos;t exist — or it moved. Return home or explore the specialisation pathway.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="ox-cta inline-flex items-center h-11 px-7 text-[13px] tracking-[0.14em] uppercase"
          >
            Home
          </Link>
          <Link
            href="/certification"
            className="inline-flex items-center h-11 px-7 text-[13px] tracking-[0.1em] uppercase font-display"
            style={{
              border: "1px solid rgba(150,118,43,0.55)",
              color: "var(--ink)",
              borderRadius: 2,
            }}
          >
            Specialisations
          </Link>
        </div>
      </div>
    </div>
  );
}
