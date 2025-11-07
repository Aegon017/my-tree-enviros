"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, X, Search, Star } from "lucide-react";

export type ProductParams = {
  search?: string;
  category_id?: number;
  in_stock?: boolean;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  sort_by?: "name" | "price" | "created_at";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  botanical_name?: string;
  nick_name?: string;
  short_description?: string;
  description?: string;
  is_active: boolean;
  category: { id: number; name: string; slug: string };
  images?: { id: number; url: string; thumb?: string }[];
  thumbnail_url?: string;
  price: number;
  discount_price?: number | null;
  formatted_price?: string;
  in_wishlist?: boolean;
  created_at: string;
  updated_at: string;
  rating?: number;
  review_count?: number;
  inventory?: {
    id: number;
    stock_quantity: number;
    is_instock: boolean;
    has_variants: boolean;
  } | null;
};

type Meta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

type ProductsApiSuccess = {
  success: true;
  message: string;
  data: {
    products: Product[];
    meta: Meta;
  };
};

type ProductsApiError = { success: false; message: string };
type ProductsApiResponse = ProductsApiSuccess | ProductsApiError;

const mockCategories = [
  { id: 1, name: "Fertilizers", slug: "fertilizers" },
  { id: 2, name: "Seeds", slug: "seeds" },
  { id: 3, name: "Tools", slug: "tools" },
  { id: 4, name: "Organic Products", slug: "organic" },
  { id: 5, name: "Plant Care", slug: "plant-care" },
];

function useDebouncedValue<T>( value: T, delay = 400 ) {
  const [ debouncedValue, setDebouncedValue ] = useState( value );

  useEffect( () => {
    const handler = setTimeout( () => setDebouncedValue( value ), delay );
    return () => clearTimeout( handler );
  }, [ value, delay ] );

  return debouncedValue;
}

function buildQuery( params: ProductParams ) {
  const query = new URLSearchParams();

  if ( params.search ) query.set( "search", params.search );
  if ( params.category_id ) query.set( "category_id", String( params.category_id ) );
  if ( typeof params.in_stock !== "undefined" ) query.set( "in_stock", params.in_stock ? "1" : "0" );
  if ( params.min_price != null ) query.set( "min_price", String( params.min_price ) );
  if ( params.max_price != null ) query.set( "max_price", String( params.max_price ) );
  if ( params.is_featured != null ) query.set( "is_featured", params.is_featured ? "1" : "0" );
  if ( params.sort_by ) query.set( "sort_by", params.sort_by );
  if ( params.sort_order ) query.set( "sort_order", params.sort_order );

  query.set( "per_page", String( params.per_page ?? 15 ) );
  query.set( "page", String( params.page ?? 1 ) );

  return query.toString();
}

function RatingStars( { rating = 0, count = 0 }: { rating?: number; count?: number } ) {
  const fullStars = Math.floor( rating );
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1">
      { Array.from( { length: 5 } ).map( ( _, index ) => {
        const isFull = index < fullStars;
        const isHalf = index === fullStars && hasHalfStar;

        return (
          <Star
            key={ index }
            className={ `h-4 w-4 ${ isFull || isHalf
                ? "fill-yellow-500 stroke-yellow-500"
                : "stroke-muted-foreground"
              }` }
          />
        );
      } ) }
      <span className="text-xs text-muted-foreground">{ count }</span>
    </div>
  );
}

function ProductCard( { product }: { product: Product } ) {
  const price = product.discount_price && product.discount_price < product.price
    ? product.discount_price
    : product.price;

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round( ( ( product.price - product.discount_price ) / product.price ) * 100 )
    : 0;

  const imageUrl = product.thumbnail_url || product.images?.[ 0 ]?.url || "";
  const hasVariants = product.inventory?.has_variants;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <div className="relative h-48 bg-muted/50 overflow-hidden">
        <Link href={ `/store/products/${ product.id }` } className="block h-full w-full">
          <Image
            src={ imageUrl }
            alt={ product.name }
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        { discountPercent > 0 && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
            { discountPercent }% OFF
          </Badge>
        ) }
      </div>

      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          { product.category?.name }
        </div>

        <Link href={ `/store/products/${ product.id }` } className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-semibold line-clamp-2 hover:text-primary transition-colors">
              { product.name }
            </h3>
          </div>
          <RatingStars rating={ product.rating } count={ product.review_count } />

          { product.short_description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              { product.short_description }
            </p>
          ) }
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold">₹{ price }</span>
          { hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{ product.price }
            </span>
          ) }
        </div>

        { hasVariants && (
          <Badge variant="secondary" className="w-fit text-xs">
            Multiple options available
          </Badge>
        ) }

        <Link href={ `/store/products/${ product.id }` } className="block mt-auto">
          <Button className="w-full">View Product</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

