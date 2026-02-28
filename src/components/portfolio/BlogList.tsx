import * as React from "react";
import { publicApi, getImageUrl } from "@/lib/api";
import type { Post } from "@/lib/api";

export function BlogList() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    publicApi.getPosts({ limit: 50 }).then((res) => {
      if (res.success && res.data) setPosts(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p>Belum ada artikel.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <h1 className="mb-10 text-3xl font-bold tracking-tight text-foreground md:text-4xl">Blog</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.id} className="rounded-2xl border border-border bg-card/50 overflow-hidden transition-shadow hover:shadow-lg">
            <a href={`/blog/${post.slug}`} className="block">
              {post.image_url && (
                <div className="aspect-video w-full overflow-hidden bg-white/5">
                  <img src={getImageUrl(post.image_url)} alt="" className="h-full w-full object-cover transition-transform hover:scale-105" loading="lazy" />
                </div>
              )}
              <div className="p-6">
                <h2 className="mb-2 text-xl font-semibold text-foreground hover:text-primary">{post.title}</h2>
                {post.excerpt && <p className="mb-3 text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                <p className="text-xs text-muted-foreground">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Draft"}
                </p>
              </div>
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
