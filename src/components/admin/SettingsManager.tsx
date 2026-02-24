import * as React from "react";
import { adminApi, getImageUrl } from "@/lib/api";
import type { AdminUser, SiteSettings } from "@/lib/api";
import { useToast } from "./AdminShell";

export function SettingsManager() {
  const ctx = useToast();
  const addToast = ctx?.addToast ?? (() => {});
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"profile" | "site" | "password">("profile");
  const [saving, setSaving] = React.useState(false);

  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState("");
  const [cvFile, setCvFile] = React.useState<File | null>(null);

  const [profileForm, setProfileForm] = React.useState({ name: "", email: "", bio: "" });
  const [siteForm, setSiteForm] = React.useState<SiteSettings>({});
  const [heroImageFile, setHeroImageFile] = React.useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = React.useState("");
  const [passwordForm, setPasswordForm] = React.useState({ current: "", next: "", confirm: "" });

  React.useEffect(() => {
    Promise.all([adminApi.getMe(), adminApi.getSettings()]).then(([meRes, settingsRes]) => {
      if (meRes.success && meRes.data) {
        const u = meRes.data as AdminUser;
        setUser(u);
        setProfileForm({
          name: u?.name != null ? String(u.name) : "",
          email: u?.email != null ? String(u.email) : "",
          bio: u?.bio != null ? String(u.bio) : "",
        });
        if (u?.avatar_url) setAvatarPreview(getImageUrl(u.avatar_url));
      }
      if (settingsRes.success && settingsRes.data) {
        setSiteForm(settingsRes.data as SiteSettings);
      }
    }).finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", String(profileForm.name ?? ""));
      fd.append("email", String(profileForm.email ?? ""));
      fd.append("bio", String(profileForm.bio ?? ""));
      if (avatarFile) fd.append("avatar", avatarFile);
      if (cvFile) fd.append("cv", cvFile);

      const res = await adminApi.updateProfile(fd);
      if (res.success) {
        addToast("success", "Profile updated!");
        if (res.data) {
          const u = res.data as AdminUser;
          setUser(u);
          setProfileForm({
            name: u?.name != null ? String(u.name) : "",
            email: u?.email != null ? String(u.email) : "",
            bio: u?.bio != null ? String(u.bio) : "",
          });
          setAvatarPreview(u?.avatar_url ? getImageUrl(u.avatar_url) : "");
          setAvatarFile(null);
          setCvFile(null);
        }
      } else {
        const msg = res.errors?.[0]?.msg ?? res.errors?.[0]?.message ?? res.message ?? "Failed to update profile";
        addToast("error", String(msg));
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveSite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let res: { success: boolean; data?: SiteSettings; message?: string };
      if (heroImageFile) {
        const fd = new FormData();
        const keys: (keyof SiteSettings)[] = [
          "hero_badge", "hero_title", "hero_subtitle", "hero_cta_primary", "hero_cta_secondary",
          "about_bio", "about_years", "about_projects", "about_stack",
          "contact_email", "contact_github", "contact_linkedin", "footer_copyright",
        ];
        keys.forEach((k) => fd.append(String(k), String(siteForm[k] ?? "")));
        fd.append("hero_image", heroImageFile);
        res = await adminApi.updateSettingsFormData(fd);
      } else {
        res = await adminApi.updateSettings(siteForm);
      }
      if (res.success) {
        addToast("success", "Site settings saved!");
        if (res.data) setSiteForm(res.data);
        setHeroImageFile(null);
        setHeroImagePreview("");
      } else {
        addToast("error", res.message || "Failed to save settings");
      }
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      addToast("error", "New passwords do not match");
      return;
    }
    if (passwordForm.next.length < 8) {
      addToast("error", "Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi.changePassword(passwordForm.current, passwordForm.next);
      if (res.success) {
        addToast("success", "Password changed successfully!");
        setPasswordForm({ current: "", next: "", confirm: "" });
      } else {
        addToast("error", res.message || "Failed to change password");
      }
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-border bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white/5" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile, site content, and security.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-card/50 p-1">
        {(["profile", "site", "password"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all ${
              activeTab === tab ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            {tab === "site" ? "Site Content" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <form onSubmit={saveProfile} className="rounded-2xl border border-border bg-card/50 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>

          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/30" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-white/5 transition-colors">
                Change photo
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (avatarPreview && avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
                      setAvatarFile(f);
                      setAvatarPreview(URL.createObjectURL(f));
                    }
                  }} />
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Name</label>
              <input className={inputClass} placeholder="Your name"
                value={profileForm.name ?? ""} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" className={inputClass} placeholder="your@email.com"
                value={profileForm.email ?? ""} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Bio</label>
              <textarea rows={3} className={inputClass} placeholder="Brief bio..."
                value={profileForm.bio ?? ""} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} />
            </div>
          </div>

          {/* CV: pilih file lalu simpan dengan Save Profile */}
          <div className="rounded-xl border border-border bg-white/5 p-4">
            <label className={labelClass}>CV / Resume</label>
            <div className="flex flex-wrap items-center gap-3">
              {user?.cv_url && (
                <a href={getImageUrl(user?.cv_url ?? "")} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline">
                  View current CV
                </a>
              )}
              <label className="cursor-pointer rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/40 transition-colors">
                {cvFile ? cvFile.name : "Pilih file CV (PDF)"}
                <input type="file" accept=".pdf" className="hidden"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
              </label>
              {cvFile && (
                <span className="text-xs text-muted-foreground">Klik &quot;Save Profile&quot; di bawah untuk menyimpan CV.</span>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="btn-gradient rounded-lg px-8 py-2.5 text-sm font-semibold disabled:opacity-60">
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "site" && (
        <form onSubmit={saveSite} className="rounded-2xl border border-border bg-card/50 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">Site Content</h2>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hero Section</h3>
            <p className="text-xs text-muted-foreground">Konten ini tampil di bagian teratas halaman utama. Simpan untuk mengupdate tampilan di website.</p>
            <div>
              <label className={labelClass}>Badge / Tagline (teks kecil di atas judul)</label>
              <input className={inputClass} placeholder="Web Developer"
                value={siteForm.hero_badge ?? ""} onChange={(e) => setSiteForm({ ...siteForm, hero_badge: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Judul Hero</label>
              <input className={inputClass} placeholder="Building Scalable & Modern Web Applications"
                value={siteForm.hero_title ?? ""} onChange={(e) => setSiteForm({ ...siteForm, hero_title: e.target.value })} />
              <p className="mt-1 text-xs text-muted-foreground">Gunakan &amp; untuk memisahkan bagian yang diberi gradient (contoh: Building &amp; Modern Web Apps).</p>
            </div>
            <div>
              <label className={labelClass}>Subtitle / Deskripsi</label>
              <textarea rows={3} className={inputClass} placeholder="I craft performant, accessible web experiences..."
                value={siteForm.hero_subtitle ?? ""} onChange={(e) => setSiteForm({ ...siteForm, hero_subtitle: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Teks Tombol Utama</label>
                <input className={inputClass} placeholder="View Projects"
                  value={siteForm.hero_cta_primary ?? ""} onChange={(e) => setSiteForm({ ...siteForm, hero_cta_primary: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Teks Tombol Sekunder (Download CV)</label>
                <input className={inputClass} placeholder="Download CV"
                  value={siteForm.hero_cta_secondary ?? ""} onChange={(e) => setSiteForm({ ...siteForm, hero_cta_secondary: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Foto Hero (gambar di sisi kanan)</label>
              <div className="flex flex-wrap items-center gap-4">
                {(heroImagePreview || siteForm.hero_image_url) && (
                  <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-card/50">
                    <img
                      src={heroImagePreview || getImageUrl(siteForm.hero_image_url ?? "")}
                      alt="Hero preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <label className="cursor-pointer rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/40 transition-colors">
                  {heroImageFile ? heroImageFile.name : "Pilih gambar"}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (heroImagePreview && heroImagePreview.startsWith("blob:")) URL.revokeObjectURL(heroImagePreview);
                        setHeroImageFile(f);
                        setHeroImagePreview(URL.createObjectURL(f));
                      }
                    }} />
                </label>
                {heroImageFile && (
                  <span className="text-xs text-muted-foreground">Klik &quot;Save Site Settings&quot; untuk menyimpan.</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">About Section</h3>
            <div>
              <label className={labelClass}>Bio</label>
              <textarea rows={4} className={inputClass}
                value={siteForm.about_bio || ""} onChange={(e) => setSiteForm({ ...siteForm, about_bio: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {(["about_years", "about_projects", "about_stack"] as const).map((k) => (
                <div key={k}>
                  <label className={labelClass}>
                    {k.replace("about_", "").charAt(0).toUpperCase() + k.replace("about_", "").slice(1)}
                  </label>
                  <input className={inputClass} placeholder={k === "about_years" ? "5+" : k === "about_projects" ? "40+" : "15+"}
                    value={siteForm[k] || ""} onChange={(e) => setSiteForm({ ...siteForm, [k]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact & Social</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {(["contact_email", "contact_github", "contact_linkedin"] as const).map((k) => (
                <div key={k}>
                  <label className={labelClass}>{k.replace("contact_", "").toUpperCase()}</label>
                  <input className={inputClass}
                    value={siteForm[k] || ""} onChange={(e) => setSiteForm({ ...siteForm, [k]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className={labelClass}>Footer Copyright</label>
                <input className={inputClass}
                  value={siteForm.footer_copyright || ""} onChange={(e) => setSiteForm({ ...siteForm, footer_copyright: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="btn-gradient rounded-lg px-8 py-2.5 text-sm font-semibold disabled:opacity-60">
              {saving ? "Saving..." : "Save Site Settings"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "password" && (
        <form onSubmit={changePassword} className="rounded-2xl border border-border bg-card/50 p-6 space-y-5 max-w-md">
          <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
          <div>
            <label className={labelClass}>Current Password</label>
            <input type="password" className={inputClass} placeholder="Current password"
              value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input type="password" className={inputClass} placeholder="Min. 8 characters"
              value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input type="password" className={inputClass} placeholder="Repeat new password"
              value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
          </div>
          <button type="submit" disabled={saving}
            className="btn-gradient rounded-lg px-8 py-2.5 text-sm font-semibold disabled:opacity-60">
            {saving ? "Changing..." : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}
