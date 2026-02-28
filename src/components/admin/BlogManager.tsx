import * as React from "react";
import { adminApi, getImageUrl } from "@/lib/api";
import type { Post } from "@/lib/api";
import { useToast } from "./AdminShell";

export function BlogManager() {
  const ctx = useToast();
  const addToast = ctx?.addToast ?? (() => {});
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Post | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<number | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [form, setForm] = React.useState({
    title: "",
    excerpt: "",
    body: "",
    status: "draft" as "draft" | "published",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getPosts({ limit: 100 });
      if (res.success && res.data) setPosts(res.data);
    } finally {
      setLoading(false);
    }
  }
  React.useEffect(() => {
    load();
  }, []);

  function startEdit(post: Post) {
    setEditing(post);
    setForm({ title: post.title, excerpt: post.excerpt ?? "", body: post.body, status: post.status });
    setImageFile(null);
    setShowForm(true);
  }

  function startCreate() {
    setEditing(null);
    setForm({ title: "", excerpt: "", body: "", status: "draft" });
    setImageFile(null);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("excerpt", form.excerpt);
      fd.append("body", form.body);
      fd.append("status", form.status);
      if (imageFile) fd.append("image", imageFile);
      const res = editing
        ? await adminApi.updatePost(editing.id, fd)
        : await adminApi.createPost(fd);
      if (res.success) {
        addToast("success", editing ? "Artikel diupdate!" : "Artikel dibuat!");
        setShowForm(false);
        setEditing(null);
        setImageFile(null);
        load();
      } else {
        addToast("error", res.message || "Gagal menyimpan artikel");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      const res = await adminApi.deletePost(id);
      if (res.success) {
        addToast("success", "Artikel dihapus");
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        addToast("error", "Gagal menghapus artikel");
      }
    } finally {
      setDeleting(null);
    }
  }

  const inputClass = "w-full rounded-lg border border-border bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog</h1>
          <p className="text-muted-foreground">{posts.length} artikel</p>
        </div>
        <button onClick={startCreate} className="btn-gradient inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold">
          + Tambah Artikel
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <h2 className="mb-5 text-lg font-semibold text-foreground">{editing ? "Edit Artikel" : "Artikel Baru"}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className={labelClass}>Judul *</label>
              <input required className={inputClass} placeholder="Judul artikel" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Ringkasan (excerpt)</label>
              <textarea rows={2} className={inputClass} placeholder="Ringkasan singkat..." value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Konten (body) *</label>
              <textarea required rows={12} className={`${inputClass} font-mono text-xs`} placeholder="Isi artikel. Bisa pakai HTML (p, strong, a)." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Gambar cover</label>
              <div className="flex items-center gap-3">
                {(editing?.image_url || imageFile) && (
                  <div className="h-20 w-32 overflow-hidden rounded-lg border border-border bg-card/50">
                    {imageFile ? <img src={URL.createObjectURL(imageFile)} alt="" className="h-full w-full object-cover" /> : editing?.image_url && <img src={getImageUrl(editing.image_url)} alt="" className="h-full w-full object-cover" />}
                  </div>
                )}
                <label className="cursor-pointer rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/40">
                  {imageFile ? imageFile.name : "Pilih gambar"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setImageFile(null); }} className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/5">Batal</button>
              <button type="submit" disabled={saving} className="btn-gradient rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-60">{saving ? "Menyimpan..." : editing ? "Update" : "Buat"}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />)}</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/50 p-5">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                <p className="text-sm text-muted-foreground">/{post.slug} · {post.status} · {post.published_at ? new Date(post.published_at).toLocaleDateString() : "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">Lihat</a>
                <button onClick={() => startEdit(post)} className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">Edit</button>
                <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id} className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50">Hapus</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
