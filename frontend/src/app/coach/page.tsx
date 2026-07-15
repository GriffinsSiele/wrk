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
  nps: number;
  certification_level?: string | null;
  cec_credits: number;
  cec_status?: string | null;
  pending_count: number;
  active_count?: number;
  active_assignments?: ActiveAssignment[];
  active_assignment?: ActiveAssignment | null;
  throughput: SeriesPoint[];
  delivery_mix: MixSeg[];
  nps_spark: number[];
  placement_spark: number[];
};

const COLOR_MAP: Record<string, string> = {
  accent: "var(--ox-accent)",
  blue: "var(--ox-blue)",
  indigo: "var(--ox-indigo)",
  muted: "rgba(46,60,142,0.55)",
};

const utilisationPath = "M8 60 C32 56, 52 40, 76 42 C100 44, 124 28, 148 24 C172 20, 196 14, 220 12 C240 10, 256 10, 272 8";

export default function CoachDashboard() {
  const [data, setData] = useState<CoachDash | null>(null);

  useEffect(() => {
    const load = async () => {
      const resp = await fetch("/api/proxy/coaches/me/dashboard", { cache: "no-store" });
      if (!resp.ok) return;
      setData(await resp.json());
    };
    load();
  }, []);

  const firstName = data?.first_name ?? "Coach";
  const utilisation = data?.utilisation ?? 0;
  const placementScore = data?.placement_score ?? 0;
  const nps = data?.nps ?? 0;
  const throughput = data?.throughput?.length
    ? data.throughput
    : [
        { label: "Assess", value: 4 },
        { label: "Sessions", value: 3 },
        { label: "Reports", value: 2 },
        { label: "Check-ins", value: 5 },
        { label: "Closures", value: 1 },
      ];
  const deliveryMix = data?.delivery_mix ?? [];
  const activeAssignments =
    data?.active_assignments?.length
      ? data.active_assignments
      : data?.active_assignment
        ? [data.active_assignment]
        : [];
  const npsSpark = data?.nps_spark ?? [4.2, 4.3, 4.4, 4.5, 4.6, 4.7];
  const placementSpark = data?.placement_spark ?? [50, 55, 60, 65, 70, 75];

  return (
    <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <ScrollReveal className="lg:col-span-12">
          <div
            className="ox-hero-shimmer rounded-2xl p-5 md:p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(46,60,142,0.94), rgba(37,192,210,0.55) 140%)",
              boxShadow: "0 24px 56px -34px rgba(46,60,142,0.65)",
            }}
          >
            <div
              className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(62,128,204,0.4), transparent 70%)" }}
            />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "rgba(255,255,255,0.72)" }}>
                  <Shield size={14} /> Coach Performance Deck
                </div>
                <h1 className="font-outfit font-bold text-2xl md:text-3xl text-white mb-1">Welcome back, {firstName}</h1>
                <p className="text-[13px] md:text-[14px] max-w-xl" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Stay placement-eligible, respond to pending assignments, and keep throughput rising.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 shrink-0">
                {[
                  { label: "Utilisation", value: `${utilisation}%` },
                  { label: "Placement", value: data?.placement_eligible ? "Eligible" : "Blocked" },
                  { label: "NPS", value: nps.toFixed(1) },
                ].map((chip) => (
                  <div
                    key={chip.label}
                    className="rounded-xl px-3 py-2 text-center min-w-[72px]"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.7)" }}>{chip.label}</div>
                    <div className="font-outfit font-bold text-white text-lg leading-tight">{chip.value}</div>
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
              <div className="flex items-center gap-2">
                <span className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: "rgba(62,128,204,0.1)", color: "var(--ox-blue)" }}>
                  {data?.active_count ?? activeAssignments.length} active
                </span>
                <span className="text-[12px] px-2.5 py-1 rounded-full" style={{ background: "rgba(37,192,210,0.08)", color: "var(--ox-accent)" }}>
                  {data?.pending_count ?? 0} pending
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-3">
              {activeAssignments.length > 0 ? (
                <>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
                    {activeAssignments.map((item) => {
                      const isPending = item.status === "pending" || item.status === "offered";
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl p-4 ox-kpi-float"
                          style={{
                            border: `1px solid ${isPending ? "rgba(37,192,210,0.28)" : "rgba(62,128,204,0.22)"}`,
                            background: isPending ? "rgba(37,192,210,0.04)" : "rgba(62,128,204,0.04)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span
                                  className="text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full"
                                  style={{
                                    background: isPending ? "rgba(37,192,210,0.14)" : "rgba(62,128,204,0.14)",
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
                  <div className="rounded-xl p-3 text-[12px]" style={{ background: "rgba(62,128,204,0.08)", border: "1px solid rgba(62,128,204,0.18)" }}>
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
              <MultiSegmentDonut
                size={118}
                thickness={14}
                centerValue={String(throughput.reduce((s, x) => s + x.value, 0))}
                centerLabel="actions"
                segments={(deliveryMix.length ? deliveryMix : [{ label: "Idle", value: 1, color_key: "blue" }]).map((s) => ({
                  value: s.value,
                  color: COLOR_MAP[s.color_key] || "var(--ox-blue)",
                  label: s.label,
                }))}
              />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={160} className="lg:col-span-4 h-full">
          <div className="ox-card ox-kpi-float rounded-2xl p-5 h-full flex flex-col justify-between" style={{ background: "var(--ox-surface)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] uppercase tracking-[0.14em]" style={{ color: "var(--ox-muted)" }}>Client NPS</p>
              <Sparkline values={npsSpark} color="var(--ox-blue)" />
            </div>
            <p className="font-outfit font-bold text-4xl" style={{ color: "var(--ox-fg)" }}>{nps.toFixed(1)}</p>
            <p className="text-[13px] mt-1" style={{ color: "var(--ox-muted)" }}>Derived from completed engagements</p>
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
            <div className="rounded-xl p-3 flex-1" style={{ border: "1px solid var(--ox-line)", background: "rgba(62,128,204,0.05)" }}>
              <AreaTrendChart path={utilisationPath} gradientId="coachTrend" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Utilisation", value: `${utilisation}%` },
                { label: "Client NPS", value: `${nps.toFixed(1)}/5` },
                { label: "Momentum", value: utilisation >= 60 ? "Rising" : "Building" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg py-2" style={{ background: "rgba(62,128,204,0.08)" }}>
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
