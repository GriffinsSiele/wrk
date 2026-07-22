"use client";
import { useEffect, useState } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedBarChart, AreaTrendChart, DonutChart, MultiSegmentDonut, Sparkline } from "@/components/ui/Charts";
import { Briefcase, CheckCircle, Shield } from "react-feather";
import Link from "next/link";

type SeriesPoint = { label: string; value: number };
type MixSeg = { label: string; value: number; color_key: string };

type ActiveAssignment = {
  id: number;
  project_title: string;
  project_type?: string | null;
  client_name?: string | null;
  status: string;
  notes?: string | null;
};

type CoachDash = {
  first_name: string;
  utilisation: number;
  placement_score: number;
  placement_eligible: boolean;
  nps?: number | null;
  certification_level?: string | null;
  cec_credits: number;
  cec_status?: string | null;
  pending_count: number;
  active_count?: number;
  accepted_count?: number;
  completed_count?: number;
  declined_count?: number;
  active_assignments?: ActiveAssignment[];
  active_assignment?: ActiveAssignment | null;
  throughput: SeriesPoint[];
  delivery_mix: MixSeg[];
  nps_spark: number[];
  placement_spark: number[];
  throughput_values?: number[];
};

const COLOR_MAP: Record<string, string> = {
  accent: "var(--ox-accent)",
  blue: "var(--ox-blue)",
  indigo: "var(--ox-indigo)",
  muted: "rgba(46,60,142,0.55)",
};

