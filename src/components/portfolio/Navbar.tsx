import * as React from "react";
import { Link } from "react-router-dom";
import { fetchPublicProfile, getImageUrl } from "@/lib/api";

const navLinks = [
  { href: "/#home", label: "Beranda" },
  { href: "/#skills", label: "Skills" },
  { href: "/#projects", label: "Proyek" },
  { href: "/#experience", label: "Pengalaman" },
  { href: "/#certificates", label: "Sertifikat" },
  { href: "/#testimonials", label: "Testimoni" },
];

export default function Navbar() {
  const navbarRef = React.useRef<HTMLElement>(null);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [logoName, setLogoName] = React.useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [dark, setDark] = React.useState(() => {
    if (typeof document === "undefined") return true;
    return document.documentElement.classList.contains("dark");
  });

  React.useEffect(() => {
    fetchPublicProfile().then((profile) => {
      if (profile?.avatar_url) {
        setLogoUrl(getImageUrl(profile.avatar_url));
        if (profile.name) setLogoName(profile.name);
      }
    });
  }, []);

  React.useEffect(() => {
    const nav = navbarRef.current;
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 20) {
        nav.classList.add("glass", "border-b", "border-border", "shadow-lg", "shadow-black/20");
      } else {
        nav.classList.remove("glass", "border-b", "border-border", "shadow-lg", "shadow-black/20");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !document.documentElement.classList.toggle("dark", !dark);
    setDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (_e) {}
  };

  return (
    <header
      ref={navbarRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      aria-label="Main navigation"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link to="/#home" className="flex items-center gap-2 font-bold text-foreground transition-opacity hover:opacity-90">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary shadow-lg shadow-primary/30 ring-2 ring-primary/20">
            {logoUrl ? (
              <img src={logoUrl} alt={logoName ? `${logoName} profile` : "Profile"} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-extrabold text-primary-foreground">NA</span>
            )}
          </span>
          <span className="hidden sm:inline text-foreground">NA</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav-link rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/50 text-foreground transition-colors hover:bg-white/5"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title="Toggle theme"
          >
            {dark ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <a href="/#contact" className="btn-gradient inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-lg">
            Hubungi Saya
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/50 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`border-t border-border bg-card/95 backdrop-blur-xl md:hidden ${mobileOpen ? "" : "hidden"}`}
        aria-hidden={!mobileOpen}
      >
        <ul className="flex flex-col px-4 py-4" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="mobile-nav-link block rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="mt-2">
            <a href="/#contact" className="btn-gradient block rounded-lg px-4 py-3 text-center font-semibold" onClick={() => setMobileOpen(false)}>
              Hubungi Saya
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
