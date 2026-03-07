import { useParams } from "react-router-dom";
import { BlogPost } from "@/components/portfolio/BlogPost";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  return <BlogPost slug={slug ?? ""} />;
}
