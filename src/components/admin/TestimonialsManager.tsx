import * as React from "react";
import { adminApi, getImageUrl } from "@/lib/api";
import type { Testimonial } from "@/lib/api";
import { useToast } from "./AdminShell";

export function TestimonialsManager() {
  const { addToast } = useToast();
  const [items, setItems] = React.useState<Testimonial[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Testimonial | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<number | null>(null);

  const emptyForm = {
    client_name: "", company: "", feedback: "", rating: "5", order_index: "0", is_active: true,
  };
  const [form, setForm] = React.useState(emptyForm);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getTestimonials();
      if (res.success && res.data) setItems(res.data);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  function startEdit(t: Testimonial) {
    setEditing(t);
    setForm({
      client_name: t.client_name,
      company: t.company || "",
      feedback: t.feedback,
      rating: String(t.rating),
      order_index: String(t.order_index),
      is_active: t.is_active,
    });
    setAvatarPreview(t.avatar_url ? getImageUrl(t.avatar_url) : "");
    setAvatarFile(null);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (avatarFile) fd.append("avatar", avatarFile);

      let res;
      if (editing) {
        res = await adminApi.updateTestimonial(editing.id, fd);
      } else {
        res = await adminApi.createTestimonial(fd);
      }

      if (res.success) {
        addToast("success", editing ? "Testimonial updated!" : "Testimonial created!");
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
      const res = await adminApi.deleteTestimonial(id);
      if (res.success) {
        addToast("success", "Testimonial deleted");
        setItems((prev) => prev.filter((t) => t.id !== id));
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
          <h1 className="text-2xl font-bold text-foreground">Testimonials</h1>
          <p className="text-muted-foreground">{items.length} testimonials</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setAvatarPreview(""); setAvatarFile(null); setShowForm(true); }}
          className="btn-gradient inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold">
          + Add Testimonial
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <h2 className="mb-5 text-lg font-semibold text-foreground">
            {editing ? "Edit Testimonial" : "New Testimonial"}
          </h2>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Client Name *</label>
              <input required className={inputClass} placeholder="Client full name"
                value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Company</label>
              <input className={inputClass} placeholder="Company name"
                value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Feedback *</label>
              <textarea required rows={3} className={inputClass} placeholder="Client feedback..."
                value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Rating: <span className="text-yellow-400">{"★".repeat(parseInt(form.rating))}</span>
              </label>
              <input type="range" min="1" max="5" className="w-full accent-yellow-400"
                value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Order Index</label>
              <input type="number" className={inputClass} value={form.order_index}
                onChange={(e) => setForm({ ...form, order_index: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-white/5 px-4 py-3">
              <input type="checkbox" id="active-check" checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-border accent-primary" />
              <label htmlFor="active-check" className="text-sm font-medium text-foreground">Active (shown publicly)</label>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Avatar</label>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/30" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary text-xl font-bold">
                    {form.client_name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <label className="cursor-pointer rounded-lg border border-dashed border-border bg-white/5 px-4 py-3 text-sm text-muted-foreground hover:border-primary/40 transition-colors">
                  Upload avatar
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
                    }} />
                </label>
              </div>
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
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/5" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No testimonials yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border bg-card/50 p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {t.avatar_url ? (
                    <img src={getImageUrl(t.avatar_url)} alt={t.client_name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {t.client_name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.client_name}</p>
                    {t.company && <p className="text-xs text-muted-foreground">{t.company}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs rounded-full px-2 py-0.5 ${t.is_active ? "bg-green-500/15 text-green-400" : "bg-white/10 text-muted-foreground"}`}>
                    {t.is_active ? "Active" : "Hidden"}
                  </span>
                  <span className="text-yellow-400 text-xs">{"★".repeat(t.rating)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 italic">"{t.feedback}"</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => startEdit(t)}
                  className="flex-1 rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground">
                  Edit
                </button>
                <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                  className="flex-1 rounded-lg border border-red-500/20 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                  {deleting === t.id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
