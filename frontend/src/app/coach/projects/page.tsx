"use client";

import { useEffect, useMemo, useState } from "react";

type AssignmentStatus = "pending" | "offered" | "accepted" | "completed" | "declined";

type BoardAssignment = {
  id: number;
  project_title: string;
  project_type?: string | null;
  client_name?: string | null;
  status: AssignmentStatus | string;
  notes?: string | null;
  assigned_at: string;
};

const columns = ["pending", "accepted", "completed", "declined"] as const;
type ColumnKey = (typeof columns)[number];

function normalizeStatus(status: string): ColumnKey {
  const value = status.toLowerCase();
  if (value === "offered" || value === "pending") return "pending";
  if (value === "accepted") return "accepted";
  if (value === "completed") return "completed";
  return "declined";
}

export default function CoachProjectBoardPage() {
  const [items, setItems] = useState<BoardAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch("/api/proxy/coaches/assignments/board", { cache: "no-store" });
        if (!resp.ok) {
          setLoading(false);
          return;
        }
        const data = (await resp.json()) as BoardAssignment[];
        setItems(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const bucket: Record<ColumnKey, BoardAssignment[]> = {
      pending: [],
      accepted: [],
      completed: [],
      declined: [],
    };
    items.forEach((item) => {
      bucket[normalizeStatus(String(item.status))].push(item);
    });
    return bucket;
  }, [items]);

  async function updateStatus(assignmentId: number, status: ColumnKey) {
    setMessage("");
    const resp = await fetch(`/api/proxy/coaches/assignments/${assignmentId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!resp.ok) {
      setMessage("Unable to update assignment status");
      return;
    }
    setItems((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, status } : a)));
    setMessage("Assignment updated");
  }

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <h1 className="font-outfit text-3xl font-bold mb-2">Project Board</h1>
        <p className="text-[14px] mb-6" style={{ color: "var(--ox-muted)" }}>
          Admin dispatches pending assignments. Accept or decline, then track delivery status.
        </p>
        {message && <p className="mb-3 text-sm" style={{ color: "var(--ox-muted)" }}>{message}</p>}
        {loading ? (
          <p>Loading assignments...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {columns.map((column) => (
              <div key={column} className="rounded-xl p-3" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)", boxShadow: "var(--ox-shadow)" }}>
                <h2 className="uppercase text-xs mb-3" style={{ color: "var(--ox-muted)" }}>{column}</h2>
                <div className="space-y-3">
                  {grouped[column].length === 0 && <p className="text-xs" style={{ color: "var(--ox-muted)" }}>No items</p>}
                  {grouped[column].map((assignment) => (
                    <div key={assignment.id} className="rounded-lg p-3" style={{ background: "var(--ox-surface-strong)", border: "1px solid var(--ox-line)" }}>
                      <div className="font-semibold text-sm">{assignment.project_title}</div>
                      <div className="text-xs mb-1" style={{ color: "var(--ox-muted)" }}>
                        {assignment.client_name || assignment.project_type || "General"}
                      </div>
                      <div className="text-xs mb-3" style={{ color: "var(--ox-muted)" }}>{assignment.notes || "No notes"}</div>
                      <div className="flex flex-wrap gap-2">
                        {columns.map((next) => (
                          <button
                            key={next}
                            onClick={() => updateStatus(assignment.id, next)}
                            className="px-2 py-1 rounded text-[10px] uppercase"
                            style={{
                              border: "1px solid rgba(62,128,204,0.35)",
                              background: next === column ? "rgba(37,192,210,0.16)" : "rgba(62,128,204,0.08)",
                            }}
                          >
                            {next}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </main>
  );
}
