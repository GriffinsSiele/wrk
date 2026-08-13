"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  first_name?: string | null;
  last_name?: string | null;
};

const fieldStyle = {
  background: "var(--ox-input-bg)",
  border: "1px solid var(--ox-line)",
  color: "var(--ox-fg-dark)",
  borderRadius: 2,
} as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "learner",
  });
  const [resetPassword, setResetPassword] = useState<Record<number, string>>({});

  async function load() {
    const resp = await fetch("/api/proxy/admin/users", { cache: "no-store" });
    if (resp.ok) setUsers(await resp.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function createUser() {
    setMessage("");
    const resp = await fetch("/api/proxy/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createForm),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      setMessage(typeof data.detail === "string" ? data.detail : "Failed to create user");
      return;
    }
    setMessage(`Created ${createForm.email}`);
    setCreateForm({ email: "", password: "", first_name: "", last_name: "", role: "learner" });
    load();
  }

  async function setPassword(userId: number) {
    setMessage("");
    const password = resetPassword[userId] || "";
    const resp = await fetch(`/api/proxy/admin/users/${userId}/set-password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      setMessage(typeof data.detail === "string" ? data.detail : "Failed to set password");
      return;
    }
    setMessage("Password updated");
    setResetPassword((p) => ({ ...p, [userId]: "" }));
  }

  async function purgeDemos() {
    if (!window.confirm("Purge known demo accounts (Jane/John/demo emails)? This soft-deletes them.")) return;
    setMessage("");
    const resp = await fetch("/api/proxy/admin/users/purge-demo", { method: "POST" });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      setMessage("Failed to purge demo accounts");
      return;
    }
    setMessage(`Purged: ${(data.purged || []).join(", ") || "none"}`);
    load();
  }

  async function updateRole(userId: number, role: string) {
    setMessage("");
    const resp = await fetch(`/api/proxy/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!resp.ok) {
      setMessage("Failed to update role");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    setMessage("Role updated");
  }

  async function deactivate(userId: number) {
    setMessage("");
    const resp = await fetch(`/api/proxy/admin/users/${userId}/deactivate`, { method: "PATCH" });
    if (!resp.ok) {
      setMessage("Failed to deactivate user");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u)));
    setMessage("User deactivated");
  }

  async function activate(userId: number) {
    setMessage("");
    const resp = await fetch(`/api/proxy/admin/users/${userId}/activate`, { method: "PATCH" });
    if (!resp.ok) {
      setMessage("Failed to activate user");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: true } : u)));
    setMessage("User activated");
  }

  async function softDelete(userId: number) {
    setMessage("");
    if (!window.confirm("Soft-delete and anonymise this user? Exam and certificate history will be retained.")) {
      return;
    }
    const resp = await fetch(`/api/proxy/admin/users/${userId}/soft-delete`, { method: "POST" });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      setMessage(err.detail || "Failed to soft-delete user");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setMessage("User soft-deleted and anonymised");
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="font-display text-3xl" style={{ fontWeight: 500 }}>User Management</h1>
      <p className="font-body text-[14px]" style={{ color: "var(--ox-muted)" }}>
        Admin provisioning, password reset, role/status control. Soft-delete anonymises identity while preserving audit history.
      </p>
      {message && <p className="font-body text-sm" style={{ color: message.toLowerCase().includes("fail") ? "var(--gold-bright)" : "var(--mint)" }}>{message}</p>}

      <section className="p-4 space-y-2" style={{ background: "var(--ox-surface)", border: "1px solid var(--ox-line)" }}>
        <h2 className="font-display text-[15px]" style={{ color: "var(--cream)", fontWeight: 500 }}>Create user</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input placeholder="First name" value={createForm.first_name} onChange={(e) => setCreateForm((p) => ({ ...p, first_name: e.target.value }))} className="h-9 px-3 text-sm" style={fieldStyle} />
          <input placeholder="Last name" value={createForm.last_name} onChange={(e) => setCreateForm((p) => ({ ...p, last_name: e.target.value }))} className="h-9 px-3 text-sm" style={fieldStyle} />
          <input placeholder="Email" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} className="h-9 px-3 text-sm" style={fieldStyle} />
          <input type="password" placeholder="Temp password (≥10 chars)" value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} className="h-9 px-3 text-sm" style={fieldStyle} />
          <select value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))} className="h-9 px-2 text-sm" style={fieldStyle}>
            <option value="learner">learner</option>
            <option value="coach">coach</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={createUser} className="ox-cta h-9 px-5 text-[13px] font-semibold">Create user</button>
          <button onClick={purgeDemos} className="h-9 px-5 text-[13px] font-display" style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--cream)", borderRadius: 2 }}>
            Purge demo accounts
          </button>
        </div>
      </section>

      {loading ? (
        <p className="font-body" style={{ color: "var(--ox-muted)" }}>Loading users...</p>
      ) : (
        <div className="rounded-sm overflow-x-auto" style={{ border: "1px solid var(--ox-line)", background: "var(--ox-surface)" }}>
          <table className="w-full text-sm font-body">
            <thead style={{ background: "rgba(217,172,74,0.1)" }}>
              <tr>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Name</th>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Email</th>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Role</th>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Status</th>
                <th className="text-left p-3 font-display text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--ochre)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderTop: "1px solid rgba(150,118,43,0.3)" }}>
                  <td className="p-3">{[user.first_name, user.last_name].filter(Boolean).join(" ") || "N/A"}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className="h-9 px-2 rounded-sm"
                      style={{ background: "var(--ox-input-bg)", border: "1px solid var(--ox-line)", color: "var(--ox-fg-dark)" }}
                    >
                      <option value="learner">learner</option>
                      <option value="coach">coach</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <span
                      className="font-display text-[11px] tracking-[0.14em] uppercase"
                      style={{
                        color: user.is_active ? "var(--mint)" : "var(--ochre)",
                        borderBottom: "1px solid rgba(150,118,43,0.55)",
                      }}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        type="password"
                        placeholder="New password"
                        value={resetPassword[user.id] || ""}
                        onChange={(e) => setResetPassword((p) => ({ ...p, [user.id]: e.target.value }))}
                        className="h-9 px-2 text-[12px] w-36"
                        style={fieldStyle}
                      />
                      <button onClick={() => setPassword(user.id)} className="ox-ghost-light px-3 h-9 text-[12px] font-display">
                        Set password
                      </button>
                      {user.is_active ? (
                        <button onClick={() => deactivate(user.id)} className="ox-ghost-light px-3 h-9 text-[12px] font-display">
                          Deactivate
                        </button>
                      ) : (
                        <button onClick={() => activate(user.id)} className="ox-cta px-3 h-9 text-[12px] font-semibold">
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => softDelete(user.id)}
                        className="px-3 h-9 text-[12px] font-display"
                        style={{ border: "1px solid rgba(150,118,43,0.45)", color: "var(--cream)", borderRadius: 2 }}
                      >
                        Soft-delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