export default function CoachDashboard() {
  const [data, setData] = useState<CoachDash | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const resp = await fetch("/api/proxy/coaches/me/dashboard", { cache: "no-store" });
      if (resp.ok) setData(await resp.json());
      setLoaded(true);
    };
    load();
  }, []);

  const firstName = data?.first_name ?? "Coach";
  const utilisation = data?.utilisation ?? 0;
  const placementScore = data?.placement_score ?? 0;
  const nps = data?.nps ?? null;
  const throughput = data?.throughput ?? [];
  const trendValues = data?.throughput_values?.length
    ? data.throughput_values
    : throughput.map((p) => p.value);
  const deliveryMix = (data?.delivery_mix ?? []).filter((s) => s.value > 0);
  const activeAssignments =
    data?.active_assignments?.length
      ? data.active_assignments
      : data?.active_assignment
        ? [data.active_assignment]
        : [];
  const placementSpark = data?.placement_spark ?? [0, 0, 0, 0, 0, 0];

  if (!loaded) {
    return (
      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-8 text-[13px]" style={{ color: "var(--ox-muted)" }}>
        Loading dashboard…
      </main>
    );
  }

  return (
    <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <ScrollReveal className="lg:col-span-12">
          <div
            className="p-5 md:p-6 relative overflow-hidden"
            style={{
              background: "rgba(12,15,18,0.45)",
              border: "1px solid rgba(150,118,43,0.4)",
            }}
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.22em] mb-1.5" style={{ color: "var(--ochre)" }}>
                  <Shield size={14} /> Coach portal
                </div>
                <h1 className="font-display text-2xl md:text-3xl mb-1" style={{ color: "var(--cream)", fontWeight: 500 }}>
                  Welcome back, {firstName}
                </h1>
                <p className="font-body text-[13px] md:text-[14px] max-w-xl" style={{ color: "rgba(242,237,227,0.65)" }}>
                  Stay placement-eligible, respond to assignments, and keep throughput rising.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 shrink-0">
                {[
                  { label: "Utilisation", value: `${utilisation}%` },
                  { label: "Placement", value: data?.placement_eligible ? "Eligible" : "Blocked" },
                  { label: "Score", value: `${placementScore}` },
                ].map((chip) => (
                  <div
                    key={chip.label}
                    className="px-3 py-2 text-center min-w-[72px]"
                    style={{ border: "1px solid rgba(150,118,43,0.45)" }}
                  >
                    <div className="font-display text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--ochre)" }}>{chip.label}</div>
                    <div className="font-display text-lg leading-tight" style={{ color: "var(--cream)", fontWeight: 500 }}>{chip.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal className="lg:col-span-7 h-full">
          <div className="ox-card rounded-2xl h-full flex flex-col" style={{ background: "var(--ox-surface)" }}>
            <div className="px-5 py-4 flex justify-between items-center gap-3" style={{ borderBottom: "1px solid var(--ox-line)" }}>
              <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>Active Assignments</h2>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: "rgba(217,172,74,0.12)", color: "var(--ox-blue)" }}>
                  {data?.active_count ?? activeAssignments.length} active
                </span>
                <span className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: "rgba(217,172,74,0.12)", color: "var(--ox-accent)" }}>
                  {data?.pending_count ?? 0} pending
                </span>
                <span className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: "rgba(42,161,135,0.14)", color: "var(--mint)" }}>
                  {data?.accepted_count ?? 0} accepted
                </span>
                <span className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: "rgba(150,118,43,0.16)", color: "var(--ochre)" }}>
                  {data?.completed_count ?? 0} completed
                </span>
                <span className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: "rgba(180,80,60,0.14)", color: "var(--bronze)" }}>
                  {data?.declined_count ?? 0} declined
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-3">
              {activeAssignments.length > 0 ? (
                <>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
                    {activeAssignments.map((item) => {
                      // Legacy "offered" and current "pending" both need a response.
                      const isPending = item.status === "pending" || item.status === "offered";
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl p-4 ox-kpi-float"
                          style={{
                            border: `1px solid ${isPending ? "rgba(217,172,74,0.4)" : "rgba(150,118,43,0.35)"}`,
                            background: isPending ? "rgba(217,172,74,0.06)" : "rgba(12,15,18,0.2)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span
                                  className="text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full"
                                  style={{
                                    background: isPending ? "rgba(217,172,74,0.16)" : "rgba(150,118,43,0.2)",
                                    color: isPending ? "var(--ox-accent)" : "var(--ox-blue)",
                                  }}
                                >
                                  {item.status}
                                </span>
                                {item.project_type && (
                                  <span className="text-[11px]" style={{ color: "var(--ox-muted)" }}>
                                    {item.project_type}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-[15px] leading-snug" style={{ color: "var(--ox-fg)" }}>
                                {item.project_title}
                              </h3>
                              <p className="text-[13px] mt-1" style={{ color: "var(--ox-muted)" }}>
                                {item.client_name || "Client"}
                                {item.notes ? ` — ${item.notes}` : ""}
                              </p>
                            </div>
                            <Briefcase size={16} className="shrink-0 mt-1" style={{ color: "var(--ox-blue)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link href="/coach/projects" className="ox-cta h-9 rounded-full px-5 text-[13px] font-semibold inline-flex items-center">
                      Review on board
                    </Link>
                    <Link href="/coach/agreements" className="ox-ghost-light h-9 rounded-full px-5 text-[13px] font-medium inline-flex items-center">
                      Check agreements
                    </Link>
                  </div>
                </>
              ) : (
                <div className="rounded-xl p-5 h-full flex flex-col justify-center" style={{ border: "1px solid var(--ox-line)", background: "var(--ox-bg)" }}>
                  <p className="font-medium text-[15px]" style={{ color: "var(--ox-fg)" }}>No active assignments</p>
                  <p className="text-[13px] mt-1 mb-4" style={{ color: "var(--ox-muted)" }}>
                    When admin dispatches a project, it will appear here and on your board.
                  </p>
                  <Link href="/coach/projects" className="ox-cta h-9 rounded-full px-5 text-[13px] font-semibold inline-flex items-center w-fit">
                    Open project board
                  </Link>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={60} className="lg:col-span-5 h-full">
          <div className="grid grid-cols-1 gap-4 h-full">
            <div className="ox-card rounded-2xl p-5 flex flex-col" style={{ background: "var(--ox-surface)" }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>Placement Health</h2>
                <Sparkline values={placementSpark} />
              </div>
              <div className="flex items-center gap-4">
                <DonutChart value={placementScore} label="place" sublabel="eligible" size={108} thickness={11} />
                <div className="flex-1 min-w-0">
                  <div className="rounded-xl p-3 text-[12px]" style={{ background: "rgba(217,172,74,0.08)", border: "1px solid rgba(150,118,43,0.3)" }}>
                    <div className="flex items-center gap-2" style={{ color: "var(--ox-blue)" }}>
                      <CheckCircle size={14} />
                      {data?.placement_eligible ? "Agreements signed · Certificate active" : "Complete agreements + cert for eligibility"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ox-card rounded-2xl p-5 flex flex-col justify-between" style={{ background: "var(--ox-surface)" }}>
              <h2 className="font-semibold text-[15px] mb-3" style={{ color: "var(--ox-fg)" }}>Credentials</h2>
              <div className="rounded-xl p-4" style={{ background: "rgba(46,60,142,0.05)", border: "1px solid rgba(46,60,142,0.12)" }}>
                <div className="ox-label text-[10px] mb-2">
                  <span className="ox-dot" style={{ width: 5, height: 5 }} />
                  {data?.cec_status || "Status"}
                </div>
                <p className="font-bold text-[15px]" style={{ color: "var(--ox-indigo)" }}>
                  {data?.certification_level || "Level pending"} Certified
                </p>
                <p className="text-[12px] mt-1" style={{ color: "var(--ox-muted)" }}>CEC credits on file</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[12px]">
                <span style={{ color: "var(--ox-muted)" }}>CECs</span>
                <span className="font-medium" style={{ color: "var(--ox-fg)" }}>
                  {data?.cec_status || "—"} · {data?.cec_credits ?? 0} credits
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100} className="lg:col-span-4 h-full">
          <div className="ox-card ox-kpi-float rounded-2xl p-5 h-full flex flex-col" style={{ background: "var(--ox-surface)" }}>
            <p className="text-[12px] uppercase tracking-[0.14em] mb-3" style={{ color: "var(--ox-muted)" }}>Utilisation</p>
            <div className="flex-1 grid place-items-center">
              <DonutChart value={utilisation} label="util" sublabel="capacity" size={118} thickness={11} />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={130} className="lg:col-span-4 h-full">
          <div className="ox-card ox-kpi-float rounded-2xl p-5 h-full flex flex-col" style={{ background: "var(--ox-surface)" }}>
            <p className="text-[12px] uppercase tracking-[0.14em] mb-3" style={{ color: "var(--ox-muted)" }}>Delivery mix</p>
            <div className="flex-1 grid place-items-center">
              {deliveryMix.length ? (
                <MultiSegmentDonut
                  size={118}
                  thickness={14}
                  centerValue={String(throughput.reduce((s, x) => s + x.value, 0))}
                  centerLabel="closures"
                  segments={deliveryMix.map((s) => ({
                    value: s.value,
                    color: COLOR_MAP[s.color_key] || "var(--ox-blue)",
                    label: s.label,
                  }))}
                />
              ) : (
                <p className="text-[12px] text-center" style={{ color: "var(--ox-muted)" }}>No assignments yet</p>
              )}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={160} className="lg:col-span-4 h-full">
          <div className="ox-card ox-kpi-float rounded-2xl p-5 h-full flex flex-col justify-between" style={{ background: "var(--ox-surface)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] uppercase tracking-[0.14em]" style={{ color: "var(--ox-muted)" }}>Placement score</p>
              <Sparkline values={placementSpark} color="var(--ox-blue)" />
            </div>
            <p className="font-display text-4xl" style={{ color: "var(--ox-fg)", fontWeight: 500 }}>{placementScore}</p>
            <p className="text-[13px] mt-1" style={{ color: "var(--ox-muted)" }}>
              {nps == null ? "Cert + agreements + availability checklist" : `Client NPS ${nps.toFixed(1)}`}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={180} className="lg:col-span-6 h-full">
          <div className="ox-card rounded-2xl p-5 h-full flex flex-col" style={{ background: "var(--ox-surface)" }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>Delivery Throughput</h2>
              <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--ox-muted)" }}>From assignments</span>
            </div>
            <div className="flex-1">
              <AnimatedBarChart data={throughput} height={150} />
            </div>
            <p className="mt-2 text-[12px]" style={{ color: "var(--ox-muted)" }}>
              Built from your live assignment statuses.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={210} className="lg:col-span-6 h-full">
          <div className="ox-card rounded-2xl p-5 h-full flex flex-col" style={{ background: "var(--ox-surface)" }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>Utilisation Trend</h2>
              <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--ox-muted)" }}>8-week view</span>
            </div>
            <div className="rounded-xl p-3 flex-1" style={{ border: "1px solid var(--ox-line)", background: "rgba(12,15,18,0.22)" }}>
              <AreaTrendChart values={trendValues} gradientId="coachTrend" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Utilisation", value: `${utilisation}%` },
                { label: "Placement", value: `${placementScore}` },
                { label: "Momentum", value: utilisation >= 60 ? "Rising" : "Building" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg py-2" style={{ background: "rgba(217,172,74,0.08)" }}>
                  <p className="text-[11px]" style={{ color: "var(--ox-muted)" }}>{s.label}</p>
                  <p className="font-semibold text-[14px]" style={{ color: "var(--ox-fg)" }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
