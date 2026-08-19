"use client";

import { useCallback, useEffect, useState } from "react";
import { Field } from "@/components/ui/Field";

type Course = {
  id: number;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  is_published: boolean;
};

type Lesson = {
  id: number;
  title: string;
  order: number;
  content?: string | null;
  bunny_video_id?: string | null;
  duration_seconds?: number | null;
};

type Module = {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
};

type CourseDetail = Course & {
  modules: Module[];
};

type CourseForm = {
  title: string;
  description: string;
  is_published: boolean;
};

type LessonForm = {
  title: string;
  order: number;
  content: string;
  bunny_video_id: string;
  duration_minutes: string;
};

const emptyForm: CourseForm = { title: "", description: "", is_published: true };
const emptyLesson: LessonForm = {
  title: "",
  order: 1,
  content: "",
  bunny_video_id: "",
  duration_minutes: "",
};

const fieldStyle = {
  background: "var(--ox-input-bg)",
  border: "1px solid var(--ox-line)",
  color: "var(--ox-fg-dark)",
  borderRadius: 2,
} as const;

function detailError(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "detail" in data) {
    const d = (data as { detail: unknown }).detail;
    if (typeof d === "string") return d;
  }
  return fallback;
}

export default function AdminContentManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [courseForm, setCourseForm] = useState<CourseForm>(emptyForm);
  const [moduleForm, setModuleForm] = useState({ course_id: "", title: "", order: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CourseForm>(emptyForm);

  const [structureCourseId, setStructureCourseId] = useState("");
  const [structure, setStructure] = useState<CourseDetail | null>(null);
  const [structureLoading, setStructureLoading] = useState(false);
  const [moduleId, setModuleId] = useState("");
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLesson);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  async function loadCourses() {
    const resp = await fetch("/api/proxy/courses/all", { cache: "no-store" });
    if (resp.ok) setCourses(await resp.json());
  }

  const loadStructure = useCallback(async (courseId: string) => {
    if (!courseId) {
      setStructure(null);
      setModuleId("");
      return;
    }
    setStructureLoading(true);
    try {
      const resp = await fetch(`/api/proxy/courses/${courseId}`, { cache: "no-store" });
      if (!resp.ok) {
        setStructure(null);
        setMessage("Failed to load course structure");
        return;
      }
      const data = (await resp.json()) as CourseDetail;
      setStructure(data);
      setModuleId((prev) => {
        if (prev && data.modules?.some((m) => String(m.id) === prev)) return prev;
        return data.modules?.[0] ? String(data.modules[0].id) : "";
      });
    } finally {
      setStructureLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCourses();
  }, []);

  useEffect(() => {
    loadStructure(structureCourseId);
  }, [structureCourseId, loadStructure]);

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
    const createdCourseId = moduleForm.course_id;
    setModuleForm({ course_id: "", title: "", order: 1 });
    setMessage("Module created");
    loadCourses();
    if (structureCourseId === createdCourseId) loadStructure(createdCourseId);
    else setStructureCourseId(createdCourseId);
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

  function resetLessonForm(nextOrder = 1) {
    setEditingLessonId(null);
    setLessonForm({ ...emptyLesson, order: nextOrder });
  }

  function startLessonEdit(lesson: Lesson) {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      order: lesson.order,
      content: lesson.content || "",
      bunny_video_id: lesson.bunny_video_id || "",
      duration_minutes: lesson.duration_seconds
        ? String(Math.round(lesson.duration_seconds / 60))
        : "",
    });
    setMessage("");
  }

  async function saveLesson() {
    setMessage("");
    if (!moduleId) {
      setMessage("Select a module first");
      return;
    }
    if (!lessonForm.title.trim()) {
      setMessage("Lesson title is required");
      return;
    }
    const minutes = lessonForm.duration_minutes.trim()
      ? Number(lessonForm.duration_minutes)
      : null;
    const payload = {
      title: lessonForm.title.trim(),
      order: Number(lessonForm.order) || 1,
      content: lessonForm.content.trim() || null,
      bunny_video_id: lessonForm.bunny_video_id.trim() || null,
      duration_seconds:
        minutes != null && !Number.isNaN(minutes) ? Math.max(0, Math.round(minutes * 60)) : null,
    };

    setSaving(true);
    const resp = editingLessonId
      ? await fetch(`/api/proxy/lessons/${editingLessonId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/proxy/modules/${moduleId}/lessons`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
    const data = await resp.json().catch(() => ({}));
    setSaving(false);
    if (!resp.ok) {
      setMessage(detailError(data, editingLessonId ? "Failed to update lesson" : "Failed to create lesson"));
      return;
    }
    setMessage(editingLessonId ? "Lesson updated" : "Lesson created");
    const selected = structure?.modules.find((m) => String(m.id) === moduleId);
    const nextOrder = (selected?.lessons?.length || 0) + (editingLessonId ? 0 : 1) + 1;
    resetLessonForm(editingLessonId ? (selected?.lessons?.length || 0) + 1 : nextOrder);
    if (structureCourseId) loadStructure(structureCourseId);
  }

  async function deleteLesson(lessonId: number) {
    if (!window.confirm("Delete this lesson? This cannot be undone.")) return;
    setMessage("");
    const resp = await fetch(`/api/proxy/lessons/${lessonId}`, { method: "DELETE" });
    if (!resp.ok) {
      setMessage("Failed to delete lesson");
      return;
    }
    setMessage("Lesson deleted");
    if (editingLessonId === lessonId) resetLessonForm();
    if (structureCourseId) loadStructure(structureCourseId);
  }

  const selectedModule = structure?.modules.find((m) => String(m.id) === moduleId);
  const publishedCount = courses.filter((c) => c.is_published).length;
  const draftCount = courses.length - publishedCount;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display text-3xl" style={{ fontWeight: 500, color: "var(--cream)" }}>
          Content management
        </h1>
        <p className="font-body text-[14px] mt-2" style={{ color: "var(--ox-muted)" }}>
          Build courses and modules, then add lessons with text content and Bunny Stream video IDs.
        </p>
      </div>

      {message && (
        <p
          className="text-sm font-body"
          style={{
            color:
              message.toLowerCase().includes("fail") || message.includes("required")
                ? "var(--gold-bright)"
                : "var(--mint)",
          }}
        >
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
          <h2 className="font-display text-[15px]" style={{ fontWeight: 500, color: "var(--cream)" }}>
            Create course
          </h2>
          <Field label="Course title">
            <input
              placeholder="e.g. Human Readiness Level 1"
              value={courseForm.title}
              onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full h-9 px-3 text-sm font-body"
              style={fieldStyle}
            />
          </Field>
          <Field label="Description">
            <textarea
              placeholder="Short course description for the catalogue"
              value={courseForm.description}
              onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm font-body"
              rows={3}
              style={fieldStyle}
            />
          </Field>
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
          <Field label="Course">
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
          </Field>
          <Field label="Module title">
            <input
              placeholder="e.g. Intake and readiness"
              value={moduleForm.title}
              onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full h-9 px-3 text-sm font-body"
              style={fieldStyle}
            />
          </Field>
          <Field label="Order">
            <input
              type="number"
              min={1}
              placeholder="1"
              value={moduleForm.order}
              onChange={(e) => setModuleForm((p) => ({ ...p, order: Number(e.target.value) }))}
              className="w-full h-9 px-3 text-sm font-body"
              style={fieldStyle}
            />
          </Field>
          <button onClick={createModule} className="ox-ghost-light h-9 px-5 text-[13px] font-medium">
            Create module
          </button>
        </section>
      </div>

      <section className="p-4 space-y-4" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
        <div>
          <h2 className="font-display text-[15px]" style={{ fontWeight: 500, color: "var(--cream)" }}>
            Lessons &amp; video
          </h2>
          <p className="font-body text-[13px] mt-1" style={{ color: "var(--ox-muted)" }}>
            Upload videos in Bunny Stream first, then paste each video GUID here. Lesson text supports HTML.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Course">
            <select
              value={structureCourseId}
              onChange={(e) => {
                setStructureCourseId(e.target.value);
                resetLessonForm();
              }}
              className="w-full h-9 px-3 text-sm font-body"
              style={fieldStyle}
            >
              <option value="">Select course to manage lessons</option>
              {courses.map((course) => (
                <option key={course.id} value={String(course.id)}>
                  {course.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Module">
            <select
              value={moduleId}
              onChange={(e) => {
                setModuleId(e.target.value);
                const mod = structure?.modules.find((m) => String(m.id) === e.target.value);
                resetLessonForm((mod?.lessons?.length || 0) + 1);
              }}
              disabled={!structure?.modules?.length}
              className="w-full h-9 px-3 text-sm font-body"
              style={fieldStyle}
            >
              <option value="">Select module</option>
              {(structure?.modules || []).map((mod) => (
                <option key={mod.id} value={String(mod.id)}>
                  {mod.order}. {mod.title} ({mod.lessons?.length || 0} lessons)
                </option>
              ))}
            </select>
          </Field>
        </div>

        {structureLoading && (
          <p className="font-body text-[13px]" style={{ color: "var(--ox-muted)" }}>
            Loading course structure…
          </p>
        )}

        {structureCourseId && !structureLoading && !structure?.modules?.length && (
          <p className="font-body text-[13px]" style={{ color: "var(--ochre)" }}>
            This course has no modules yet. Create a module above first.
          </p>
        )}

        {moduleId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-display text-[13px] tracking-[0.12em] uppercase" style={{ color: "var(--ochre)" }}>
                {editingLessonId ? `Edit lesson #${editingLessonId}` : "Add lesson"}
              </h3>
              <Field label="Lesson title">
                <input
                  placeholder="e.g. Session structure"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full h-9 px-3 text-sm font-body"
                  style={fieldStyle}
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Order">
                  <input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm((p) => ({ ...p, order: Number(e.target.value) }))}
                    className="w-full h-9 px-3 text-sm font-body"
                    style={fieldStyle}
                  />
                </Field>
                <Field label="Duration (minutes)">
                  <input
                    type="number"
                    min={0}
                    placeholder="15"
                    value={lessonForm.duration_minutes}
                    onChange={(e) => setLessonForm((p) => ({ ...p, duration_minutes: e.target.value }))}
                    className="w-full h-9 px-3 text-sm font-body"
                    style={fieldStyle}
                  />
                </Field>
              </div>
              <Field label="Bunny video GUID">
                <input
                  placeholder="Paste the Stream video GUID"
                  value={lessonForm.bunny_video_id}
                  onChange={(e) => setLessonForm((p) => ({ ...p, bunny_video_id: e.target.value }))}
                  className="w-full h-9 px-3 text-sm font-body"
                  style={fieldStyle}
                />
              </Field>
              <Field label="Lesson content">
                <textarea
                  placeholder="Lesson body (HTML allowed)"
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm((p) => ({ ...p, content: e.target.value }))}
                  className="w-full px-3 py-2 text-sm font-body"
                  rows={6}
                  style={fieldStyle}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={saveLesson}
                  disabled={saving}
                  className="ox-cta h-9 px-5 text-[13px] font-semibold"
                >
                  {saving ? "Saving…" : editingLessonId ? "Save lesson" : "Create lesson"}
                </button>
                {editingLessonId && (
                  <button
                    onClick={() => resetLessonForm((selectedModule?.lessons?.length || 0) + 1)}
                    className="ox-ghost-light h-9 px-5 text-[13px] font-medium"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-display text-[13px] tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ochre)" }}>
                Lessons in module
              </h3>
              {!selectedModule?.lessons?.length ? (
                <p className="font-body text-[13px]" style={{ color: "var(--ox-muted)" }}>
                  No lessons yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {[...selectedModule.lessons]
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => (
                      <li
                        key={lesson.id}
                        className="p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                        style={{ border: "1px solid var(--ox-line)" }}
                      >
                        <div className="min-w-0">
                          <div className="font-display text-[14px]" style={{ color: "var(--cream)", fontWeight: 500 }}>
                            {lesson.order}. {lesson.title}
                          </div>
                          <p className="font-body text-[12px] mt-1 truncate" style={{ color: "var(--ox-muted)" }}>
                            {lesson.bunny_video_id
                              ? `Video: ${lesson.bunny_video_id}`
                              : "No video ID"}
                            {lesson.duration_seconds
                              ? ` · ${Math.round(lesson.duration_seconds / 60)} min`
                              : ""}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => startLessonEdit(lesson)}
                            className="h-8 px-3 text-[12px] font-display"
                            style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--gold)", borderRadius: 2 }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteLesson(lesson.id)}
                            className="h-8 px-3 text-[12px] font-display"
                            style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--cream)", borderRadius: 2 }}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

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
                            <Field label="Course title">
                              <input
                                value={editForm.title}
                                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                                className="w-full h-9 px-3 text-sm font-body"
                                style={fieldStyle}
                                placeholder="e.g. Human Readiness Level 1"
                              />
                            </Field>
                            <Field label="Description">
                              <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                                className="w-full px-3 py-2 text-sm font-body"
                                rows={3}
                                style={fieldStyle}
                                placeholder="Short course description"
                              />
                            </Field>
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
                              onClick={() => {
                                setStructureCourseId(String(course.id));
                                setMessage(`Managing lessons for “${course.title}”`);
                              }}
                              className="h-8 px-3 text-[12px] font-display"
                              style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--mint)", borderRadius: 2 }}
                            >
                              Lessons
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
