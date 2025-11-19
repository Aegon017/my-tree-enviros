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
import { Textarea } from "@/components/ui/textarea";
import { productService } from "@/services/product.service";
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
  const { data: product, error, isLoading, mutate } = useSWR( [ "product", slug ], () => productService.getProductBySlug( slug ), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  } );

  const productState = useProductState( product );
  const { images, currentImage } = useProductImages( product, productState.selectedVariant );
  const { availableColors, availableSizes, availablePlanters } = useProductVariants( {
    product,
    selectedColor: productState.selectedColor,
    selectedSize: productState.selectedSize,
    selectedPlanter: productState.selectedPlanter,
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

  const { toggleFavorite, loading: wishlistLoading, loginOpen, setLoginOpen } = useProductWishlist(
    product?.id,
    productState.selectedVariant?.id,
    mutate
  );

  if ( error )
    console.log(error);
    
    return (
      <div className="flex justify-center items-center h-96">
        <Card className="w-full max-w-md text-center p-6">
          <h2 className="text-xl font-bold text-destructive mb-3">Error loading product</h2>
          <Button onClick={ () => window.location.reload() }>Retry</Button>
        </Card>
      </div>
    );

  if ( isLoading || !product )
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="aspect-square rounded-2xl" />
      </div>
    );

  const variantId = productState.selectedVariant?.id;
  const inWishlist = productState.selectedVariant?.in_wishlist ?? false;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            selectedColor={ productState.selectedColor }
            selectedSize={ productState.selectedSize }
            selectedPlanter={ productState.selectedPlanter }
            onColorSelect={ productState.setColor }
            onSizeSelect={ productState.setSize }
            onPlanterSelect={ productState.setPlanter }
          />

          { productState.isInStock && (
            <div className="flex gap-4 items-center">
              <div className="flex border rounded-md items-center">
                <Button variant="ghost" size="icon" onClick={ () => productState.setQuantity( Math.max( 1, productState.quantity - 1 ) ) } disabled={ productState.quantity <= 1 }>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input type="number" value={ productState.quantity } onChange={ ( e ) => productState.setQuantity( Math.max( 1, Math.min( +e.target.value || 1, productState.maxStock ) ) ) } className="w-16 text-center border-0" />
                <Button variant="ghost" size="icon" onClick={ () => productState.setQuantity( Math.min( productState.quantity + 1, productState.maxStock ) ) } disabled={ productState.quantity >= productState.maxStock }>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2 items-baseline">
                <span className="text-3xl font-bold">₹{ productState.displayPrice }</span>
                { productState.displayBasePrice && <span className="line-through text-muted-foreground">₹{ productState.displayBasePrice }</span> }
              </div>
            </div>
          ) }

          { productState.selectedVariant && (
            <div className="bg-muted/50 p-4 rounded-md border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">{ productState.selectedVariant.variant?.name || "Default Variant" }</h4>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    { productState.selectedVariant.variant?.color && (
                      <div className="w-4 h-4 rounded-full border border-border" style={ { backgroundColor: productState.selectedVariant.variant.color.code || "transparent" } } title={ productState.selectedVariant.variant.color.name } />
                    ) }

                    { productState.selectedVariant.variant?.size?.name && <span className="px-2 py-0.5 rounded-md bg-background border text-xs font-medium">{ productState.selectedVariant.variant.size.name }</span> }

                    { productState.selectedVariant.variant?.planter?.name && <span className="text-xs font-medium text-foreground">{ productState.selectedVariant.variant.planter.name }</span> }

                    { !productState.selectedVariant.variant?.color && !productState.selectedVariant.variant?.size && !productState.selectedVariant.variant?.planter && (
                      <span className="px-2 py-0.5 rounded-md border border-dashed text-muted-foreground text-xs bg-background/60">Standard Variant</span>
                    ) }
                  </div>
                </div>

                <div className={ `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border ${ productState.selectedVariant.is_instock ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20" }` }>
                  <div className={ `w-2 h-2 rounded-full ${ productState.selectedVariant.is_instock ? "bg-primary" : "bg-destructive" }` } />
                  { productState.selectedVariant.is_instock ? <span>In Stock ({ productState.selectedVariant.stock_quantity })</span> : <span>Out of Stock</span> }
                </div>
              </div>
            </div>
          ) }

          <div className="flex gap-3">
            <AddToCartButton type="product" quantity={ productState.quantity } variantId={ productState.selectedVariant?.id } />
            <Button
              variant="outline"
              size="lg"
              onClick={ () => {
                if ( !variantId ) return setLoginOpen( true );
                toggleFavorite( inWishlist );
              } }
              disabled={ wishlistLoading || !productState.selectedVariant?.id }
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
                <Markup className="prose max-w-none dark:prose-invert" content={ product.description } />
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
                        <h1>jgk</h1>
                          // <ReviewForm review={ r } onCancel={ () => setEditingReviewId( null ) } onSubmit={ submitReview } isSubmitting={ isSubmitting } />
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <div className="flex gap-2 items-center">
                                <RatingStars rating={ r.rating } size="sm" />
                                <span className="font-semibold">{ r.user.name }</span>
                              </div>
                              <span className="text-sm text-muted-foreground">{ new Date( r.created_at ).toLocaleDateString() }</span>
                            </div>
                            <p className="mt-2">{ r.review }</p>
                            { r.id === userReview?.id && (
                              <Button variant="ghost" size="sm" className="mt-2" onClick={ () => setEditingReviewId( r.id ) }>
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
                    <h1>jghlk</h1>
                    {/* <ReviewForm onCancel={ () => { } } onSubmit={ submitReview } isSubmitting={ isSubmitting } /> */}
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