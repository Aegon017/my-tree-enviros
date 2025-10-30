"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Markup } from "interweave";
import { Edit, Heart, Minus, Plus, Star } from "lucide-react";
import Image from "next/image";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import RatingStars from "@/components/rating-stars";
import AddToCartButton from "@/components/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lens } from "@/components/ui/lens";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authStorage } from "@/lib/auth-storage";
import { ProductType } from "@/enums/product.enum";
import { CheckoutType } from "@/enums/checkout.enum";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review.type";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import api from "@/lib/axios";

const fetcher = async (url: string) => {
  const { data } = await api.get(url);
  return data;
};

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required.").max(5),
  review: z.string().min(1, "Review text is required."),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    product: Product;
  };
}

interface CanReviewResponse {
  status: boolean;
  message: string;
  data: {
    can_review: boolean;
    reviewed: boolean;
    review: Review | null;
  };
}

interface ReviewsResponse {
  data: {
    data: Review[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: Props) {
  const { id } = use(params);
  const isAuth = authStorage.isAuthenticated();
  const [quantity, setQuantity] = useState(1);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  const productUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products/${id}`;
  const { data: response, error, isLoading } = useSWR<ApiResponse>(productUrl, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const canReviewUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/product/${id}/can-review`;
  const { data: canReviewData, mutate: mutateCanReview } = useSWR<CanReviewResponse>(isAuth ? canReviewUrl : null, fetcher);

  const reviewsUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/product/${id}/reviews?page=${currentPage}`;
  const { data: reviewsData, mutate: mutateReviews } = useSWR<ReviewsResponse>(reviewsUrl, fetcher);

  const product = response?.data?.product;
  const productImage = product?.main_image_url ?? "/placeholder.jpg";
  const reviews = reviewsData?.data?.data || [];
  const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const reviewCount = reviews.length || 0;

  const userReview = canReviewData?.data?.review;
  const canReview = canReviewData?.data?.can_review;
  const hasReviewed = canReviewData?.data?.reviewed;

  useEffect(() => {
    if (product) setIsFavorite(product.wishlist_tag ?? false);
  }, [product]);

  const handleQuantityChange = useCallback(
    (value: number | string) => {
      const numValue = typeof value === "string" ? parseInt(value, 10) : value;
      if (product && !isNaN(numValue) && numValue >= 1 && numValue <= product.quantity) {
        setQuantity(numValue);
      } else if (product && numValue > product.quantity) {
        setQuantity(product.quantity);
      }
    },
    [product],
  );

  const handleToggleFavorite = async () => {
    if (!isAuth) {
      toast.error("Please login to manage your wishlist");
      return;
    }
    setIsWishlistLoading(true);
    const newStatus = !isFavorite;
    try {
      const { wishlistService } = await import("@/services/wishlist.service");
      await wishlistService.toggleWishlist(Number(id));
      setIsFavorite(newStatus);
      toast.success(newStatus ? `Added ${product?.name} to wishlist` : `Removed ${product?.name} from wishlist`);
    } catch (err) {
      toast.error(`Failed to update wishlist - ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewId: number | null, values: ReviewFormValues) => {
    if (!isAuth) return;
    setIsSubmittingReview(true);
    try {
      await api.request({
        url: `/product-reviews${reviewId ? `/${reviewId}` : ""}`,
        method: reviewId ? "PUT" : "POST",
        data: {
          product_id: Number(id),
          ...values,
        },
      });
      toast.success(reviewId ? "Review updated successfully" : "Review added successfully");
      setEditingReviewId(null);
      mutateCanReview();
      mutateReviews();
    } catch (error) {
      toast.error(`Failed to ${reviewId ? "update" : "submit"} review - ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const ReviewForm = ({ review, onCancel }: { review?: Review; onCancel: () => void; }) => {
    const form = useForm<ReviewFormValues>({
      resolver: zodResolver(reviewSchema),
      defaultValues: {
        rating: review?.rating || 0,
        review: review?.review || "",
      },
    });

    const onSubmit = (values: ReviewFormValues) => {
      handleReviewSubmit(review?.id || null, values);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 p-4 border rounded-lg bg-muted/20 space-y-4">
          <h4 className="text-lg font-semibold">
            {review ? "Edit Your Review" : "Add a Review"}
          </h4>
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
                                key={`star-${i}`}
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
                  <Textarea placeholder="Write your review..." className="min-h-32" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmittingReview}>
              {isSubmittingReview ? (
                <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-accent-foreground" />Submitting...</>
              ) : review ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmittingReview}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-96 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Product</h2>
            <p className="text-muted-foreground">
              {error.message.includes("Failed to fetch") ? "Network error. Please check your connection." : "Sorry, we couldn't load the product details."}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4 lg:sticky top-16 self-start">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : (
            <>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Lens zoomFactor={2}>
                  <Image
                    src={productImage}
                    alt={product?.name ?? "Product"}
                    height={600}
                    width={600}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                </Lens>
              </div>
              <div className="flex justify-center">
                <div className="relative h-20 w-20 border rounded-md overflow-hidden">
                  <Image
                    src={productImage}
                    alt={`${product?.name ?? "Product"} thumbnail`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    priority
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="space-y-6">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </>
          ) : product ? (
            <>
              <div>
                <Badge variant="outline" className="mb-2">{product.category.name}</Badge>
                <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                <p className="text-muted-foreground italic mt-1">{product.nick_name}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Botanical Name</h3>
                <p className="text-muted-foreground">{product.botanical_name}</p>
              </div>

              <RatingStars rating={averageRating} size="md" showCount reviewCount={reviewCount} />
              <div className="flex items-center gap-2">
                {product.quantity > 0 ? (
                  <><div className="h-2 w-2 bg-green-500 rounded-full" /> <span className="text-green-500">In Stock</span></>
                ) : (
                  <span className="text-destructive">Out of Stock</span>
                )}
              </div>
              {product.quantity > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= product.quantity}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">{product.quantity} available</span>
                  <div className="flex items-baseline gap-2">
                    {product?.discount_price && product.discount_price < product.price ? (
                      <>
                        <span className="text-3xl font-bold text-foreground">₹{product.discount_price}</span>
                        <span className="text-lg text-muted-foreground line-through ml-2">₹{product.price}</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-foreground">₹{product?.price}</span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <AddToCartButton
                  productId={Number(id)}
                  quantity={quantity}
                  productType={ProductType.ECOMMERCE}
                  cartType={CheckoutType.CART}
                  disabled={!product || product.quantity === 0}
                  productName={product.name}
                  productPrice={product.discount_price || product.price}
                  productImage={productImage}
                />
                <Button variant="outline" size="lg" onClick={handleToggleFavorite} disabled={isWishlistLoading}>
                  <Heart className={`mr-2 h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "In Wishlist" : "Wishlist"}
                </Button>
              </div>
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-semibold">Category:</span> {product.category.name}</div>
                  <div><span className="font-semibold">Type:</span> {product.type === 1 ? "Physical" : "Digital"}</div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      {!isLoading && product && (
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="additional">Additional Info</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-4">
              <Card><CardContent><Markup content={product.description} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="additional" className="pt-4">
              <Card>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Botanical Name</h4>
                      <p className="text-muted-foreground">{product.botanical_name}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Category</h4>
                      <p className="text-muted-foreground">{product.category.name}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Type</h4>
                      <p className="text-muted-foreground">{product.type === 1 ? "Physical" : "Digital"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="pt-4">
              <Card>
                <CardContent>
                  {reviewsData?.data.data?.length ? (
                    <div className="space-y-6">
                      {reviewsData.data.data.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                          {editingReviewId === review.id ? (
                            <ReviewForm review={review} onCancel={() => setEditingReviewId(null)} />
                          ) : (
                            <>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <RatingStars rating={review.rating} size="sm" />
                                  <span className="font-semibold">{review.user.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="mt-2">{review.review}</p>
                              {review.id === userReview?.id && (
                                <Button variant="ghost" size="sm" onClick={() => setEditingReviewId(review.id)} className="mt-2">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
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
                      <ReviewForm onCancel={() => {}} />
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
