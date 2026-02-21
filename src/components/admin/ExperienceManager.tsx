import * as React from "react";
import { adminApi } from "@/lib/api";
import type { Experience } from "@/lib/api";
import { useToast } from "./AdminShell";

export function ExperienceManager() {
  const { addToast } = useToast();
  const [items, setItems] = React.useState<Experience[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Experience | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<number | null>(null);

  const emptyForm = {
    company: "", role: "", duration: "", start_date: "", end_date: "",
    is_current: false, achievements: "", order_index: "0",
  };
  const [form, setForm] = React.useState(emptyForm);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getExperiences();
      if (res.success && res.data) setItems(res.data);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  function startEdit(exp: Experience) {
    setEditing(exp);
    setForm({
      company: exp.company,
      role: exp.role,
      duration: exp.duration || "",
      start_date: exp.start_date || "",
      end_date: exp.end_date || "",
      is_current: exp.is_current,
      achievements: exp.achievements.join("\n"),
      order_index: String(exp.order_index),
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        company: form.company,
        role: form.role,
        duration: form.duration,
        start_date: form.start_date || undefined,
        end_date: form.is_current ? undefined : (form.end_date || undefined),
        is_current: form.is_current,
        achievements: form.achievements.split("\n").map((s) => s.trim()).filter(Boolean),
        order_index: parseInt(form.order_index),
      };

      let res;
      if (editing) {
        res = await adminApi.updateExperience(editing.id, payload);
      } else {
        res = await adminApi.createExperience(payload);
      }

      if (res.success) {
        addToast("success", editing ? "Experience updated!" : "Experience created!");
        setShowForm(false);
        setEditing(null);
        load();
      } else {
        addToast("error", res.message || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      const res = await adminApi.deleteExperience(id);
      if (res.success) {
        addToast("success", "Experience deleted");
        setItems((prev) => prev.filter((e) => e.id !== id));
      } else {
        addToast("error", "Failed to delete");
      }
    } finally {
      setDeleting(null);
    }
  }

  const inputClass = "w-full rounded-lg border border-border bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Experience</h1>
          <p className="text-muted-foreground">{items.length} entries</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
          className="btn-gradient inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold">
          + Add Experience
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <h2 className="mb-5 text-lg font-semibold text-foreground">
            {editing ? "Edit Experience" : "New Experience"}
          </h2>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Company *</label>
              <input required className={inputClass} placeholder="Company name"
                value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Role *</label>
              <input required className={inputClass} placeholder="Job title"
                value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Duration (display text)</label>
              <input className={inputClass} placeholder="e.g. 2022 – Present"
                value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Order Index</label>
              <input type="number" className={inputClass} value={form.order_index}
                onChange={(e) => setForm({ ...form, order_index: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Start Date</label>
              <input type="date" className={inputClass} value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">End Date</label>
              <input type="date" className={inputClass} disabled={form.is_current} value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-white/5 px-4 py-3">
              <input type="checkbox" id="current-check" checked={form.is_current}
                onChange={(e) => setForm({ ...form, is_current: e.target.checked, end_date: "" })}
                className="h-4 w-4 rounded border-border accent-primary" />
              <label htmlFor="current-check" className="text-sm font-medium text-foreground">
                Currently working here
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Achievements (one per line)
              </label>
              <textarea rows={5} className={inputClass}
                placeholder={"Led frontend architecture...\nImproved performance by 40%..."}
                value={form.achievements}
                onChange={(e) => setForm({ ...form, achievements: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 border-t border-border pt-4">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/5">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="btn-gradient rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-60">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No experience entries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((exp) => (
            <div key={exp.id} className="rounded-2xl border border-border bg-card/50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{exp.role}</h3>
                    {exp.is_current && (
                      <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{exp.company} · {exp.duration}</p>
                  <ul className="mt-3 space-y-1">
                    {exp.achievements.slice(0, 2).map((a, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                        <span>{a}</span>
                      </li>
                    ))}
                    {exp.achievements.length > 2 && (
                      <li className="text-xs text-muted-foreground">+{exp.achievements.length - 2} more</li>
                    )}
                  </ul>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => startEdit(exp)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(exp.id)} disabled={deleting === exp.id}
                    className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                    {deleting === exp.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
