"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Markup } from "interweave";
import { Edit, Heart, Minus, Plus, Star } from "lucide-react";
import { use, useEffect, useState } from "react";
import useSWR from "swr";
import RatingStars from "@/components/rating-stars";
import AddToCartButton from "@/components/add-to-cart-button";
import { VariantSelector } from "@/components/variant-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ProductType } from "@/enums/product.enum";
import { CheckoutType } from "@/enums/checkout.enum";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { productService } from "@/services/product.service";
import ImageGallery from "@/components/image-gallery";
import { LoginDialog } from "@/components/login-dialog";
import { useProductWishlist } from "@/hooks/use-product-wishlist";
import { useProductState } from "@/hooks/use-product-state";
import { useProductImages } from "@/hooks/use-product-images";
import { useProductVariants } from "@/hooks/use-product-variants";
import { useProductReviews } from "@/hooks/use-product-reviews";
import type { ReviewFormValues } from "@/services/review.service";
import type { Review } from "@/types/review.type";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().min(1),
});

function ReviewForm({
  review,
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  review?: Review;
  onCancel: () => void;
  onSubmit: (reviewId: number | null, values: ReviewFormValues) => void;
  isSubmitting: boolean;
}) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: review?.rating || 0,
      review: review?.review || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => onSubmit(review?.id || null, v))} className="mt-4 p-4 border rounded-lg bg-muted/20 space-y-4">
        <h4 className="text-lg font-semibold">{review ? "Edit Your Review" : "Add a Review"}</h4>
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 cursor-pointer ${i < field.value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
                      onClick={() => field.onChange(i + 1)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea className="min-h-32" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : review ? "Update Review" : "Submit Review"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: product, error, isLoading, mutate: mutateProduct } = useSWR(
    ["product", slug],
    () => productService.getProductBySlug(slug),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const productState = useProductState(product);
  const { images, currentImage } = useProductImages(product, productState.selectedVariant);
  
  const { availableColors, availableSizes, availablePlanters } = useProductVariants({
    product,
    selectedColor: productState.selectedColor,
    selectedSize: productState.selectedSize,
    selectedPlanter: productState.selectedPlanter,
    onVariantChange: productState.setVariant,
  });

  const {
    reviews,
    userReview,
    canReview,
    hasReviewed,
    averageRating,
    reviewCount,
    editingReviewId,
    setEditingReviewId,
    isSubmitting: isSubmittingReview,
    submitReview,
  } = useProductReviews(slug);

  const [localWishlistState, setLocalWishlistState] = useState<Record<number, boolean>>({});
  
  const { loading: isWishlistLoading, toggleFavorite, loginOpen, setLoginOpen } = useProductWishlist(
    product?.id,
    productState.selectedVariant?.id,
    mutateProduct
  );

  useEffect(() => {
    if (product?.default_variant && !productState.selectedVariant && !productState.isUserInteracting) {
      productState.initialize({
        selectedVariant: product.default_variant,
        selectedColor: product.default_variant?.variant?.color,
        selectedSize: product.default_variant?.variant?.size,
        selectedPlanter: product.default_variant?.variant?.planter,
      });
    }
  }, [product, productState]);

  const handleQuantityChange = (v: number) => {
    productState.setQuantity(Math.max(1, Math.min(v, productState.maxStock)));
  };

  const handleVariantSelect = (t: "color" | "size" | "planter", v: any) => {
    if (t === "size") {
      productState.setSize(v);
      if (productState.selectedPlanter && !product?.variants?.some((x) => x.variant.size?.id === v.id && x.variant.planter?.id === productState.selectedPlanter?.id)) {
        productState.setPlanter(undefined);
      }
      if (productState.selectedColor && !product?.variants?.some((x) => x.variant.size?.id === v.id && x.variant.color?.id === productState.selectedColor?.id)) {
        productState.setColor(undefined);
      }
    } else if (t === "planter") {
      productState.setPlanter(v);
    } else if (t === "color") {
      productState.setColor(v);
    }
  };

  const variantId = productState.selectedVariant?.id;
  const currentInWishlist = variantId && localWishlistState[variantId] !== undefined 
    ? localWishlistState[variantId] 
    : productState.selectedVariant?.in_wishlist ?? false;

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Product</h2>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 lg:sticky top-24 self-start">
          {isLoading ? (
            <Skeleton className="aspect-square rounded-2xl" />
          ) : product ? (
            <ImageGallery images={images.map((img) => img.url)} name={product.name} />
          ) : null}
        </div>
        <div className="space-y-6">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </>
          ) : product ? (
            <>
              <Badge variant="outline">{product.category.name}</Badge>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="italic text-muted-foreground">{product.nick_name}</p>
              <RatingStars rating={averageRating} size="md" showCount reviewCount={reviewCount} />

              {product.has_variants && (
                <div className="space-y-6 border-b pb-8">
                  <VariantSelector
                    colors={availableColors}
                    sizes={availableSizes}
                    planters={availablePlanters}
                    selectedColor={productState.selectedColor}
                    selectedSize={productState.selectedSize}
                    selectedPlanter={productState.selectedPlanter}
                    onColorSelect={(v) => handleVariantSelect("color", v)}
                    onSizeSelect={(v) => handleVariantSelect("size", v)}
                    onPlanterSelect={(v) => handleVariantSelect("planter", v)}
                  />

                  {productState.selectedVariant && (
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      <div className="font-medium mb-1">{productState.selectedVariant.variant_name}</div>
                      {productState.selectedVariant.is_instock ? `In Stock (${productState.selectedVariant.stock_quantity})` : "Out of Stock"}
                    </div>
                  )}
                </div>
              )}

              {(!product.has_variants || !productState.selectedVariant) && (
                <div className="text-sm">{product.inventory?.is_instock ? "In Stock" : "Out of Stock"}</div>
              )}

              {productState.isInStock && (
                <div className="flex gap-4 items-center">
                  <div className="flex border rounded-md items-center">
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(productState.quantity - 1)} disabled={productState.quantity <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input type="number" value={productState.quantity} onChange={(e) => handleQuantityChange(+e.target.value)} className="w-16 text-center border-0" />
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(productState.quantity + 1)} disabled={productState.quantity >= productState.maxStock}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-sm">{productState.maxStock} available</div>

                  <div className="flex gap-2 items-baseline">
                    <span className="text-3xl font-bold">₹{productState.displayPrice}</span>
                    {productState.displayBasePrice && productState.displayBasePrice > productState.displayPrice && (
                      <span className="line-through text-muted-foreground">₹{productState.displayBasePrice}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <AddToCartButton
                  productId={product.id}
                  quantity={productState.quantity}
                  productType={ProductType.ECOMMERCE}
                  cartType={CheckoutType.CART}
                  disabled={!product || (product.has_variants && !productState.selectedVariant) || (product.has_variants && !productState.selectedVariant?.is_instock) || (!product.has_variants && !product.inventory?.is_instock)}
                  productName={product.name}
                  productPrice={productState.displayPrice}
                  productImage={currentImage}
                  selectedVariantId={productState.selectedVariant?.id}
                  selectedVariant={productState.selectedVariant}
                  product={product}
                  onProductUpdate={mutateProduct}
                />

                <Button variant="outline" size="lg" onClick={() => {
                  const newState = !currentInWishlist;
                  if (variantId) {
                    setLocalWishlistState(prev => ({ ...prev, [variantId]: newState }));
                  }
                  toggleFavorite(currentInWishlist);
                }} disabled={isWishlistLoading || !productState.selectedVariant?.id}>
                  <Heart className={`mr-2 h-5 w-5 ${currentInWishlist ? "fill-current text-red-500" : ""}`} />
                  {currentInWishlist ? "In Wishlist" : "Wishlist"}
                </Button>
                <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
              </div>
            </>
          ) : null}
        </div>
      </div>

      {!isLoading && product && (
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="pt-4">
              <Card>
                <CardContent>
                  <Markup content={product.description} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="pt-4">
              <Card>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((r: any) => (
                        <div key={r.id} className="border-b pb-4">
                          {editingReviewId === r.id ? (
                            <ReviewForm review={r} onCancel={() => setEditingReviewId(null)} onSubmit={submitReview} isSubmitting={isSubmittingReview} />
                          ) : (
                            <>
                              <div className="flex justify-between items-start">
                                <div className="flex gap-2 items-center">
                                  <RatingStars rating={r.rating} size="sm" />
                                  <span className="font-semibold">{r.user.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="mt-2">{r.review}</p>
                              {r.id === userReview?.id && (
                                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setEditingReviewId(r.id)}>
                                  <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No reviews yet.</p>
                  )}

                  {canReview && !hasReviewed && editingReviewId === null && (
                    <div className="mt-8">
                      <ReviewForm onCancel={() => {}} onSubmit={submitReview} isSubmitting={isSubmittingReview} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}