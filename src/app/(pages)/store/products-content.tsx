"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Filter } from "lucide-react";
import { productService } from "@/services/product.service";
import type {
  ProductListItem,
  ProductParams,
  ProductCollectionResponse,
} from "@/types/product.types";
import { useDebounce } from "@/hooks/use-debounce";
import ProductCardSkeleton from "@/components/skeletons/product-card-skeleton";
import ProductCard from "@/components/product-card";
import type { BaseMeta } from "@/types/common.types";
import type { ProductCategory } from "@/types/category.types";

interface ProductsState {
  products: ProductListItem[];
  meta: BaseMeta;
  categories: ProductCategory[];
  search: string;
  loading: boolean;
  error: string;
}

const initialState: ProductsState = {
  products: [],
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  },
  categories: [],
  search: "",
  loading: false,
  error: "",
};

export default function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ state, setState ] = useState<ProductsState>( initialState );
  const debouncedSearch = useDebounce( state.search, 400 );

  const getFiltersFromURL = useCallback( (): ProductParams => {
    return {
      page: Number( searchParams.get( "page" ) ) || 1,
      per_page: 12,
      sort_by:
        ( searchParams.get( "sort_by" ) as
          | "name"
          | "selling_price"
          | "created_at" ) || "name",
      sort_order:
        ( searchParams.get( "sort_order" ) as "asc" | "desc" ) || "asc",
      in_stock: searchParams.get( "in_stock" ) !== "false",
      category_id: searchParams.get( "category_id" )
        ? Number( searchParams.get( "category_id" ) )
        : undefined,
      search: searchParams.get( "search" ) || undefined,
    };
  }, [ searchParams ] );

  const updateState = useCallback( ( newState: Partial<ProductsState> ) => {
    setState( ( prev ) => ( { ...prev, ...newState } ) );
  }, [] );

  const updateURL = useCallback(
    ( newFilters: Partial<ProductParams> ) => {
      const currentParams = new URLSearchParams( searchParams.toString() );
      Object.entries( newFilters ).forEach( ( [ key, value ] ) => {
        if ( value === undefined || value === null || value === "" ) {
          currentParams.delete( key );
        } else {
          currentParams.set( key, String( value ) );
        }
      } );
      router.push( `?${ currentParams.toString() }`, { scroll: false } );
    },
    [ router, searchParams ]
  );

  const fetchProducts = useCallback(
    async ( filters: ProductParams ) => {
      updateState( { loading: true, error: "" } );
      try {
        const response: ProductCollectionResponse =
          await productService.getProducts( filters );

        if ( response.success ) {
          updateState( {
            products: response.data.products,
            meta: response.data.meta,
          } );
        } else {
          updateState( {
            error: response.message || "Failed to load products",
          } );
        }
      } catch ( err: any ) {
        updateState( { error: err.message || "Failed to load products" } );
      } finally {
        updateState( { loading: false } );
      }
    },
    [ updateState ]
  );

  const fetchCategories = useCallback( async () => {
    try {
      const data: ProductCategory[] = await productService.getCategories();
      updateState( { categories: data } );
    } catch { }
  }, [ updateState ] );

  useEffect( () => {
    const currentSearch = searchParams.get( "search" ) || "";
    if ( debouncedSearch !== currentSearch ) {
      updateURL( { search: debouncedSearch || undefined, page: 1 } );
    }
  }, [ debouncedSearch, searchParams, updateURL ] );

  useEffect( () => {
    fetchCategories();
  }, [ fetchCategories ] );

  useEffect( () => {
    const filters = getFiltersFromURL();
    fetchProducts( filters );
  }, [ searchParams, getFiltersFromURL, fetchProducts ] );

  const changePage = ( page: number ) => updateURL( { page } );

  const generatePageNumbers = (): ( number | string )[] => {
    const current = state.meta.current_page;
    const last = state.meta.last_page;
    const delta = 2;
    const pages: ( number | string )[] = [];
    const range: number[] = [];

    for (
      let i = Math.max( 2, current - delta );
      i <= Math.min( last - 1, current + delta );
      i++
    )
      range.push( i );

    if ( current - delta > 2 ) range.unshift( -1 );
    if ( current + delta < last - 1 ) range.push( -2 );

    pages.push( 1 );
    range.forEach( ( i ) => pages.push( i === -1 || i === -2 ? "..." : i ) );
    if ( last > 1 ) pages.push( last );
    return [ ...new Set( pages ) ];
  };

  const handleRetry = () => {
    const filters = getFiltersFromURL();
    fetchProducts( filters );
  };

  const handleSearchChange = ( value: string ) => updateState( { search: value } );
  const currentFilters = getFiltersFromURL();

  if ( state.error ) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{ state.error }</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={ handleRetry }>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Input
          className="flex-1 min-w-[200px]"
          placeholder="Search products..."
          value={ state.search }
          onChange={ ( e ) => handleSearchChange( e.target.value ) }
        />

        <Sheet>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2 px-4 py-2">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </SheetTrigger>

          <SheetContent className="w-[380px] p-6">
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold">
                Filter Products
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={
                    currentFilters.category_id
                      ? String( currentFilters.category_id )
                      : "all"
                  }
                  onValueChange={ ( value ) =>
                    updateURL( {
                      category_id:
                        value === "all" ? undefined : Number( value ),
                      page: 1,
                    } )
                  }
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    { state.categories.map( ( category ) => (
                      <SelectItem
                        key={ category.id }
                        value={ String( category.id ) }
                      >
                        { category.name }
                      </SelectItem>
                    ) ) }
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={
                    currentFilters.sort_by && currentFilters.sort_order
                      ? `${ currentFilters.sort_by }-${ currentFilters.sort_order }`
                      : "name-asc"
                  }
                  onValueChange={ ( value ) => {
                    const [ sort_by_raw, sort_order_raw ] = value.split( "-" );

                    const sort_by = sort_by_raw as ProductParams[ "sort_by" ];
                    const sort_order = sort_order_raw as ProductParams[ "sort_order" ];

                    updateURL( { sort_by, sort_order, page: 1 } );
                  } }
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select option" />
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
                <label
                  htmlFor="inStock"
                  className="text-sm font-medium cursor-pointer"
                >
                  In Stock Only
                </label>
                <Checkbox
                  id="inStock"
                  checked={ !!currentFilters.in_stock }
                  onCheckedChange={ ( checked ) =>
                    updateURL( { in_stock: !!checked, page: 1 } )
                  }
                />
              </div>

              <Button
                variant="destructive"
                className="w-full font-medium"
                onClick={ () =>
                  updateURL( {
                    category_id: undefined,
                    sort_by: undefined,
                    sort_order: undefined,
                    in_stock: undefined,
                    page: 1,
                  } )
                }
              >
                Reset Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        { state.loading && state.meta.current_page === 1
          ? Array.from( { length: 9 } ).map( ( _, index ) => (
            <ProductCardSkeleton key={ index } />
          ) )
          : state.products.map( ( product ) => (
            <ProductCard key={ product.id } product={ product } />
          ) ) }
      </div>

      { state.meta.last_page > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={ () =>
                  state.meta.current_page > 1 &&
                  changePage( state.meta.current_page - 1 )
                }
                className={
                  state.meta.current_page === 1 || state.loading
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>

            { generatePageNumbers().map( ( page, i ) => (
              <PaginationItem key={ i }>
                { page === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={ () =>
                      !state.loading && changePage( page as number )
                    }
                    isActive={ state.meta.current_page === page }
                    className={
                      state.loading ? "pointer-events-none opacity-50" : ""
                    }
                  >
                    { page }
                  </PaginationLink>
                ) }
              </PaginationItem>
            ) ) }

            <PaginationItem>
              <PaginationNext
                onClick={ () =>
                  state.meta.current_page < state.meta.last_page &&
                  changePage( state.meta.current_page + 1 )
                }
                className={
                  state.meta.current_page === state.meta.last_page ||
                    state.loading
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) }
    </div>
  );
}