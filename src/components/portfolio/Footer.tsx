import * as React from "react";
import { Link } from "react-router-dom";
import { publicApi } from "@/lib/api";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [footer, setFooter] = React.useState<{ contact_github?: string; contact_linkedin?: string; footer_copyright?: string }>({});

  React.useEffect(() => {
    publicApi.getSettings().then((res) => {
      if (res.success && res.data) setFooter(res.data);
    });
  }, []);

  return (
    <footer className="border-t border-border bg-card/30 py-8" role="contentinfo">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
        <nav aria-label="Footer links" className="flex flex-wrap items-center justify-center gap-6">
          <Link to="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Blog
          </Link>
          <a href="/#contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Kontak
          </a>
          <span className="text-muted-foreground/50">|</span>
          <a
            href={footer.contact_github || "https://github.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            GitHub
          </a>
          <a
            href={footer.contact_linkedin || "https://linkedin.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            LinkedIn
          </a>
        </nav>
        <p className="text-sm text-muted-foreground">
          © {currentYear} {footer.footer_copyright || "Portfolio. All rights reserved."}
        </p>
      </div>
    </footer>
  );
}
