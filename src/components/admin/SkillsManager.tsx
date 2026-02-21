import * as React from "react";
import { adminApi } from "@/lib/api";
import type { Skill } from "@/lib/api";
import { useToast } from "./AdminShell";

export function SkillsManager() {
  const { addToast } = useToast();
  const [skills, setSkills] = React.useState<Skill[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Skill | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<number | null>(null);

  const [form, setForm] = React.useState({
    category: "", name: "", level: "80", order_index: "0",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getSkills();
      if (res.success && res.data) setSkills(res.data);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  function startEdit(skill: Skill) {
    setEditing(skill);
    setForm({
      category: skill.category,
      name: skill.name,
      level: String(skill.level),
      order_index: String(skill.order_index),
    });
    setShowForm(true);
  }

  function startCreate() {
    setEditing(null);
    setForm({ category: "", name: "", level: "80", order_index: "0" });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      let res;
      if (editing) {
        res = await adminApi.updateSkill(editing.id, fd);
      } else {
        res = await adminApi.createSkill(fd);
      }

      if (res.success) {
        addToast("success", editing ? "Skill updated!" : "Skill created!");
        setShowForm(false);
        setEditing(null);
        load();
      } else {
        addToast("error", res.message || "Failed to save skill");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      const res = await adminApi.deleteSkill(id);
      if (res.success) {
        addToast("success", "Skill deleted");
        setSkills((prev) => prev.filter((s) => s.id !== id));
      } else {
        addToast("error", "Failed to delete skill");
      }
    } finally {
      setDeleting(null);
    }
  }

  const grouped = React.useMemo(() => {
    const map: Record<string, Skill[]> = {};
    skills.forEach((s) => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    return Object.entries(map);
  }, [skills]);

  const inputClass = "w-full rounded-lg border border-border bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skills</h1>
          <p className="text-muted-foreground">{skills.length} skills across {grouped.length} categories</p>
        </div>
        <button onClick={startCreate}
          className="btn-gradient inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold">
          + Add Skill
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <h2 className="mb-5 text-lg font-semibold text-foreground">
            {editing ? "Edit Skill" : "New Skill"}
          </h2>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Category *</label>
              <input required className={inputClass} placeholder="e.g. Frontend, Backend, Tools"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Skill Name *</label>
              <input required className={inputClass} placeholder="e.g. React, TypeScript"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Level: <span className="text-primary font-semibold">{form.level}%</span>
              </label>
              <input type="range" min="0" max="100" className="w-full accent-primary"
                value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Order Index</label>
              <input type="number" className={inputClass} value={form.order_index}
                onChange={(e) => setForm({ ...form, order_index: e.target.value })} />
            </div>
            <div className="col-span-2 flex justify-end gap-3 border-t border-border pt-4">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {grouped.map(([cat, items]) => (
            <div key={cat} className="rounded-2xl border border-border bg-card/50 p-5 shadow-lg">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{cat}</h3>
              <ul className="space-y-3">
                {items.map((skill) => (
                  <li key={skill.id} className="group flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground truncate">{skill.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground ml-2">{skill.level}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                          style={{ width: `${skill.level}%` }} />
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(skill)}
                        className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(skill.id)} disabled={deleting === skill.id}
                        className="rounded p-1 text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
