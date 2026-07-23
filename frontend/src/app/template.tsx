"use client";

import { usePathname } from "next/navigation";

/**
 * Remounts on route change so the previous page paint does not flash through
 * during client navigations.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="ox-page-enter">
      {children}
    </div>
  );
}