function ProductFilters( {
  filters,
  onFiltersChange,
  categories = mockCategories,
}: {
  filters: ProductParams;
  onFiltersChange: ( filters: ProductParams ) => void;
  categories?: Array<{ id: number; name: string; slug: string }>;
} ) {
  const [ open, setOpen ] = useState( false );
  const [ localFilters, setLocalFilters ] = useState<ProductParams>( filters );
  const debouncedSearch = useDebouncedValue( localFilters.search ?? "" );
  const appliedOnce = useRef( false );

  const activeFilterCount = Object.keys( localFilters ).filter(
    key => key !== "page" && ( localFilters as any )[ key ] !== undefined
  ).length;

  useEffect( () => {
    if ( !appliedOnce.current ) return;
    onFiltersChange( { ...localFilters, search: debouncedSearch } );
  }, [ debouncedSearch ] );

  const updateFilter = ( key: keyof ProductParams, value: any ) => {
    setLocalFilters( prev => ( { ...prev, [ key ]: value } ) );
  };

  const applyFilters = () => {
    appliedOnce.current = true;
    onFiltersChange( localFilters );
    setOpen( false );
  };

  const clearFilters = () => {
    const resetFilters: ProductParams = {
      page: 1,
      per_page: filters.per_page,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    };
    setLocalFilters( resetFilters );
    onFiltersChange( resetFilters );
    setOpen( false );
  };

  const filterContent = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="search">Search Products</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by name, botanical name, or nickname"
            value={ localFilters.search || "" }
            onChange={ ( e ) => updateFilter( "search", e.target.value ) }
            className="pl-10"
          />
        </div>
      </div>

      <Separator />

      { categories.length > 0 && (
        <>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={ localFilters.category_id?.toString() || "all" }
              onValueChange={ ( value ) =>
                updateFilter( "category_id", value === "all" ? undefined : parseInt( value ) )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                { categories.map( ( category ) => (
                  <SelectItem key={ category.id } value={ category.id.toString() }>
                    { category.name }
                  </SelectItem>
                ) ) }
              </SelectContent>
            </Select>
          </div>
          <Separator />
        </>
      ) }

      <div className="space-y-2">
        <Label>Availability</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={ localFilters.in_stock === true }
            onCheckedChange={ ( checked ) =>
              updateFilter( "in_stock", checked ? true : undefined )
            }
          />
          <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
            In Stock Only
          </Label>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>Sort By</Label>
        <Select
          value={ localFilters.sort_by || "name" }
          onValueChange={ ( value: any ) => updateFilter( "sort_by", value ) }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="created_at">Date Created</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={ localFilters.sort_order || "asc" }
          onValueChange={ ( value: any ) => updateFilter( "sort_order", value ) }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 pt-4">
        <Button onClick={ applyFilters } className="w-full">
          Apply Filters
        </Button>
        { activeFilterCount > 0 && (
          <Button onClick={ clearFilters } variant="outline" className="w-full">
            Clear All Filters
          </Button>
        ) }
      </div>
    </div>
  );

  return (
    <Sheet open={ open } onOpenChange={ setOpen }>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          { activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              { activeFilterCount }
            </Badge>
          ) }
        </Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            <div className="flex items-center gap-2">
              { activeFilterCount > 0 && (
                <Badge variant="secondary">{ activeFilterCount }</Badge>
              ) }
              <Button
                variant="ghost"
                size="sm"
                onClick={ () => setOpen( false ) }
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          { filterContent }
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Pagination( {
  meta,
  onChange,
  disabled = false,
}: {
  meta: Meta;
  onChange: ( page: number ) => void;
  disabled?: boolean;
} ) {
  const { current_page, last_page } = meta;

  const goToPage = ( page: number ) => {
    onChange( Math.max( 1, Math.min( last_page, page ) ) );
  };

  const pageNumbers = useMemo( () => {
    const numbers = new Set<number>();
    numbers.add( 1 );
    numbers.add( last_page );

    for ( let i = current_page - 2; i <= current_page + 2; i++ ) {
      if ( i >= 1 && i <= last_page ) {
        numbers.add( i );
      }
    }

    return Array.from( numbers ).sort( ( a, b ) => a - b );
  }, [ current_page, last_page ] );

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={ () => goToPage( current_page - 1 ) }
        disabled={ current_page === 1 || disabled }
      >
        Previous
      </Button>

      { pageNumbers.map( ( page, index, array ) => {
        const showEllipsis = index > 0 && page - array[ index - 1 ] > 1;

        return (
          <div key={ page } className="flex items-center gap-1">
            { showEllipsis && (
              <span className="px-2 text-sm text-muted-foreground">...</span>
            ) }
            <Button
              size="sm"
              variant={ page === current_page ? "default" : "outline" }
              onClick={ () => goToPage( page ) }
              disabled={ disabled }
            >
              { page }
            </Button>
          </div>
        );
      } ) }

      <Button
        variant="outline"
        size="sm"
        onClick={ () => goToPage( current_page + 1 ) }
        disabled={ current_page === last_page || disabled }
      >
        Next
      </Button>
    </div>
  );
}

