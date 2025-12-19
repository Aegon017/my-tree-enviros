import { ProductCategory } from "@/types/category.types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Sprout } from "lucide-react";

interface CategoryListProps {
    categories: ProductCategory[];
    selectedId?: number;
    onSelect: (id: number | undefined) => void;
}

export function CategoryList({
    categories,
    selectedId,
    onSelect,
}: CategoryListProps) {
    if (!categories.length) return null;

    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-8 min-w-max px-4 lg:justify-center mx-auto">
                <button
                    onClick={() => onSelect(undefined)}
                    className={cn(
                        "flex flex-col items-center gap-3 w-24 group transition-all duration-300",
                        !selectedId ? "scale-105" : "opacity-70 hover:opacity-100"
                    )}
                >
                    <div
                        className={cn(
                            "w-20 h-20 my-1 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                            !selectedId
                                ? "border-primary bg-primary/10"
                                : "border-transparent bg-muted group-hover:border-primary/50"
                        )}
                    >
                        <Sprout
                            className={cn(
                                "w-8 h-8 transition-colors",
                                !selectedId ? "text-primary" : "text-muted-foreground"
                            )}
                        />
                    </div>
                    <span
                        className={cn(
                            "text-sm font-medium transition-colors",
                            !selectedId ? "text-primary font-bold" : "text-muted-foreground"
                        )}
                    >
                        All Products
                    </span>
                </button>

                {categories.map((category) => {
                    const isSelected = selectedId === category.id;
                    return (
                        <button
                            key={category.id}
                            onClick={() => onSelect(isSelected ? undefined : category.id)}
                            className={cn(
                                "flex flex-col items-center gap-3 w-24 group transition-all duration-300",
                                isSelected ? "scale-105" : "opacity-70 hover:opacity-100"
                            )}
                        >
                            <div
                                className={cn(
                                    "relative w-20 h-20 my-1 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-sm",
                                    isSelected
                                        ? "border-primary"
                                        : "border-transparent bg-muted group-hover:border-primary/50"
                                )}
                            >
                                {category.image_url ? (
                                    <Image
                                        src={category.image_url}
                                        alt={category.name}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <Sprout className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-sm font-medium transition-colors text-center w-full truncate px-1",
                                    isSelected
                                        ? "text-primary font-bold"
                                        : "text-muted-foreground"
                                )}
                            >
                                {category.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
