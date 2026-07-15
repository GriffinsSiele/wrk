"use client";

import { useEffect, useState } from "react";

type Course = { id: number; title: string; description?: string | null; is_published: boolean };

export default function AdminContentManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState("");
  const [courseForm, setCourseForm] = useState({ title: "", description: "", is_published: true });
  const [moduleForm, setModuleForm] = useState({ course_id: "", title: "", order: 1 });

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
    const resp = await fetch("/api/proxy/courses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(courseForm),
    });
    if (!resp.ok) {
      setMessage("Failed to create course");
      return;
    }
    setCourseForm({ title: "", description: "", is_published: true });
    setMessage("Course created");
    loadCourses();
  }

  async function createModule() {
    setMessage("");
    if (!moduleForm.course_id) {
      setMessage("Select a course first");
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

  async function togglePublish(course: Course) {
    const resp = await fetch(`/api/proxy/courses/${course.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: course.title,
        description: course.description || "",
        thumbnail: null,
        is_published: !course.is_published,
      }),
    });
    if (!resp.ok) {
      setMessage("Failed to update course");
      return;
    }
    setCourses((prev) => prev.map((c) => (c.id === course.id ? { ...c, is_published: !c.is_published } : c)));
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="font-outfit text-3xl font-bold">Content Management</h1>
      <p className="text-[14px]" style={{ color: "var(--ox-muted)" }}>
        Manage curriculum structure, publish courses, and prepare module quiz flow.
      </p>
      {message && <p className="text-sm" style={{ color: "var(--ox-muted)" }}>{message}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
          <h2 className="font-semibold">Create Course</h2>
          <input placeholder="Course title" value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <textarea placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} className="w-full rounded px-3 py-2 text-sm" rows={3} style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={courseForm.is_published} onChange={(e) => setCourseForm((p) => ({ ...p, is_published: e.target.checked }))} />
            Published
          </label>
          <button onClick={createCourse} className="ox-cta h-9 rounded-full px-5 text-[13px] font-semibold">Create Course</button>
        </section>

        <section className="rounded-xl p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
          <h2 className="font-semibold">Create Module</h2>
          <select value={moduleForm.course_id} onChange={(e) => setModuleForm((p) => ({ ...p, course_id: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }}>
            <option value="">Select course</option>
            {courses.map((course) => <option key={course.id} value={String(course.id)}>{course.title}</option>)}
          </select>
          <input placeholder="Module title" value={moduleForm.title} onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <input type="number" min={1} value={moduleForm.order} onChange={(e) => setModuleForm((p) => ({ ...p, order: Number(e.target.value) }))} className="w-full h-9 rounded px-3 text-sm" style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)" }} />
          <button onClick={createModule} className="ox-cta h-9 rounded-full px-5 text-[13px] font-semibold">Create Module</button>
        </section>
      </div>

      <div className="rounded-xl p-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
        <h2 className="font-semibold mb-2">Course Catalog</h2>
        <div className="space-y-2">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center justify-between rounded-lg p-3" style={{ background: "var(--ox-surface-strong)", border: "1px solid var(--ox-line)" }}>
              <div>
                <div className="font-medium">{course.title}</div>
                <div className="text-xs" style={{ color: "var(--ox-muted)" }}>{course.description || "No description"}</div>
              </div>
              <button onClick={() => togglePublish(course)} className="h-8 px-3 rounded text-xs" style={{ border: "1px solid rgba(62,128,204,0.35)" }}>
                {course.is_published ? "Unpublish" : "Publish"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
