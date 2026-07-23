"use client";

import { useEffect, useState } from "react";

type Operator = { id: number; name: string };
type ProjectAssignment = {
  id: number;
  coach_id?: number | null;
  coach_name?: string | null;
  status: string;
  assigned_at?: string | null;
};
type Project = {
  id: number;
  title: string;
  status: string;
  description?: string | null;
  project_type?: string | null;
  client_name?: string | null;
  created_at?: string | null;
  assignment_count?: number;
  assignments?: ProjectAssignment[];
};
type Coach = {
  id: number;
  profile?: { first_name?: string; last_name?: string };
  email: string;
  coach_attributes?: { id?: number; specialty?: string; placement_eligible?: boolean };
};

function statusTone(status: string) {
  const value = status.toLowerCase();
  if (value === "active" || value === "accepted") return { color: "var(--mint)" };
  if (value === "pending" || value === "offered") return { color: "var(--ochre)" };
  if (value === "completed") return { color: "var(--cream)" };
  if (value === "declined" || value === "cancelled") return { color: "var(--bronze)" };
  return { color: "var(--ox-muted)" };
}

export default function AdminProjectDispatchPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [message, setMessage] = useState("");

  const [operatorForm, setOperatorForm] = useState({ name: "", industry: "", emirate: "", licence_status: "active" });
  const [projectForm, setProjectForm] = useState({ title: "", description: "", project_type: "", operator_id: "" });
  const [assignForm, setAssignForm] = useState({ project_id: "", coach_attribute_id: "", notes: "" });

  async function loadAll() {
    const [operatorsResp, projectsResp, coachesResp] = await Promise.all([
      fetch("/api/proxy/projects/operators", { cache: "no-store" }),
      fetch("/api/proxy/projects", { cache: "no-store" }),
      fetch("/api/proxy/coaches?placement_eligible=true", { cache: "no-store" }),
    ]);
    if (operatorsResp.ok) setOperators(await operatorsResp.json());
    if (projectsResp.ok) setProjects(await projectsResp.json());
    if (coachesResp.ok) setCoaches(await coachesResp.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, []);

  async function createOperator() {
    setMessage("");
    const resp = await fetch("/api/proxy/projects/operators", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(operatorForm),
    });
    if (!resp.ok) {
      setMessage("Failed to create operator");
      return;
    }
    setOperatorForm({ name: "", industry: "", emirate: "", licence_status: "active" });
    setMessage("Operator created");
    loadAll();
  }

  async function createProject() {
    setMessage("");
    const resp = await fetch("/api/proxy/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: projectForm.title,
        description: projectForm.description,
        project_type: projectForm.project_type,
        operator_id: projectForm.operator_id ? Number(projectForm.operator_id) : null,
        status: "active",
      }),
    });
    if (!resp.ok) {
      setMessage("Failed to create project");
      return;
    }
    setProjectForm({ title: "", description: "", project_type: "", operator_id: "" });
    setMessage("Project created");
    loadAll();
  }

  async function assignCoach() {
    setMessage("");
    if (!assignForm.project_id || !assignForm.coach_attribute_id) {
      setMessage("Choose a project and placement-eligible coach");
      return;
    }
    // API `coach_id` is CoachAttribute.id, not users.id.
    const resp = await fetch(`/api/proxy/projects/${assignForm.project_id}/assign`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ coach_id: Number(assignForm.coach_attribute_id), notes: assignForm.notes }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      setMessage(err.detail || "Failed to dispatch coach â€” placement gate may block ineligible coaches");
      return;
    }
    setAssignForm({ project_id: "", coach_attribute_id: "", notes: "" });
    setMessage("Coach dispatched (pending acceptance)");
    loadAll();
  }

  const eligibleCoaches = coaches.filter(
    (c) => c.coach_attributes?.id && c.coach_attributes?.placement_eligible !== false
  );

  const activeProjects = projects.filter((p) => (p.status || "").toLowerCase() === "active");
  const otherProjects = projects.filter((p) => (p.status || "").toLowerCase() !== "active");
  const displayProjects = [...activeProjects, ...otherProjects];
  const dispatchedCount = projects.reduce((sum, p) => sum + (p.assignment_count || 0), 0);

  return (
    <div className="p-6 space-y-5">
      <h1 className="font-display text-3xl" style={{ fontWeight: 500, color: "var(--cream)" }}>
        Project dispatch
      </h1>
      <p className="font-body text-[14px]" style={{ color: "var(--ox-muted)" }}>
        Create operators and projects, then dispatch only placement-eligible coaches (active cert + signed agreements).
      </p>
      <div
        className="p-4 font-body text-[13px] grid grid-cols-1 md:grid-cols-3 gap-3"
        style={{ border: "1px solid rgba(150,118,43,0.4)", background: "rgba(12,15,18,0.28)", color: "rgba(242,237,227,0.7)" }}
      >
        <div>
          <span className="font-display text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--ochre)" }}>01 Â· Pool</span>
          <p className="mt-1">Filter eligible coaches in Talent Pool.</p>
        </div>
        <div>
          <span className="font-display text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--ochre)" }}>02 Â· Assign</span>
          <p className="mt-1">Dispatch a coach to an active project below.</p>
        </div>
        <div>
          <span className="font-display text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--ochre)" }}>03 Â· Coach sees it</span>
          <p className="mt-1">Coach Portal â†’ Projects / Dashboard shows the assignment.</p>
        </div>
      </div>
      {message && (
        <p className="text-sm font-body" style={{ color: message.toLowerCase().includes("fail") ? "var(--gold-bright)" : "var(--mint)" }}>
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="rounded-sm p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          <h2 className="font-semibold">Create Operator</h2>
          <input placeholder="Name" value={operatorForm.name} onChange={(e) => setOperatorForm((p) => ({ ...p, name: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input placeholder="Industry" value={operatorForm.industry} onChange={(e) => setOperatorForm((p) => ({ ...p, industry: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input placeholder="Emirate" value={operatorForm.emirate} onChange={(e) => setOperatorForm((p) => ({ ...p, emirate: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input placeholder="Licence status" value={operatorForm.licence_status} onChange={(e) => setOperatorForm((p) => ({ ...p, licence_status: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <button onClick={createOperator} className="ox-ghost-light h-9 px-5 text-[13px] font-medium">Create</button>
        </section>

        <section className="rounded-sm p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          <h2 className="font-semibold">Create Project</h2>
          <input placeholder="Title" value={projectForm.title} onChange={(e) => setProjectForm((p) => ({ ...p, title: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input placeholder="Description" value={projectForm.description} onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input placeholder="Project type" value={projectForm.project_type} onChange={(e) => setProjectForm((p) => ({ ...p, project_type: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <select value={projectForm.operator_id} onChange={(e) => setProjectForm((p) => ({ ...p, operator_id: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}>
            <option value="">Operator (optional)</option>
            {operators.map((o) => <option key={o.id} value={String(o.id)}>{o.name}</option>)}
          </select>
          <button onClick={createProject} className="ox-ghost-light h-9 px-5 text-[13px] font-medium">Create</button>
        </section>

        <section className="rounded-sm p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          <h2 className="font-semibold">Dispatch Coach</h2>
          <select value={assignForm.project_id} onChange={(e) => setAssignForm((p) => ({ ...p, project_id: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}>
            <option value="">Project</option>
            {projects.map((p) => <option key={p.id} value={String(p.id)}>{p.title}</option>)}
          </select>
          <select value={assignForm.coach_attribute_id} onChange={(e) => setAssignForm((p) => ({ ...p, coach_attribute_id: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}>
            <option value="">Placement-eligible coach</option>
            {eligibleCoaches.map((coach) => (
              <option key={coach.id} value={String(coach.coach_attributes?.id)}>
                {[coach.profile?.first_name, coach.profile?.last_name].filter(Boolean).join(" ") || coach.email}
              </option>
            ))}
          </select>
          <input placeholder="Dispatch notes" value={assignForm.notes} onChange={(e) => setAssignForm((p) => ({ ...p, notes: e.target.value }))} className="w-full h-9 rounded-sm px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <button onClick={assignCoach} className="ox-cta h-9 px-5 text-[13px] font-semibold">Dispatch</button>
          {eligibleCoaches.length === 0 && (
            <p className="font-body text-[12px]" style={{ color: "var(--ox-muted)" }}>
              No placement-eligible coaches. Coaches need an active certificate and signed agreements.
            </p>
          )}
        </section>
      </div>

      <section style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
        <div
          className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ borderBottom: "1px solid var(--ox-line)" }}
        >
          <div>
            <h2 className="font-display text-[1.15rem]" style={{ fontWeight: 500, color: "var(--cream)" }}>
              Active projects
            </h2>
            <p className="font-body text-[13px] mt-1" style={{ color: "var(--ox-muted)" }}>
              Live dispatch board â€” operators, status, and assigned coaches.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className="font-display text-[11px] tracking-[0.14em] uppercase px-3 py-1.5"
              style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--ochre)" }}
            >
              {activeProjects.length} active
            </span>
            <span
              className="font-display text-[11px] tracking-[0.14em] uppercase px-3 py-1.5"
              style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--gold)" }}
            >
              {dispatchedCount} assignments
            </span>
          </div>
        </div>

        {displayProjects.length === 0 ? (
          <div className="px-5 py-10 text-center font-body text-[14px]" style={{ color: "var(--ox-muted)" }}>
            No projects yet. Create a project above to begin dispatch.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead style={{ background: "rgba(217,172,74,0.1)" }}>
                <tr>
                  {["Project", "Operator / client", "Type", "Status", "Assignments", "Created"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 font-display text-[11px] tracking-[0.14em] uppercase"
                      style={{ color: "var(--ochre)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayProjects.map((project) => {
                  const tone = statusTone(project.status || "active");
                  const assignments = project.assignments || [];
                  return (
                    <tr key={project.id} style={{ borderTop: "1px solid rgba(150,118,43,0.28)" }}>
                      <td className="px-5 py-4 align-top">
                        <div className="font-display" style={{ color: "var(--cream)", fontWeight: 500 }}>
                          {project.title}
                        </div>
                        {project.description && (
                          <p className="mt-1 text-[12px] max-w-xs leading-relaxed" style={{ color: "var(--ox-muted)" }}>
                            {project.description}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] font-display tracking-[0.12em]" style={{ color: "rgba(242,237,227,0.35)" }}>
                          #{project.id}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-top" style={{ color: "var(--ox-muted)" }}>
                        {project.client_name || "â€”"}
                      </td>
                      <td className="px-5 py-4 align-top" style={{ color: "var(--ox-muted)" }}>
                        {project.project_type || "General"}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className="inline-block font-display text-[10px] tracking-[0.14em] uppercase"
                          style={{ color: tone.color, borderBottom: "1px solid rgba(150,118,43,0.55)" }}
                        >
                          {project.status || "active"}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        {assignments.length === 0 ? (
                          <span style={{ color: "var(--ox-muted)" }}>Unassigned</span>
                        ) : (
                          <div className="space-y-1.5">
                            {assignments.map((a) => {
                              const aTone = statusTone(a.status);
                              return (
                                <div key={a.id} className="flex flex-wrap items-center gap-2">
                                  <span style={{ color: "var(--cream)" }}>{a.coach_name || `Coach #${a.coach_id}`}</span>
                                  <span
                                    className="font-display text-[9px] tracking-[0.12em] uppercase"
                                    style={{ color: aTone.color, borderBottom: "1px solid rgba(150,118,43,0.55)" }}
                                  >
                                    {a.status}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 align-top whitespace-nowrap" style={{ color: "var(--ox-muted)" }}>
                        {project.created_at ? new Date(project.created_at).toLocaleDateString() : "â€”"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