function ProductsGrid( {
  products,
  isLoading,
  currentPage
}: {
  products: Product[];
  isLoading: boolean;
  currentPage: number;
} ) {
  if ( isLoading && currentPage === 1 ) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        { Array.from( { length: 12 } ).map( ( _, index ) => (
          <ProductCardSkeleton key={ index } />
        ) ) }
      </div>
    );
  }

  if ( products.length === 0 && !isLoading ) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-2">
          No products found matching your criteria.
        </p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        { products.map( ( product ) => (
          <ProductCard key={ product.id } product={ product } />
        ) ) }
      </div>

      { isLoading && currentPage > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          { Array.from( { length: 3 } ).map( ( _, index ) => (
            <ProductCardSkeleton key={ index } />
          ) ) }
        </div>
      ) }
    </>
  );
}

function ProductsHeader( {
  meta,
  filters,
  onPerPageChange
}: {
  meta: Meta;
  filters: ProductParams;
  onPerPageChange: ( value: string ) => void;
} ) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <ProductFilters
        filters={ filters }
        onFiltersChange={ () => { } }
      />

      <div className="text-sm text-muted-foreground">
        { meta.total > 0 ? (
          <>Showing { meta.from } to { meta.to } of { meta.total } products</>
        ) : (
          "No products found"
        ) }
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="per-page" className="text-sm text-muted-foreground whitespace-nowrap">
          Per page:
        </Label>
        <Select
          value={ ( filters.per_page ?? 15 ).toString() }
          onValueChange={ onPerPageChange }
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="48">48</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [ products, setProducts ] = useState<Product[]>( [] );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ error, setError ] = useState<string | null>( null );
  const [ filters, setFilters ] = useState<ProductParams>( {
    page: 1,
    per_page: 15,
    sort_by: "name",
    sort_order: "asc",
  } );

  const [ meta, setMeta ] = useState<Meta>( {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  } );

  const fetchProducts = useCallback( async ( signal?: AbortSignal ) => {
    setIsLoading( true );
    setError( null );

    try {
      const queryString = buildQuery( filters );
      const response = await fetch(
        `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/products?${ queryString }`,
        { signal, headers: { Accept: "application/json" } }
      );

      const data: ProductsApiResponse = await response.json();

      if ( !data.success ) {
        throw new Error( data.message || "Failed to fetch products" );
      }

      setProducts( data.data.products );
      setMeta( data.data.meta );
    } catch ( err: any ) {
      if ( err?.name === "AbortError" ) return;
      setError( err?.message || "Failed to load products" );
    } finally {
      setIsLoading( false );
    }
  }, [ filters ] );

  useEffect( () => {
    const controller = new AbortController();
    fetchProducts( controller.signal );

    return () => controller.abort();
  }, [ fetchProducts ] );

  const handleFiltersChange = ( newFilters: ProductParams ) => {
    setFilters( { ...newFilters, page: 1 } );
  };

  const handlePageChange = ( page: number ) => {
    setFilters( prev => ( { ...prev, page } ) );
  };

  const handlePerPageChange = ( perPage: string ) => {
    setFilters( prev => ( { ...prev, per_page: parseInt( perPage ), page: 1 } ) );
  };

  if ( error ) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load products. Please try again later.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Button onClick={ () => fetchProducts() }>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <ProductsHeader
          meta={ meta }
          filters={ filters }
          onPerPageChange={ handlePerPageChange }
        />

        <ProductsGrid
          products={ products }
          isLoading={ isLoading }
          currentPage={ filters.page || 1 }
        />

        { meta.last_page > 1 && (
          <div className="mt-8">
            <Pagination
              meta={ meta }
              onChange={ handlePageChange }
              disabled={ isLoading }
            />
          </div>
        ) }
      </div>
    </div>
  );
}