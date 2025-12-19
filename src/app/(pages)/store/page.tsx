"use client";

import BreadcrumbNav from "@/components/breadcrumb-nav";
import ProductCard from "@/components/product-card";
import ProductCardSkeleton from "@/components/skeletons/product-card-skeleton";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";

import PaginationWrapper from "@/components/pagination-wrapper";
import { CategoryList } from "@/components/store/category-list";
import { productService } from "@/services/product.services";
import { ProductCategory } from "@/types/category.types";
import { BaseMeta } from "@/types/common.types";
import { ProductListItem } from "@/types/product.types";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [meta, setMeta] = useState<BaseMeta | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState(() => {
    const v = searchParams.get("search");
    return v && v !== "undefined" ? v : "";
  });

  const getFilters = () => {
    const pageRaw = searchParams.get("page");
    const sortByRaw = searchParams.get("sort_by");
    const sortOrderRaw = searchParams.get("sort_order");

    const categoryRaw = searchParams.get("category_id");
    const searchRaw = searchParams.get("search");
    const stockRaw = searchParams.get("in_stock");

    return {
      page: pageRaw ? Number(pageRaw) : 1,
      per_page: 12,
      sort_by: sortByRaw || "name",
      sort_order: sortOrderRaw || "asc",
      category_id:
        categoryRaw && categoryRaw !== "undefined"
          ? Number(categoryRaw)
          : undefined,
      search: searchRaw && searchRaw !== "undefined" ? searchRaw : undefined,
      in_stock:
        stockRaw === "true" ? true : stockRaw === "false" ? false : undefined,
    };
  };

  const cleanParams = (obj: Record<string, any>) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([_, v]) =>
          v !== undefined &&
          v !== null &&
          v !== "" &&
          v !== "all" &&
          v !== "undefined",
      ),
    );

  const updateURL = async (updates: Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all"
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const qs = params.toString();
    router.push(qs ? `?${qs}` : "/store", { scroll: false });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const f = cleanParams(getFilters());
      const res = await productService.list(f);

      if (res.data) {
        setProducts(res.data.products || []);
        setMeta(res.data.meta || null);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await productService.getCategories();
      if (res.data) {
        setCategories(res.data.categories || []);
      }
    } catch (error) {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const changePage = (p: number) => updateURL({ page: p });

  const handleCategorySelect = (id: number | undefined) => {
    updateURL({ category_id: id, page: 1 });
  };

  const breadcrumbItems = [
    { title: "Home", href: "/" },
    { title: "Products", href: "" },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      <BreadcrumbNav items={breadcrumbItems} className="mb-6" />

      <CategoryList
        categories={categories}
        selectedId={getFilters().category_id}
        onSelect={handleCategorySelect}
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Input
          className="w-full sm:w-72"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            updateURL({ search: v || undefined, page: 1 });
          }}
        />

        <Sheet>
          <SheetTrigger asChild>
            <Button className="flex gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>

          <SheetContent className="w-[380px] p-6">
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold">Filters</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={String(getFilters().category_id) || "all"}
                  onValueChange={(val) =>
                    updateURL({
                      category_id: val === "all" ? undefined : val,
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={`${getFilters().sort_by}-${getFilters().sort_order}`}
                  onValueChange={(val) => {
                    const [by, order] = val.split("-");
                    updateURL({ sort_by: by, sort_order: order, page: 1 });
                  }}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A → Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z → A)</SelectItem>
                    <SelectItem value="selling_price-asc">
                      Price (Low → High)
                    </SelectItem>
                    <SelectItem value="selling_price-desc">
                      Price (High → Low)
                    </SelectItem>
                    <SelectItem value="created_at-desc">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="h-11 px-4 border rounded-md bg-muted/30 flex items-center justify-between">
                <span className="text-sm">In Stock Only</span>
                <Checkbox
                  checked={getFilters().in_stock ?? true}
                  onCheckedChange={(v) =>
                    updateURL({ in_stock: v ? true : undefined, page: 1 })
                  }
                />
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  updateURL({
                    search: undefined,
                    category_id: undefined,
                    sort_by: undefined,
                    sort_order: undefined,
                    in_stock: undefined,
                    page: 1,
                  });
                  setSearch("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Filter className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold">No products found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              We couldn't find any products matching your filters. Try adjusting
              your search or category selection.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                updateURL({
                  search: undefined,
                  category_id: undefined,
                  sort_by: undefined,
                  sort_order: undefined,
                  in_stock: undefined,
                  page: 1,
                });
                setSearch("");
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex justify-center mt-10">
          <PaginationWrapper meta={meta} onPageChange={changePage} />
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
