"use client";

import { useEffect, useState } from "react";

type Course = {
  id: number;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  is_published: boolean;
};

type CourseForm = {
  title: string;
  description: string;
  is_published: boolean;
};

const emptyForm: CourseForm = { title: "", description: "", is_published: true };

const fieldStyle = {
  background: "var(--ox-input-bg)",
  border: "1px solid var(--ox-line)",
  color: "var(--ox-fg-dark)",
  borderRadius: 2,
} as const;

export default function AdminContentManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [courseForm, setCourseForm] = useState<CourseForm>(emptyForm);
  const [moduleForm, setModuleForm] = useState({ course_id: "", title: "", order: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CourseForm>(emptyForm);

  async function loadCourses() {
    const resp = await fetch("/api/proxy/courses/all", { cache: "no-store" });
    if (resp.ok) setCourses(await resp.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCourses();
  }, []);

  async function createCourse() {
    setMessage("");
    if (!courseForm.title.trim()) {
      setMessage("Course title is required");
      return;
    }
    setSaving(true);
    const resp = await fetch("/api/proxy/courses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(courseForm),
    });
    setSaving(false);
    if (!resp.ok) {
      setMessage("Failed to create course");
      return;
    }
    setCourseForm(emptyForm);
    setMessage("Course created");
    loadCourses();
  }

  async function createModule() {
    setMessage("");
    if (!moduleForm.course_id) {
      setMessage("Select a course first");
      return;
    }
    if (!moduleForm.title.trim()) {
      setMessage("Module title is required");
      return;
    }
    const resp = await fetch(`/api/proxy/courses/${moduleForm.course_id}/modules`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: moduleForm.title, order: Number(moduleForm.order) }),
    });
    if (!resp.ok) {
      setMessage("Failed to create module");
      return;
    }
    setModuleForm({ course_id: "", title: "", order: 1 });
    setMessage("Module created");
  }

  function startEdit(course: Course) {
    setEditingId(course.id);
    setEditForm({
      title: course.title,
      description: course.description || "",
      is_published: course.is_published,
    });
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function saveEdit() {
    if (editingId == null) return;
    setMessage("");
    if (!editForm.title.trim()) {
      setMessage("Course title is required");
      return;
    }
    setSaving(true);
    const resp = await fetch(`/api/proxy/courses/${editingId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: editForm.title.trim(),
        description: editForm.description,
        thumbnail: null,
        is_published: editForm.is_published,
      }),
    });
    setSaving(false);
    if (!resp.ok) {
      setMessage("Failed to update course");
      return;
    }
    const updated = (await resp.json()) as Course;
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    setMessage("Course updated");
    cancelEdit();
  }

  async function togglePublish(course: Course) {
    setMessage("");
    const resp = await fetch(`/api/proxy/courses/${course.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: course.title,
        description: course.description || "",
        thumbnail: course.thumbnail ?? null,
        is_published: !course.is_published,
      }),
    });
    if (!resp.ok) {
      setMessage("Failed to update publish state");
      return;
    }
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, is_published: !c.is_published } : c))
    );
    if (editingId === course.id) {
      setEditForm((p) => ({ ...p, is_published: !course.is_published }));
    }
  }

  const publishedCount = courses.filter((c) => c.is_published).length;
  const draftCount = courses.length - publishedCount;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display text-3xl" style={{ fontWeight: 500, color: "var(--cream)" }}>
          Content management
        </h1>
        <p className="font-body text-[14px] mt-2" style={{ color: "var(--ox-muted)" }}>
          Manage curriculum structure, publish courses, and prepare module quiz flow.
        </p>
      </div>

      {message && (
        <p
          className="text-sm font-body"
          style={{ color: message.toLowerCase().includes("fail") || message.includes("required") ? "var(--gold-bright)" : "var(--mint)" }}
        >
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          <h2 className="font-display text-[15px]" style={{ fontWeight: 500, color: "var(--cream)" }}>
            Create course
          </h2>
          <input
            placeholder="Course title"
            value={courseForm.title}
            onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full h-9 px-3 text-sm font-body"
            style={fieldStyle}
          />
          <textarea
            placeholder="Description"
            value={courseForm.description}
            onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
            className="w-full px-3 py-2 text-sm font-body"
            rows={3}
            style={fieldStyle}
          />
          <label className="flex items-center gap-2 text-sm font-body" style={{ color: "var(--ox-muted)" }}>
            <input
              type="checkbox"
              checked={courseForm.is_published}
              onChange={(e) => setCourseForm((p) => ({ ...p, is_published: e.target.checked }))}
            />
            Published
          </label>
          <button onClick={createCourse} disabled={saving} className="ox-cta h-9 px-5 text-[13px] font-semibold">
            Create course
          </button>
        </section>

        <section className="p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          <h2 className="font-display text-[15px]" style={{ fontWeight: 500, color: "var(--cream)" }}>
            Create module
          </h2>
          <select
            value={moduleForm.course_id}
            onChange={(e) => setModuleForm((p) => ({ ...p, course_id: e.target.value }))}
            className="w-full h-9 px-3 text-sm font-body"
            style={fieldStyle}
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={String(course.id)}>
                {course.title}
              </option>
            ))}
          </select>
          <input
            placeholder="Module title"
            value={moduleForm.title}
            onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full h-9 px-3 text-sm font-body"
            style={fieldStyle}
          />
          <input
            type="number"
            min={1}
            value={moduleForm.order}
            onChange={(e) => setModuleForm((p) => ({ ...p, order: Number(e.target.value) }))}
            className="w-full h-9 px-3 text-sm font-body"
            style={fieldStyle}
          />
          <button onClick={createModule} className="ox-ghost-light h-9 px-5 text-[13px] font-medium">
            Create module
          </button>
        </section>
      </div>

      <section style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
        <div
          className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ borderBottom: "1px solid var(--ox-line)" }}
        >
          <div>
            <h2 className="font-display text-[1.15rem]" style={{ fontWeight: 500, color: "var(--cream)" }}>
              Course catalogue
            </h2>
            <p className="font-body text-[13px] mt-1" style={{ color: "var(--ox-muted)" }}>
              Review, publish, and edit specialisation courses.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className="font-display text-[11px] tracking-[0.14em] uppercase px-3 py-1.5"
              style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--mint)" }}
            >
              {publishedCount} published
            </span>
            <span
              className="font-display text-[11px] tracking-[0.14em] uppercase px-3 py-1.5"
              style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--ochre)" }}
            >
              {draftCount} draft
            </span>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="px-5 py-10 text-center font-body text-[14px]" style={{ color: "var(--ox-muted)" }}>
            No courses yet. Create one above to start the catalogue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead style={{ background: "rgba(217,172,74,0.1)" }}>
                <tr>
                  {["Course", "Status", "Actions"].map((h) => (
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
                {courses.map((course) => {
                  const isEditing = editingId === course.id;
                  return (
                    <tr key={course.id} style={{ borderTop: "1px solid rgba(150,118,43,0.28)" }}>
                      <td className="px-5 py-4 align-top" style={{ minWidth: 280 }}>
                        {isEditing ? (
                          <div className="space-y-2 max-w-lg">
                            <input
                              value={editForm.title}
                              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                              className="w-full h-9 px-3 text-sm font-body"
                              style={fieldStyle}
                              placeholder="Course title"
                            />
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                              className="w-full px-3 py-2 text-sm font-body"
                              rows={3}
                              style={fieldStyle}
                              placeholder="Description"
                            />
                            <label className="flex items-center gap-2 text-[13px]" style={{ color: "var(--ox-muted)" }}>
                              <input
                                type="checkbox"
                                checked={editForm.is_published}
                                onChange={(e) => setEditForm((p) => ({ ...p, is_published: e.target.checked }))}
                              />
                              Published
                            </label>
                          </div>
                        ) : (
                          <>
                            <div className="font-display" style={{ color: "var(--cream)", fontWeight: 500 }}>
                              {course.title}
                            </div>
                            <p className="mt-1 font-body text-[13px] leading-relaxed max-w-xl" style={{ color: "var(--ox-muted)" }}>
                              {course.description || "No description"}
                            </p>
                            <p className="mt-1 text-[11px] font-display tracking-[0.12em]" style={{ color: "rgba(242,237,227,0.35)" }}>
                              #{course.id}
                            </p>
                          </>
                        )}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span
                          className="inline-block font-display text-[10px] tracking-[0.14em] uppercase"
                          style={{
                            color: (isEditing ? editForm.is_published : course.is_published) ? "var(--mint)" : "var(--ochre)",
                            borderBottom: "1px solid rgba(150,118,43,0.55)",
                          }}
                        >
                          {(isEditing ? editForm.is_published : course.is_published) ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top">
                        {isEditing ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              className="ox-cta h-8 px-3 text-[12px] font-semibold"
                            >
                              {saving ? "Saving…" : "Save"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="h-8 px-3 text-[12px] font-display"
                              style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--cream)", borderRadius: 2 }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => startEdit(course)}
                              className="h-8 px-3 text-[12px] font-display"
                              style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--gold)", borderRadius: 2 }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => togglePublish(course)}
                              className="h-8 px-3 text-[12px] font-display"
                              style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--cream)", borderRadius: 2 }}
                            >
                              {course.is_published ? "Unpublish" : "Publish"}
                            </button>
                          </div>
                        )}
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
