"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedBarChart, AreaTrendChart, DonutChart, MultiSegmentDonut, Sparkline } from "@/components/ui/Charts";
import { Activity, BarChart2, Briefcase, CheckCircle, Shield, Users } from "react-feather";

type SeriesPoint = { label: string; value: number };
type TalentMix = { label: string; value: number; color_key: string };
type DispatchTrack = { track: string; active: number; completion: number; risk: string };
type CoachSnap = {
  name: string;
  emirate?: string | null;
  specialty?: string | null;
  level?: string | null;
  available: boolean;
  placement: boolean;
};

type DashboardData = {
  stats: {
    total_coaches: number;
    total_learners: number;
    total_active_projects: number;
    total_certificates: number;
    total_courses: number;
    total_leads: number;
  };
  cert_rate: number;
  pool_health: number;
  governance_score: number;
  kpi_changes: Record<string, string>;
  throughput: SeriesPoint[];
  talent_mix: TalentMix[];
  dispatch: DispatchTrack[];
  recent_coaches: CoachSnap[];
  spark_coaches: number[];
  spark_learners: number[];
  spark_projects: number[];
  spark_certs: number[];
};

const COLOR_MAP: Record<string, string> = {
  accent: "var(--mint)",
  blue: "var(--ox-blue)",
  indigo: "var(--ox-indigo)",
  muted: "rgba(150,118,43,0.45)",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const resp = await fetch("/api/proxy/admin/dashboard", { cache: "no-store" });
      if (resp.ok) setData(await resp.json());
      setLoaded(true);
    };
    load();
  }, []);

  const stats = data?.stats ?? {
    total_coaches: 0,
    total_learners: 0,
    total_active_projects: 0,
    total_certificates: 0,
    total_courses: 0,
    total_leads: 0,
  };
  const certRate = data?.cert_rate ?? 0;
  const poolHealth = data?.pool_health ?? 0;
  const governance = data?.governance_score ?? 0;
  const throughput = data?.throughput ?? [];
  const trendValues = throughput.map((p) => p.value);
  const talentMix = (data?.talent_mix ?? []).filter((s) => s.value > 0);
  const dispatch = data?.dispatch ?? [];
  const recentCoaches = data?.recent_coaches ?? [];
  const zeroSpark = [0, 0, 0, 0, 0, 0];

  const kpis = [
    { label: "Coach Command", value: String(stats.total_coaches), change: data?.kpi_changes?.coaches ?? "0%", color: "var(--ochre)", icon: Users, spark: data?.spark_coaches ?? zeroSpark },
    { label: "Learner Velocity", value: String(stats.total_learners), change: data?.kpi_changes?.learners ?? "0%", color: "var(--mint)", icon: Activity, spark: data?.spark_learners ?? zeroSpark },
    { label: "Project Dispatch", value: String(stats.total_active_projects), change: data?.kpi_changes?.projects ?? "0%", color: "var(--teal)", icon: Briefcase, spark: data?.spark_projects ?? zeroSpark },
    { label: "Certification Output", value: String(stats.total_certificates), change: data?.kpi_changes?.certificates ?? "0%", color: "var(--mint)", icon: CheckCircle, spark: data?.spark_certs ?? zeroSpark },
  ];

  if (!loaded) {
    return (<div className="px-4 md:px-6 py-8 font-body text-[13px]" style={{ color: "var(--ox-muted)" }}>
        Loading dashboard…
      </div>);
  }

  return (<div className="px-4 md:px-6 py-5">
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
                  <Shield size={14} />
                  Control tower
                </div>
                <h2 className="font-display text-2xl md:text-3xl mb-1" style={{ color: "var(--cream)", fontWeight: 500 }}>
                  Certification, pool &amp; dispatch
                </h2>
                <p className="font-body text-[13px] md:text-[14px] max-w-xl" style={{ color: "rgba(242,237,227,0.65)" }}>
                  Live view across certification conversion, coach placement health, and project dispatch.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 shrink-0">
                <div className="px-4 py-2.5 text-center min-w-[88px]" style={{ border: "1px solid rgba(150,118,43,0.45)" }}>
                  <div className="font-display text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--ochre)" }}>Governance</div>
                  <div className="font-display text-3xl leading-tight" style={{ color: "var(--cream)", fontWeight: 500 }}>{governance}</div>
                </div>
                <div className="px-4 py-2.5 text-center min-w-[88px]" style={{ border: "1px solid rgba(150,118,43,0.45)" }}>
                  <div className="font-display text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--ochre)" }}>Placement</div>
                  <div className="font-display text-3xl leading-tight" style={{ color: "var(--cream)", fontWeight: 500 }}>{poolHealth}%</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {kpis.map((k, i) => (<ScrollReveal key={k.label} delay={i * 50} className="lg:col-span-3 h-full">
            <div className="ox-card ox-kpi-float p-4 rounded-sm h-full flex flex-col" style={{ background: "var(--ox-surface-strong)" }}>
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-sm grid place-items-center" style={{ background: "rgba(217,172,74,0.12)", color: k.color }}>
                  <k.icon size={16} />
                </div>
                <Sparkline values={k.spark} color={k.color} />
              </div>
              <div className="font-display text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "var(--ochre)" }}>{k.label}</div>
              <div className="font-display text-3xl leading-none mb-1" style={{ color: "var(--ox-fg)", fontWeight: 500 }}>{k.value}</div>
              <div className="font-body text-[11px] mt-auto" style={{ color: k.color }}>{k.change} vs last period</div>
            </div>
          </ScrollReveal>))}

        <ScrollReveal delay={80} className="lg:col-span-8 h-full">
          <div className="ox-card rounded-sm p-5 h-full flex flex-col" style={{ background: "var(--ox-surface-strong)" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>Operational Throughput</h3>
                <p className="font-body text-[12px]" style={{ color: "var(--ox-muted)" }}>Weekly dispatch and completion momentum</p>
              </div>
              <BarChart2 size={18} style={{ color: "var(--ox-blue)" }} />
            </div>
            <div className="flex-1">
              <AnimatedBarChart data={throughput} height={140} />
            </div>
            <div className="mt-3 rounded-sm p-3" style={{ background: "rgba(217,172,74,0.08)", border: "1px solid rgba(150,118,43,0.35)" }}>
              <AreaTrendChart values={trendValues} gradientId="adminTrend" width={280} height={72} />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={110} className="lg:col-span-4 h-full">
          <div className="ox-card rounded-sm p-5 h-full flex flex-col" style={{ background: "var(--ox-surface-strong)" }}>
            <h3 className="font-semibold text-[15px] mb-0.5" style={{ color: "var(--ox-fg)" }}>Certification Conversion</h3>
            <p className="font-body text-[12px] mb-3" style={{ color: "var(--ox-muted)" }}>Learner to certified ratio</p>
            <div className="flex justify-center flex-1 items-center">
              <DonutChart value={certRate} label="cert" sublabel="conversion" size={140} thickness={13} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              {[
                { label: "Learners", value: stats.total_learners },
                { label: "Certificates", value: stats.total_certificates },
                { label: "Courses", value: stats.total_courses },
                { label: "Leads", value: stats.total_leads },
              ].map((row) => (<div key={row.label} className="rounded-sm px-2.5 py-2" style={{ background: "rgba(217,172,74,0.08)", border: "1px solid rgba(150,118,43,0.35)" }}>
                  <div className="font-body" style={{ color: "var(--ox-muted)" }}>{row.label}</div>
                  <div className="font-semibold" style={{ color: "var(--ox-fg)" }}>{row.value}</div>
                </div>))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={140} className="lg:col-span-4 h-full">
          <div className="ox-card rounded-sm p-5 h-full flex flex-col" style={{ background: "var(--ox-surface-strong)" }}>
            <h3 className="font-semibold text-[15px] mb-0.5" style={{ color: "var(--ox-fg)" }}>Talent Mix</h3>
            <p className="font-body text-[12px] mb-3" style={{ color: "var(--ox-muted)" }}>Pool composition by readiness</p>
            <div className="flex-1 grid place-items-center">
              {talentMix.length ? (<MultiSegmentDonut
                  size={130}
                  thickness={15}
                  centerValue={`${poolHealth}%`}
                  centerLabel="eligible"
                  segments={talentMix.map((s) => ({
                    value: s.value,
                    color: COLOR_MAP[s.color_key] || "var(--ox-blue)",
                    label: s.label,
                  }))}
                />) : (<p className="font-body text-[12px] text-center" style={{ color: "var(--ox-muted)" }}>No coaches in pool yet</p>)}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={170} className="lg:col-span-8 h-full">
          <div className="ox-card rounded-sm p-5 h-full flex flex-col" style={{ background: "var(--ox-surface-strong)" }}>
            <h3 className="font-semibold text-[15px] mb-0.5" style={{ color: "var(--ox-fg)" }}>Dispatch Matrix</h3>
            <p className="font-body text-[12px] mb-3" style={{ color: "var(--ox-muted)" }}>Cross-track execution quality and throughput health</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {(dispatch.length ? dispatch : [{ track: "No projects yet", active: 0, completion: 0, risk: "Watch" }]).map((row, i) => (<div key={row.track} className="rounded-sm p-3.5 flex flex-col" style={{ background: "rgba(12,15,18,0.25)", border: "1px solid rgba(150,118,43,0.3)" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-medium text-[13px] leading-snug" style={{ color: "var(--ox-fg-dark)" }}>{row.track}</div>
                    <span
                      className="font-display text-[10px] tracking-[0.14em] uppercase shrink-0"
                      style={{
                        color: row.risk === "Low" ? "var(--mint)" : "var(--ochre)",
                        borderBottom: "1px solid rgba(150,118,43,0.55)",
                      }}
                    >
                      {row.risk}
                    </span>
                  </div>
                  <div className="flex justify-between font-body text-[11px] mb-1.5">
                    <span style={{ color: "var(--ox-muted)" }}>{row.active} active</span>
                    <span style={{ color: "var(--ox-fg)" }}>{row.completion}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-sm overflow-hidden mt-auto" style={{ background: "rgba(150,118,43,0.28)" }}>
                    <div
                      className="h-1.5 rounded-sm ox-progress-fill"
                      style={{
                        width: `${row.completion}%`,
                        background: "var(--mint)",
                        animationDelay: `${i * 90}ms`,
                      }}
                    />
                  </div>
                </div>))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200} className="lg:col-span-12">
          <div className="ox-card rounded-sm overflow-hidden" style={{ background: "var(--ox-surface-strong)" }}>
            <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid var(--ox-line)" }}>
              <div>
                <h2 className="font-semibold text-[15px]" style={{ color: "var(--ox-fg)" }}>Coach Pool Snapshot</h2>
                <p className="font-body text-[12px] mt-0.5" style={{ color: "var(--ox-muted)" }}>Live coaches from the talent pool</p>
              </div>
              <Link href="/admin/coaches" className="font-body text-[13px] font-medium" style={{ color: "var(--ochre)" }}>View all →</Link>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--ox-line)" }}>
              {(recentCoaches.length ? recentCoaches : [{ name: "No coaches yet", emirate: "-", specialty: "-", level: "-", available: false, placement: false }]).map((coach) => (<div key={coach.name} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors hover:bg-[rgba(217,172,74,0.06)]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-sm grid place-items-center text-sm font-bold text-white shrink-0"
                      style={{ background: "var(--bronze)" }}
                    >
                      {coach.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[14px] truncate" style={{ color: "var(--ox-fg)" }}>{coach.name}</div>
                      <div className="font-body text-[12px] truncate" style={{ color: "var(--ox-muted)" }}>{coach.specialty || "-"} · {coach.emirate || "-"}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span className="font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)", borderBottom: "1px solid rgba(150,118,43,0.55)" }}>{coach.level || "-"}</span>
                    <span
                      className="font-display text-[11px] tracking-[0.14em] uppercase"
                      style={{
                        color: coach.available ? "var(--mint)" : "var(--ox-muted)",
                        borderBottom: "1px solid rgba(150,118,43,0.55)",
                      }}
                    >
                      {coach.available ? "Available" : "Unavailable"}
                    </span>
                    <span
                      className="font-display text-[11px] tracking-[0.14em] uppercase"
                      style={{
                        color: coach.placement ? "var(--mint)" : "var(--ochre)",
                        borderBottom: "1px solid rgba(150,118,43,0.55)",
                      }}
                    >
                      {coach.placement ? "Placement OK" : "Blocked"}
                    </span>
                  </div>
                </div>))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>);
}
