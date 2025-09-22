import { Markup } from "interweave";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Blog } from "@/types/blog";

interface Props {
  blog: Blog;
}

const BlogCard = ({ blog }: Props) => {
  return (
    <Card className="group w-full max-w-md overflow-hidden bg-transparent border-0 shadow-none transition-transform duration-300 hover:-translate-y-1.5 rounded-xl p-0">
      <div className="relative w-full aspect-video">
        <Image
          src={blog.main_image_url}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-md text-xs font-semibold tracking-wide">
          {new Date(blog.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      <CardContent className="p-4 pb-5">
        <Link href={`/blogs/${blog.id}`}>
          <h3 className="text-lg font-bold text-foreground mb-2.5 leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {blog.title}
          </h3>
        </Link>
        <Markup
          className="text-muted-foreground leading-relaxed text-sm line-clamp-2"
          content={
            blog.content.length > 200
              ? `${blog.content.substring(0, 200)}...`
              : blog.content
          }
        />
      </CardContent>
    </Card>
  );
};

export default BlogCard;
