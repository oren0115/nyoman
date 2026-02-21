import * as React from "react";
import { adminApi, getImageUrl } from "@/lib/api";
import type { SeoSettings } from "@/lib/api";
import { useToast } from "./AdminShell";

export function SeoManager() {
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [ogFile, setOgFile] = React.useState<File | null>(null);
  const [ogPreview, setOgPreview] = React.useState("");
  const [faviconFile, setFaviconFile] = React.useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = React.useState("");

  const [form, setForm] = React.useState({
    site_title: "",
    site_description: "",
    og_title: "",
    og_description: "",
    keywords: "",
  });

  React.useEffect(() => {
    adminApi.getSeo().then((res) => {
      if (res.success && res.data) {
        const d = res.data as SeoSettings;
        setForm({
          site_title: d.site_title || "",
          site_description: d.site_description || "",
          og_title: d.og_title || "",
          og_description: d.og_description || "",
          keywords: d.keywords || "",
        });
        if (d.og_image_url) setOgPreview(getImageUrl(d.og_image_url));
        if (d.favicon_url) setFaviconPreview(getImageUrl(d.favicon_url));
      }
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (ogFile) fd.append("og_image", ogFile);

      const res = await adminApi.updateSeo(fd);
      if (res.success) {
        addToast("success", "SEO settings saved!");
      } else {
        addToast("error", res.message || "Failed to save SEO");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleFaviconUpload() {
    if (!faviconFile) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("favicon", faviconFile);
      const res = await adminApi.updateSeo(fd);
      if (res.success) {
        addToast("success", "Favicon uploaded!");
      } else {
        addToast("error", "Failed to upload favicon");
      }
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-border bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-white/5" />
        <div className="h-96 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SEO Management</h1>
        <p className="text-muted-foreground">Configure site metadata, Open Graph, and SEO settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Site Meta */}
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <h2 className="mb-5 text-lg font-semibold text-foreground">Site Metadata</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Site Title</label>
              <input className={inputClass} placeholder="My Portfolio — Web Developer"
                value={form.site_title} onChange={(e) => setForm({ ...form, site_title: e.target.value })} />
              <p className="mt-1 text-xs text-muted-foreground">
                {form.site_title.length}/60 characters recommended
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Site Description</label>
              <textarea rows={3} className={inputClass}
                placeholder="A brief description of your site for search engines..."
                value={form.site_description}
                onChange={(e) => setForm({ ...form, site_description: e.target.value })} />
              <p className="mt-1 text-xs text-muted-foreground">
                {form.site_description.length}/160 characters recommended
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Keywords</label>
              <input className={inputClass} placeholder="web developer, react, typescript, nodejs"
                value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Open Graph */}
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <h2 className="mb-5 text-lg font-semibold text-foreground">Open Graph (Social Media)</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">OG Title</label>
              <input className={inputClass} placeholder="Title shown when shared on social media"
                value={form.og_title} onChange={(e) => setForm({ ...form, og_title: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">OG Description</label>
              <textarea rows={2} className={inputClass}
                placeholder="Description shown in social media previews..."
                value={form.og_description}
                onChange={(e) => setForm({ ...form, og_description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">OG Image</label>
              <div className="flex items-start gap-4">
                {ogPreview && (
                  <img src={ogPreview} alt="OG Preview" className="h-20 w-36 rounded-lg object-cover ring-1 ring-border" />
                )}
                <label className="flex-1 cursor-pointer rounded-lg border border-dashed border-border bg-white/5 px-4 py-6 text-center transition-colors hover:border-primary/40">
                  <svg className="mx-auto mb-2 h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Upload OG image (1200×630px)</span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setOgFile(f); setOgPreview(URL.createObjectURL(f)); }
                    }} />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="btn-gradient rounded-lg px-8 py-3 font-semibold disabled:opacity-60">
            {saving ? "Saving..." : "Save SEO Settings"}
          </button>
        </div>
      </form>

      {/* Favicon */}
      <div className="rounded-2xl border border-border bg-card/50 p-6">
        <h2 className="mb-5 text-lg font-semibold text-foreground">Favicon</h2>
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-white/5">
            {faviconPreview ? (
              <img src={faviconPreview} alt="Favicon" className="h-10 w-10 object-contain" />
            ) : (
              <svg className="h-8 w-8 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-lg border border-dashed border-border bg-white/5 px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/40 transition-colors">
              Choose favicon (ICO/PNG/SVG)
              <input type="file" accept=".ico,.png,.svg,image/x-icon" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setFaviconFile(f); setFaviconPreview(URL.createObjectURL(f)); }
                }} />
            </label>
            {faviconFile && (
              <button onClick={handleFaviconUpload} disabled={saving}
                className="rounded-lg bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/30 disabled:opacity-60">
                Upload
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
