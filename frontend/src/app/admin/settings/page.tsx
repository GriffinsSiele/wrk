export default function AdminSettingsPage() {
  return (<div className="p-6 space-y-5">
      <h1 className="font-display text-2xl" style={{ fontWeight: 500, color: "var(--cream)" }}>
        Admin Settings
      </h1>
      <p className="font-body text-[14px]" style={{ color: "var(--ox-muted)" }}>
        Phase 1 configuration aligned to the Technical Architecture and Database Schema.
      </p>
      <div className="p-5" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
        <ul className="space-y-2 text-sm font-body" style={{ color: "var(--cream)" }}>
          <li>Exam delivery mode: <strong style={{ color: "var(--gold)" }}>online</strong> (configurable exam engine)</li>
          <li>Certification gate: <strong style={{ color: "var(--gold)" }}>written pass + practical PASS</strong></li>
          <li>Role upgrade: <strong style={{ color: "var(--gold)" }}>automatic Learner → Coach</strong> after dual-gate success</li>
          <li>Level prerequisites: <strong style={{ color: "var(--gold)" }}>L2 requires active L1; L3 requires active L2</strong></li>
          <li>Coach assignment model: <strong style={{ color: "var(--gold)" }}>admin dispatch</strong></li>
          <li>Placement gate: <strong style={{ color: "var(--gold)" }}>placement_eligible + signed NDA &amp; Code of Conduct</strong></li>
          <li>Brand system: <strong style={{ color: "var(--gold)" }}>Olynixx Praxis v1.1</strong>, Deep Teal portal ground, flat colour</li>
        </ul>
      </div>
    </div>);
}
