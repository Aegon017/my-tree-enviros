"use client";

import { use } from "react";
import useSWR from "swr";
import { Markup } from "interweave";
import { Minus, Plus, Heart, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { productService } from "@/services/product.services";
import RatingStars from "@/components/rating-stars";
import AddToCartButton from "@/components/add-to-cart-button";
import ImageGallery from "@/components/image-gallery";
import { VariantSelector } from "@/components/variant-selector";
import { LoginDialog } from "@/components/login-dialog";
import { useProductState } from "@/hooks/use-product-state";
import { useProductImages } from "@/hooks/use-product-images";
import { useProductVariants } from "@/hooks/use-product-variants";
import { useProductReviews } from "@/hooks/use-product-reviews";
import { useProductWishlist } from "@/hooks/use-product-wishlist";

export default function ProductPage( { params }: { params: Promise<{ slug: string }> } ) {
  const { slug } = use( params );

  const { data: product, error, isLoading, mutate } = useSWR(
    [ "product", slug ],
    () => productService.getProductBySlug( slug ),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const productState = useProductState( product );
  const { images } = useProductImages( product, productState.selectedVariant );

  const { availableColors, availableSizes, availablePlanters } = useProductVariants( {
    product,
    selectedColor: productState.selectedColor ?? undefined,
    selectedSize: productState.selectedSize ?? undefined,
    selectedPlanter: productState.selectedPlanter ?? undefined,
    onVariantChange: productState.setVariant,
  } );

  const {
    reviews,
    userReview,
    canReview,
    hasReviewed,
    averageRating,
    reviewCount,
    editingReviewId,
    setEditingReviewId,
    isSubmitting,
    submitReview,
  } = useProductReviews( slug );

  const { toggleFavorite, loading: wishlistLoading, loginOpen, setLoginOpen } =
    useProductWishlist( product?.id, productState.selectedVariant?.id, mutate );

  if ( error ) {
    return (
      <div className="flex justify-center items-center h-96">
        <Card className="w-full max-w-md text-center p-6">
          <h2 className="text-xl font-bold text-destructive mb-3">
            Error loading product
          </h2>
          <Button onClick={ () => window.location.reload() }>Retry</Button>
        </Card>
      </div>
    );
  }

  if ( isLoading || !product ) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="aspect-square rounded-2xl" />
      </div>
    );
  }

  const variantId = productState.selectedVariant?.id;
  const inWishlist = productState.selectedVariant?.in_wishlist ?? false;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <ImageGallery images={ images.map( ( i ) => i.url ) } name={ product.name } />
        </div>

        <div className="space-y-6">
          <Badge variant="outline">{ product.category.name }</Badge>
          <h1 className="text-3xl font-bold">{ product.name }</h1>
          <p className="italic text-muted-foreground">{ product.nick_name }</p>
          <RatingStars rating={ averageRating } size="md" showCount reviewCount={ reviewCount } />

          <VariantSelector
            colors={ availableColors }
            sizes={ availableSizes }
            planters={ availablePlanters }
            selectedColor={ productState.selectedColor ?? undefined }
            selectedSize={ productState.selectedSize ?? undefined }
            selectedPlanter={ productState.selectedPlanter ?? undefined }
            onColorSelect={ productState.setColor }
            onSizeSelect={ productState.setSize }
            onPlanterSelect={ productState.setPlanter }
          />

          { productState.isInStock && (
            <div className="flex gap-4 items-center">
              <div className="flex border rounded-md items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ () => productState.setQuantity( Math.max( 1, productState.quantity - 1 ) ) }
                  disabled={ productState.quantity <= 1 }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={ productState.quantity }
                  onChange={ ( e ) =>
                    productState.setQuantity(
                      Math.max( 1, Math.min( +e.target.value || 1, productState.maxStock ) )
                    )
                  }
                  className="w-16 text-center border-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ () =>
                    productState.setQuantity(
                      Math.min( productState.quantity + 1, productState.maxStock )
                    )
                  }
                  disabled={ productState.quantity >= productState.maxStock }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2 items-baseline">
                <span className="text-3xl font-bold">₹{ productState.displayPrice }</span>
                { productState.displayBasePrice && (
                  <span className="line-through text-muted-foreground">
                    ₹{ productState.displayBasePrice }
                  </span>
                ) }
              </div>
            </div>
          ) }

          <div className="flex gap-3">
            <AddToCartButton
              type="product"
              quantity={ productState.quantity }
              variantId={ productState.selectedVariant?.id }
            />

            <Button
              variant="outline"
              size="lg"
              onClick={ () => {
                if ( !variantId ) return setLoginOpen( true );
                toggleFavorite( inWishlist );
              } }
              disabled={ wishlistLoading || !variantId }
            >
              <Heart className={ `mr-2 h-5 w-5 ${ inWishlist ? "fill-current text-red-500" : "" }` } />
              { inWishlist ? "In Wishlist" : "Wishlist" }
            </Button>

            <LoginDialog open={ loginOpen } onOpenChange={ setLoginOpen } />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({ reviewCount })</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-4">
            <Card>
              <CardContent>
                <Markup
                  content={ product.description }
                  className="prose max-w-none dark:prose-invert"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="pt-4">
            <Card>
              <CardContent>
                { reviews.length ? (
                  <div className="space-y-6">
                    { reviews.map( ( r: any ) => (
                      <div key={ r.id } className="border-b pb-4">
                        { editingReviewId === r.id ? (
                          <h1>editing</h1>
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <div className="flex gap-2 items-center">
                                <RatingStars rating={ r.rating } size="sm" />
                                <span className="font-semibold">{ r.user.name }</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                { new Date( r.created_at ).toLocaleDateString() }
                              </span>
                            </div>
                            <p className="mt-2">{ r.review }</p>
                            { r.id === userReview?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={ () => setEditingReviewId( r.id ) }
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                            ) }
                          </>
                        ) }
                      </div>
                    ) ) }
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet.</p>
                ) }

                { canReview && !hasReviewed && editingReviewId === null && (
                  <div className="mt-8">
                    <h1>add-review-form</h1>
                  </div>
                ) }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}