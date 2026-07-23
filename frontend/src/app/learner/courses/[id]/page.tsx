"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number;
  video_id: string;
  content: string;
  completed: boolean;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  modules: Module[];
  progress: number;
  total_lessons: number;
  completed_lessons: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Prefer proxy in other pages; direct call uses browser→API URL (auth via cookie if CORS allows).
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/courses/${courseId}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
          if (data.modules?.length > 0) {
            setExpandedModules(new Set([data.modules[0].id]));
            const firstIncomplete = data.modules
              .flatMap((m: Module) => m.lessons)
              .find((l: Lesson) => !l.completed);
            setActiveLesson(firstIncomplete || data.modules[0].lessons[0]);
          }
        }
      } catch {
        /* API unavailable - show demo state */
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }, []);

  const handleMarkComplete = async () => {
    if (!activeLesson || markingComplete) return;
    setMarkingComplete(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/api/lessons/${activeLesson.id}/complete`, {
        method: "POST",
        credentials: "include",
      });
      setActiveLesson((prev) => (prev ? { ...prev, completed: true } : null));
      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          completed_lessons: prev.completed_lessons + 1,
          progress: Math.round(((prev.completed_lessons + 1) / prev.total_lessons) * 100),
          modules: prev.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === activeLesson.id ? { ...l, completed: true } : l
            ),
          })),
        };
      });
    } catch {
      /* handle error */
    } finally {
      setMarkingComplete(false);
    }
  };

  const progressPercent = course ? course.progress : 0;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--ox-bg)" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--ox-accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1" style={{ background: "var(--ox-bg)" }}>
      <main className="flex-1 flex max-w-[1400px] w-full mx-auto">
        {/* Sidebar toggle for mobile */}
        <button
          className="md:hidden fixed bottom-6 left-6 z-40 w-12 h-12 rounded-sm flex items-center justify-center"
          style={{
            background: "var(--gold)",
          }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="var(--ox-bg)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Module sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative z-30 md:z-auto w-[85vw] max-w-80 md:w-72 lg:w-80 h-[calc(100vh-64px)] overflow-y-auto transition-transform duration-300`}
          style={{
            background: "rgba(12,15,18,0.28)",
            borderRight: "1px solid rgba(150,118,43,0.35)",
          }}
        >
          <div className="p-5">
            <h2 className="font-display text-[15px] mb-1" style={{ color: "var(--ox-fg)", fontWeight: 500 }}>
              {course?.title || "Course"}
            </h2>
            <div className="flex items-center gap-2 font-body text-[12px] mb-4" style={{ color: "var(--ox-muted)" }}>
              <span>{course?.completed_lessons || 0} / {course?.total_lessons || 0} lessons</span>
              <span className="font-semibold" style={{ color: "var(--ochre)" }}>
                {progressPercent}%
              </span>
            </div>
            <div className="w-full rounded-sm h-1.5 mb-5" style={{ background: "rgba(150,118,43,0.25)" }}>
              <div
                className="h-1.5 rounded-sm transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: "var(--mint)",
                }}
              />
            </div>
          </div>

          <div className="pb-6">
            {course?.modules.map((mod) => (
              <div key={mod.id}>
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between px-5 py-3 text-left transition-colors hover:bg-[rgba(26,26,26,0.02)]"
                >
                  <span className="text-[13px] font-semibold" style={{ color: "var(--ox-fg)" }}>
                    {mod.title}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`transition-transform duration-200 ${
                      expandedModules.has(mod.id) ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M6 9l6 6 6-6" stroke="var(--ox-muted)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>

                {expandedModules.has(mod.id) && (
                  <div className="pb-2">
                    {mod.lessons.map((lesson) => {
                      const isActive = activeLesson?.id === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setActiveLesson(lesson);
                            setSidebarOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all"
                          style={{
                            background: isActive ? "rgba(217,172,74,0.08)" : "transparent",
                            borderLeft: isActive ? "2px solid var(--ox-accent)" : "2px solid transparent",
                          }}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: lesson.completed
                                ? "var(--ox-accent)"
                                : isActive
                                ? "var(--ox-accent)"
                                : "rgba(26,26,26,0.08)",
                            }}
                          >
                            {lesson.completed ? (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12l5 5L19 7" stroke="var(--ox-bg)" strokeWidth="3" strokeLinecap="round" />
                              </svg>
                            ) : isActive ? (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            ) : (
                              <span className="text-[9px] font-bold" style={{ color: "var(--ox-muted)" }}>
                                {lesson.order}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[13px] truncate"
                              style={{
                                color: isActive ? "var(--ox-accent)" : "var(--ox-fg)",
                                fontWeight: isActive ? 600 : 400,
                              }}
                            >
                              {lesson.title}
                            </p>
                            <span className="text-[11px]" style={{ color: "var(--ox-muted)" }}>
                              {lesson.duration_minutes} min
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto">
              <ScrollReveal>
                <div className="mb-6">
                  <span
                    className="font-display text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: "var(--ochre)" }}
                  >
                    {course?.level || "Level 1"}
                  </span>
                  <h1
                    className="font-display text-2xl mt-1"
                    style={{ color: "var(--ox-fg)", fontWeight: 500 }}
                  >
                    {activeLesson.title}
                  </h1>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={80}>
                <div className="mb-8">
                  <VideoPlayer
                    videoId={activeLesson.video_id}
                    title={activeLesson.title}
                    onComplete={handleMarkComplete}
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={140}>
                <div
                  className="ox-card rounded-sm p-6 mb-6"
                  style={{ background: "rgba(46,60,142,0.22)" }}
                >
                  <div
                    className="prose prose-sm max-w-none font-body text-[14px] leading-relaxed"
                    style={{ color: "var(--ox-fg)" }}
                    dangerouslySetInnerHTML={{ __html: activeLesson.content || "<p>Lesson content will appear here.</p>" }}
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleMarkComplete}
                    disabled={activeLesson.completed || markingComplete}
                    className={`h-11 px-7 text-[13px] font-semibold inline-flex items-center gap-2 transition-all ${
                      activeLesson.completed ? "ox-ghost-light" : "ox-cta"
                    }`}
                    style={
                      activeLesson.completed
                        ? {
                            color: "var(--mint)",
                            cursor: "default",
                          }
                        : undefined
                    }
                  >
                    {activeLesson.completed ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Completed
                      </>
                    ) : markingComplete ? (
                      <>
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      "Mark as complete"
                    )}
                  </button>

                  {course?.modules && (() => {
                    const allLessons = course.modules.flatMap((m) => m.lessons);
                    const currentIdx = allLessons.findIndex((l) => l.id === activeLesson.id);
                    const nextLesson = allLessons[currentIdx + 1];
                    if (!nextLesson) return null;
                    return (
                      <button
                        onClick={() => setActiveLesson(nextLesson)}
                        className="ox-ghost-light h-11 px-6 text-[13px] font-medium inline-flex items-center gap-2"
                      >
                        Next lesson
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    );
                  })()}
                </div>
              </ScrollReveal>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-sm mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "rgba(217,172,74,0.08)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6v6l4 2" stroke="var(--ox-accent)" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="10" stroke="var(--ox-accent)" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <p className="font-body text-[14px] font-medium" style={{ color: "var(--ox-fg)" }}>
                  Select a lesson to begin
                </p>
                <p className="font-body text-[12px] mt-1" style={{ color: "var(--ox-muted)" }}>
                  Choose a lesson from the sidebar to start learning
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
