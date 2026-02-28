import * as React from "react";
import { publicApi, getImageUrl } from "@/lib/api";
import type { Post } from "@/lib/api";

interface BlogPostProps {
  slug: string;
  initialPost?: Post | null;
}

export function BlogPost({ slug, initialPost }: BlogPostProps) {
  const [post, setPost] = React.useState<Post | null>(initialPost ?? null);
  const [loading, setLoading] = React.useState(typeof initialPost === "undefined");
  const [notFound, setNotFound] = React.useState(initialPost === null);

  React.useEffect(() => {
    if (typeof initialPost !== "undefined") return;
    if (!slug) return;
    publicApi.getPost(slug).then((res) => {
      if (res.success && res.data) setPost(res.data);
      else setNotFound(true);
      setLoading(false);
    });
  }, [slug, initialPost]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Artikel tidak ditemukan</h1>
        <a href="/blog" className="text-primary hover:underline">Kembali ke Blog</a>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <a href="/blog" className="mb-8 inline-block text-sm text-muted-foreground hover:text-primary">← Kembali ke Blog</a>
      {post.image_url && (
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-2xl bg-white/5">
          <img src={getImageUrl(post.image_url)} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <header className="mb-8">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{post.title}</h1>
        <p className="text-sm text-muted-foreground">
          {post.published_at ? new Date(post.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}
        </p>
      </header>
      <div
        className="prose prose-invert max-w-none text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-headings:text-foreground"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />
    </article>
  );
}
