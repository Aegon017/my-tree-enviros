import { MessageCircle } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface BlogCardProps {
  date: Date;
  title: string;
  description: string;
  commentCount: number;
  imageUrl: StaticImageData;
  imageAlt?: string;
}

const BlogCard = ({
  date,
  title,
  description,
  commentCount,
  imageUrl,
  imageAlt = "Blog post image",
}: BlogCardProps) => {
  const formattedDate = date
    .toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    })
    .toUpperCase();

  return (
    <Card className="group w-full max-w-md overflow-hidden bg-transparent border-0 shadow-none transition-all duration-300 hover:-translate-y-1.5 rounded-xl cursor-pointer p-0">
      {/* Image section with hover zoom effect */}
      <div className="relative w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          className="m-auto transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Date badge */}
        <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-md">
          <span className="text-xs font-semibold tracking-wide">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Content section */}
      <CardContent className="pb-5">
        <h2 className="text-lg font-bold text-foreground mb-2.5 leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h2>

        <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3 text-sm">
          {description}
        </p>

        <div className="flex items-center text-sm text-muted-foreground pt-3 border-t border-border group-hover:text-foreground transition-colors duration-300">
          <MessageCircle className="h-4 w-4 mr-2 group-hover:text-primary transition-colors duration-300" />
          <span>
            {commentCount} {commentCount === 1 ? "COMMENT" : "COMMENTS"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
