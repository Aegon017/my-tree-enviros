"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import BreadcrumbNav from "@/components/breadcrumb-nav";
import ProductCard from "@/components/product-card";
import ProductCardSkeleton from "@/components/skeletons/product-card-skeleton";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";

import PaginationWrapper from "@/components/pagination-wrapper";
import { productService } from "@/services/product.services";
import { ProductCategory } from "@/types/category.types";
import { BaseMeta } from "@/types/common.types";
import { ProductListItem } from "@/types/product.types";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ products, setProducts ] = useState<ProductListItem[]>( [] );
  const [ meta, setMeta ] = useState<BaseMeta | null>( null );
  const [ categories, setCategories ] = useState<ProductCategory[]>( [] );
  const [ loading, setLoading ] = useState( false );

  const [ search, setSearch ] = useState( () => {
    const v = searchParams.get( "search" );
    return v && v !== "undefined" ? v : "";
  } );

  const getFilters = () => {
    const pageRaw = searchParams.get( "page" );
    const sortByRaw = searchParams.get( "sort_by" );
    const sortOrderRaw = searchParams.get( "sort_order" );

    const categoryRaw = searchParams.get( "category_id" );
    const searchRaw = searchParams.get( "search" );
    const stockRaw = searchParams.get( "in_stock" );

    return {
      page: pageRaw ? Number( pageRaw ) : 1,
      per_page: 12,
      sort_by: sortByRaw || "name",
      sort_order: sortOrderRaw || "asc",
      category_id:
        categoryRaw && categoryRaw !== "undefined" ? Number( categoryRaw ) : undefined,
      search:
        searchRaw && searchRaw !== "undefined" ? searchRaw : undefined,
      in_stock:
        stockRaw === "true"
          ? true
          : stockRaw === "false"
            ? false
            : undefined
    };
  };

  const cleanParams = ( obj: Record<string, any> ) =>
    Object.fromEntries(
      Object.entries( obj ).filter(
        ( [ _, v ] ) =>
          v !== undefined &&
          v !== null &&
          v !== "" &&
          v !== "all" &&
          v !== "undefined"
      )
    );

  const updateURL = ( updates: Record<string, any> ) => {
    const params = new URLSearchParams( searchParams.toString() );
    Object.entries( updates ).forEach( ( [ key, value ] ) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all"
      ) {
        params.delete( key );
      } else {
        params.set( key, String( value ) );
      }
    } );

    const qs = params.toString();
    router.push( qs ? `?${ qs }` : "/products", { scroll: false } );
  };

  const fetchProducts = async () => {
    setLoading( true );
    try {
      const f = cleanParams( getFilters() );
      const res = await productService.list( f );

      setProducts( res.products );
      setMeta( res.meta );
    } finally {
      setLoading( false );
    }
  };



  const fetchCategories = async () => {
    const res = await fetch(
      `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/product-categories`
    );
    const data = await res.json();
    if ( data.success ) setCategories( data.data.categories );
  };

  useEffect( () => {
    fetchCategories();
  }, [] );

  useEffect( () => {
    fetchProducts();
  }, [ searchParams ] );

  const changePage = ( p: number ) => updateURL( { page: p } );

  const breadcrumbItems = [
    { title: "Home", href: "/" },
    { title: "Products", href: "" }
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <BreadcrumbNav items={ breadcrumbItems } className="mb-6" />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Input
          className="w-full sm:w-72"
          placeholder="Search products..."
          value={ search }
          onChange={ ( e ) => {
            const v = e.target.value;
            setSearch( v );
            updateURL( { search: v || undefined, page: 1 } );
          } }
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
                  value={ String( getFilters().category_id ) || "all" }
                  onValueChange={ ( val ) =>
                    updateURL( {
                      category_id: val === "all" ? undefined : val,
                      page: 1
                    } )
                  }
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    { categories.map( ( c ) => (
                      <SelectItem key={ c.id } value={ String( c.id ) }>
                        { c.name }
                      </SelectItem>
                    ) ) }
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={ `${ getFilters().sort_by }-${ getFilters().sort_order }` }
                  onValueChange={ ( val ) => {
                    const [ by, order ] = val.split( "-" );
                    updateURL( { sort_by: by, sort_order: order, page: 1 } );
                  } }
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A → Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z → A)</SelectItem>
                    <SelectItem value="selling_price-asc">Price (Low → High)</SelectItem>
                    <SelectItem value="selling_price-desc">Price (High → Low)</SelectItem>
                    <SelectItem value="created_at-desc">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="h-11 px-4 border rounded-md bg-muted/30 flex items-center justify-between">
                <span className="text-sm">In Stock Only</span>
                <Checkbox
                  checked={ getFilters().in_stock ?? true }
                  onCheckedChange={ ( v ) =>
                    updateURL( { in_stock: v ? true : undefined, page: 1 } )
                  }
                />
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={ () => {
                  updateURL( {
                    search: undefined,
                    category_id: undefined,
                    sort_by: undefined,
                    sort_order: undefined,
                    in_stock: undefined,
                    page: 1
                  } );
                  setSearch( "" );
                } }
              >
                Reset Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        { loading && products.length === 0
          ? Array.from( { length: 12 } ).map( ( _, i ) => (
            <ProductCardSkeleton key={ i } />
          ) )
          : products.map( ( p ) => <ProductCard key={ p.id } product={ p } /> ) }
      </div>

      { meta && meta.last_page > 1 && (
        <div className="flex justify-center mt-10">
          <PaginationWrapper meta={ meta } onPageChange={ changePage } />
        </div>
      ) }
    </div>
  );
}