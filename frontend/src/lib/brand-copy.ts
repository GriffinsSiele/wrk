/**
 * Canonical brand / product copy aligned to About v3.0 FINAL.
 * Prefer importing from here over inventing alternate slogans.
 */

export const PILLARS = [
  "Human Readiness",
  "Recovery",
  "Performance Intelligence",
] as const;

export type PillarName = (typeof PILLARS)[number];

/** Coach specialty options for portals (pillars first). */
export const SPECIALTY_OPTIONS = [
  ...PILLARS,
  "HRV Coaching",
  "Workplace Wellbeing",
] as const;

export const SITE_POSITIONING = "Where trusted specialists are made.";
export const SITE_SPECIALISE = "We don't replace your certification. We specialise it.";

export const WHO_WE_ARE =
  "Olynixx Praxis is a specialisation and certification body for non-medical human performance coaches, operating in the United Arab Emirates.";

export const DEPLOY_WHERE =
  "corporate programmes, health projects, sport, and partner facilities across the UAE";

export const TRUSTED_POOL = "trusted pool";

export const PILLARS_INLINE = `${PILLARS[0]}, ${PILLARS[1]}, and ${PILLARS[2]}`;
