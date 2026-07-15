export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-5">
      <h1 className="font-outfit text-3xl font-bold">Admin Settings</h1>
      <p className="text-[14px]" style={{ color: "var(--ox-muted)" }}>
        Phase 1 configuration aligned to the Technical Architecture and Database Schema.
      </p>
      <div className="rounded-xl p-5" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
        <ul className="space-y-2 text-sm">
          <li>Exam delivery mode: <strong>online</strong> (configurable exam engine)</li>
          <li>Certification gate: <strong>written pass + practical PASS</strong></li>
          <li>Role upgrade: <strong>automatic Learner → Coach</strong> after dual-gate success</li>
          <li>Level prerequisites: <strong>L2 requires active L1; L3 requires active L2</strong></li>
          <li>Coach assignment model: <strong>admin dispatch</strong></li>
          <li>Placement gate: <strong>placement_eligible + signed NDA &amp; Code of Conduct</strong></li>
          <li>Commercial entities: <strong>operators</strong> (projects linked by operator_id)</li>
          <li>User deletion: <strong>soft-delete / anonymisation</strong> (preserves exam &amp; certificate history)</li>
          <li>Certificate lifecycle: <strong>ACTIVE / EXPIRED / REVOKED</strong></li>
          <li>Design theme: <strong>strict 4-color Olynixx palette</strong></li>
        </ul>
      </div>
    </div>
  );
}
