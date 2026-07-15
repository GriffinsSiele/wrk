"use client";

import { useEffect, useState } from "react";

type Operator = { id: number; name: string };
type Project = { id: number; title: string; status: string; project_type?: string | null; client_name?: string | null };
type Coach = {
  id: number;
  profile?: { first_name?: string; last_name?: string };
  email: string;
  coach_attributes?: { id?: number; specialty?: string; placement_eligible?: boolean };
};

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
    const resp = await fetch(`/api/proxy/projects/${assignForm.project_id}/assign`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ coach_id: Number(assignForm.coach_attribute_id), notes: assignForm.notes }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      setMessage(err.detail || "Failed to dispatch coach — placement gate may block ineligible coaches");
      return;
    }
    setAssignForm({ project_id: "", coach_attribute_id: "", notes: "" });
    setMessage("Coach dispatched (pending acceptance)");
    loadAll();
  }

  const eligibleCoaches = coaches.filter(
    (c) => c.coach_attributes?.id && c.coach_attributes?.placement_eligible !== false
  );

  return (
    <div className="p-6 space-y-5">
      <h1 className="font-outfit text-3xl font-bold">Project Dispatch</h1>
      <p className="text-[14px]" style={{ color: "var(--ox-muted)" }}>
        Create operators and projects, then dispatch only placement-eligible coaches (active cert + signed agreements).
      </p>
      {message && <p className="text-sm" style={{ color: "var(--ox-muted)" }}>{message}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="rounded-xl p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
          <h2 className="font-semibold">Create Operator</h2>
          <input placeholder="Name" value={operatorForm.name} onChange={(e) => setOperatorForm((p) => ({ ...p, name: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input placeholder="Industry" value={operatorForm.industry} onChange={(e) => setOperatorForm((p) => ({ ...p, industry: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input placeholder="Emirate" value={operatorForm.emirate} onChange={(e) => setOperatorForm((p) => ({ ...p, emirate: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input placeholder="Licence status" value={operatorForm.licence_status} onChange={(e) => setOperatorForm((p) => ({ ...p, licence_status: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <button onClick={createOperator} className="ox-cta h-9 rounded-full px-5 text-[13px] font-semibold">Create</button>
        </section>

        <section className="rounded-xl p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
          <h2 className="font-semibold">Create Project</h2>
          <input placeholder="Title" value={projectForm.title} onChange={(e) => setProjectForm((p) => ({ ...p, title: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input placeholder="Description" value={projectForm.description} onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input placeholder="Project type" value={projectForm.project_type} onChange={(e) => setProjectForm((p) => ({ ...p, project_type: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <select value={projectForm.operator_id} onChange={(e) => setProjectForm((p) => ({ ...p, operator_id: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}>
            <option value="">Operator (optional)</option>
            {operators.map((o) => <option key={o.id} value={String(o.id)}>{o.name}</option>)}
          </select>
          <button onClick={createProject} className="ox-cta h-9 rounded-full px-5 text-[13px] font-semibold">Create</button>
        </section>

        <section className="rounded-xl p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
          <h2 className="font-semibold">Dispatch Coach</h2>
          <select value={assignForm.project_id} onChange={(e) => setAssignForm((p) => ({ ...p, project_id: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}>
            <option value="">Project</option>
            {projects.map((p) => <option key={p.id} value={String(p.id)}>{p.title}</option>)}
          </select>
          <select value={assignForm.coach_attribute_id} onChange={(e) => setAssignForm((p) => ({ ...p, coach_attribute_id: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}>
            <option value="">Placement-eligible coach</option>
            {eligibleCoaches.map((coach) => (
              <option key={coach.id} value={String(coach.coach_attributes?.id)}>
                {[coach.profile?.first_name, coach.profile?.last_name].filter(Boolean).join(" ") || coach.email}
              </option>
            ))}
          </select>
          <input placeholder="Dispatch notes" value={assignForm.notes} onChange={(e) => setAssignForm((p) => ({ ...p, notes: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <button onClick={assignCoach} className="ox-cta h-9 rounded-full px-5 text-[13px] font-semibold">Dispatch</button>
          {eligibleCoaches.length === 0 && (
            <p className="text-[12px]" style={{ color: "var(--ox-muted)" }}>
              No placement-eligible coaches. Coaches need an active certificate and signed agreements.
            </p>
          )}
        </section>
      </div>

      <div className="rounded-xl p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
        <h2 className="font-semibold mb-2">Active Projects</h2>
        <ul className="text-sm space-y-1">
          {projects.map((project) => (
            <li key={project.id}>
              {project.title} — {project.client_name || project.project_type || "General"} — {project.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
