"use client";

import { Markup } from "interweave";
import { Check, Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import AppLayout from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lens } from "@/components/ui/lens";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { storage } from "@/lib/storage";
import type { Product } from "@/types/product";

interface ApiResponse {
  data: Product;
}

interface Props {
  params: Promise<{ id: string }>;
}

const fetcher = async ( url: string, token: string | null ) => {
  const response = await fetch( url, {
    headers: {
      Authorization: `Bearer ${ token }`,
      "Content-Type": "application/json",
    },
  } );
  if ( !response.ok ) throw new Error( "Failed to fetch product" );
  return response.json() as Promise<ApiResponse>;
};

export default function ProductPage( { params }: Props ) {
  const { id } = use( params );
  const token = storage.getToken();
  const [ quantity, setQuantity ] = useState( 1 );
  const [ isAddingToCart, setIsAddingToCart ] = useState( false );
  const [ isWishlistLoading, setIsWishlistLoading ] = useState( false );
  const [ isFavorite, setIsFavorite ] = useState( false );

  const { data: response, error, isLoading } = useSWR(
    token ? [ `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/product/${ id }`, token ] : null,
    ( [ url, token ] ) => fetcher( url, token ),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const product = response?.data;
  const productImage = product?.main_image_url ?? "/placeholder.jpg";
  const averageRating = product?.reviews?.length
    ? product.reviews.reduce( ( sum, r ) => sum + r.rating, 0 ) / product.reviews.length
    : 0;

  useEffect( () => {
    if ( product ) setIsFavorite( product.wishlist_tag ?? false );
  }, [ product ] );

  const handleQuantityChange = ( value: number ) => {
    if ( product && value >= 1 && value <= product.quantity ) {
      setQuantity( value );
    }
  };

  const handleToggleFavorite = async () => {
    if ( !token ) {
      toast.error( "Please login to manage your wishlist" );
      return;
    }

    setIsWishlistLoading( true );
    const newStatus = !isFavorite;

    try {
      const response = await fetch(
        `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/wishlist/${ newStatus ? "add" : "remove" }/${ id }`,
        {
          method: newStatus ? "POST" : "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${ token }`,
          },
        }
      );

      if ( !response.ok ) throw new Error( "Network error" );

      setIsFavorite( newStatus );
      toast.success( newStatus ? `Added ${ product?.name } to wishlist` : `Removed ${ product?.name } from wishlist` );
    } catch ( err ) {
      toast.error( `Failed to update wishlist - ${ err instanceof Error ? err.message : "Unknown error" }` );
    } finally {
      setIsWishlistLoading( false );
    }
  };

  const handleAddToCart = async () => {
    if ( !token ) {
      toast.error( "Please login to add items to cart" );
      return;
    }

    if ( !product || product.quantity === 0 ) return;

    setIsAddingToCart( true );

    try {
      const response = await fetch(
        `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/cart/add/${ id }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${ token }`,
          },
          body: JSON.stringify( {
            quantity,
            type: product.type,
            product_type: 2,
            cart_type: 1,
          } ),
        }
      );

      const result = await response.json();

      if ( result.status ) {
        toast.success( `${ product.name } added to cart` );
      } else {
        throw new Error( result.message || "Failed to add to cart" );
      }
    } catch ( err ) {
      toast.error( `Failed to add to cart - ${ err instanceof Error ? err.message : "Unknown error" }` );
    } finally {
      setIsAddingToCart( false );
    }
  };

  if ( error ) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-96 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Product</h2>
            <p className="text-muted-foreground">Sorry, we couldn't load the product details. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4 lg:sticky top-16 self-start">
            { isLoading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <Lens zoomFactor={ 2 }>
                    <Image
                      src={ productImage }
                      alt={ product?.name ?? "Product" }
                      height={ 1200 }
                      width={ 1200 }
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
                      priority
                    />
                  </Lens>
                </div>
                <div className="flex justify-center">
                  <div className="relative h-20 w-20 border rounded-md overflow-hidden">
                    <Image
                      src={ productImage }
                      alt={ `${ product?.name ?? "Product" } thumbnail` }
                      fill
                      className="object-cover"
                      sizes="80px"
                      priority
                    />
                  </div>
                </div>
              </>
            ) }
          </div>
          <div className="space-y-6">
            { isLoading ? (
              <>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </>
            ) : product ? (
              <>
                <div>
                  <Badge variant="outline" className="mb-2">{ product.category.name }</Badge>
                  <h1 className="text-3xl font-bold tracking-tight">{ product.name }</h1>
                  <p className="text-muted-foreground italic mt-1">{ product.nick_name }</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    { Array.from( { length: 5 }, ( _, i ) => (
                      <Star
                        key={ `${ product?.id ?? "star" }-${ i }` }
                        className={ `h-5 w-5 ${ i < Math.round( averageRating ) ? "fill-primary text-primary" : "text-muted"
                          }` }
                      />
                    ) ) }
                  </div>
                  <span className="text-sm text-muted-foreground">({ product.reviews?.length ?? 0 } reviews)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  { product?.discount_price && product.discount_price < product.price ? (
                    <>
                      <span className="text-3xl font-bold text-foreground">
                        ₹{ product.discount_price }
                      </span>
                      <span className="text-lg text-muted-foreground line-through ml-2">
                        ₹{ product.price }
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-foreground">
                      ₹{ product?.price }
                    </span>
                  ) }
                </div>
                <Markup content={ product.description } />
                <div>
                  <h3 className="font-semibold text-sm">Botanical Name</h3>
                  <p className="text-muted-foreground">{ product.botanical_name }</p>
                </div>
                <div className="flex items-center gap-2">
                  { product.quantity > 0 ? (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-green-500">In Stock</span>
                    </>
                  ) : (
                    <span className="text-destructive">Out of Stock</span>
                  ) }
                </div>
                { product.quantity > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={ () => handleQuantityChange( quantity - 1 ) }
                        disabled={ quantity <= 1 }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={ product.quantity }
                        value={ quantity }
                        onChange={ ( e ) => handleQuantityChange( Number( e.target.value ) ) }
                        className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={ () => handleQuantityChange( quantity + 1 ) }
                        disabled={ quantity >= product.quantity }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">{ product.quantity } available</span>
                  </div>
                ) }
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1"
                    disabled={ !product || product.quantity === 0 || isAddingToCart }
                    onClick={ handleAddToCart }
                  >
                    { isAddingToCart ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-accent-foreground" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </>
                    ) }
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={ handleToggleFavorite }
                    disabled={ isWishlistLoading }
                  >
                    <Heart className={ `mr-2 h-5 w-5 ${ isFavorite ? "fill-current" : "" }` } />
                    { isFavorite ? "In Wishlist" : "Wishlist" }
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Category:</span> { product.category.name }
                    </div>
                    <div>
                      <span className="font-semibold">Type:</span> { product.type === 1 ? "Physical" : "Digital" }
                    </div>
                  </div>
                </div>
              </>
            ) : null }
          </div>
        </div>
        { !isLoading && product && (
          <div className="mt-12">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="additional">Additional Info</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({ product.reviews?.length ?? 0 })</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <Markup content={ product.description } />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="additional" className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold">Botanical Name</h4>
                        <p className="text-muted-foreground">{ product.botanical_name }</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Category</h4>
                        <p className="text-muted-foreground">{ product.category.name }</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Type</h4>
                        <p className="text-muted-foreground">{ product.type === 1 ? "Physical" : "Digital" }</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reviews" className="pt-4">
                <Card>
                  <CardContent className="pt-6">
                    { product.reviews?.length ? (
                      <div className="space-y-6">
                        { product.reviews.map( ( review ) => (
                          <div key={ review.id } className="border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  { Array.from( { length: 5 }, ( _, i ) => (
                                    <Star
                                      key={ `${ review.id }-star-${ i }` }
                                      className={ `h-4 w-4 ${ i < review.rating ? "fill-primary text-primary" : "text-muted"
                                        }` }
                                    />
                                  ) ) }
                                </div>
                                <span className="font-semibold">User { review.user_id }</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                { new Date( review.created_at ).toLocaleDateString() }
                              </span>
                            </div>
                            <p className="mt-2">{ review.review }</p>
                          </div>
                        ) ) }
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No reviews yet.</p>
                    ) }
                    <div className="mt-8 pt-6 border-t">
                      <h4 className="text-lg font-semibold mb-4">Add a Review</h4>
                      <form className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span>Your Rating:</span>
                          <div className="flex">
                            { Array.from( { length: 5 }, ( _, i ) => (
                              <Star
                                key={ `star-${ Date.now() }-${ i }` }
                                className="h-5 w-5 text-muted cursor-pointer hover:text-primary"
                              />
                            ) ) }
                          </div>
                        </div>
                        <Textarea placeholder="Your review" className="min-h-32" />
                        <Button type="submit">Submit Review</Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) }
      </div>
    </AppLayout>
  );
}