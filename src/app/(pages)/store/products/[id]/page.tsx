"use client";

import { Markup } from "interweave";
import { Check, Edit, Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import RatingStars from "@/components/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lens } from "@/components/ui/lens";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authStorage } from "@/lib/auth-storage";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review.type";

interface ApiResponse {
  data: Product;
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

const fetcher = async (url: string, token: string | null) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
};

export default function ProductPage({ params }: Props) {
  const { id } = use(params);
  const token = authStorage.getToken();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  const productUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/product/${id}`;
  const {
    data: response,
    error,
    isLoading,
  } = useSWR<ApiResponse>(
    [productUrl, token],
    ([url, token]) => fetcher(url, token),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const canReviewUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/product/${id}/can-review`;
  const { data: canReviewData, mutate: mutateCanReview } =
    useSWR<CanReviewResponse>(
      token ? [canReviewUrl, token] : null,
      ([url, token]) => fetcher(url, token),
    );

  const reviewsUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/product/${id}/reviews?page=${currentPage}`;
  const { data: reviewsData, mutate: mutateReviews } = useSWR<ReviewsResponse>(
    [reviewsUrl, token],
    ([url, token]) => fetcher(url, token),
  );

  const product = response?.data;
  const productImage = product?.main_image_url ?? "/placeholder.jpg";
  const reviews = reviewsData?.data?.data || [];
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
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

      if (
        product &&
        !isNaN(numValue) &&
        numValue >= 1 &&
        numValue <= product.quantity
      ) {
        setQuantity(numValue);
      } else if (product && numValue > product.quantity) {
        setQuantity(product.quantity);
      }
    },
    [product],
  );

  const handleToggleFavorite = async () => {
    if (!token) {
      toast.error("Please login to manage your wishlist");
      return;
    }

    setIsWishlistLoading(true);
    const newStatus = !isFavorite;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/wishlist/${newStatus ? "add" : "remove"}/${id}`,
        {
          method: newStatus ? "POST" : "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Network error");

      setIsFavorite(newStatus);
      toast.success(
        newStatus
          ? `Added ${product?.name} to wishlist`
          : `Removed ${product?.name} from wishlist`,
      );
    } catch (err) {
      toast.error(
        `Failed to update wishlist - ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }

    if (!product || product.quantity === 0) return;

    setIsAddingToCart(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cart/add/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity,
            type: product.type,
            product_type: 2,
            cart_type: 1,
          }),
        },
      );

      const result = await response.json();

      if (result.status) {
        toast.success(`${product.name} added to cart`);
      } else {
        throw new Error(result.message || "Failed to add to cart");
      }
    } catch (err) {
      toast.error(
        `Failed to add to cart - ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (
    reviewId: number | null,
    rating: number,
    reviewText: string,
  ) => {
    if (!token || !rating || !reviewText.trim()) return;

    setIsSubmittingReview(true);

    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/product/${id}/reviews`;
      const method = reviewId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: rating,
          review: reviewText.trim(),
        }),
      });

      const result = await response.json();

      if (result.status) {
        toast.success(
          reviewId
            ? "Review updated successfully"
            : "Review added successfully",
        );
        mutateCanReview();
        mutateReviews();
        setEditingReviewId(null);
      } else {
        throw new Error(result.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error(
        `Failed to submit review - ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const ReviewForm = ({
    review,
    onCancel,
  }: {
    review?: Review;
    onCancel: () => void;
  }) => {
    const [rating, setRating] = useState(review?.rating || 0);
    const [text, setText] = useState(review?.review || "");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleReviewSubmit(review?.id || null, rating, text);
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="mt-4 p-4 border rounded-lg bg-muted/20"
      >
        <h4 className="text-lg font-semibold mb-4">
          {review ? "Edit Your Review" : "Add a Review"}
        </h4>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span>Your Rating:</span>
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  type="button"
                  key={`star-${i}`}
                  className={`h-5 w-5 cursor-pointer ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
                  onClick={() => setRating(i + 1)}
                >
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <title>stars</title>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Your review"
            className="min-h-32"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmittingReview || !rating || !text.trim()}
            >
              {isSubmittingReview ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-accent-foreground" />
                  Submitting...
                </>
              ) : review ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmittingReview}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-96 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">
              Error Loading Product
            </h2>
            <p className="text-muted-foreground">
              {error.message.includes("Failed to fetch")
                ? "Network error. Please check your connection."
                : "Sorry, we couldn't load the product details."}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
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
                <Badge variant="outline" className="mb-2">
                  {product.category.name}
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight">
                  {product.name}
                </h1>
                <p className="text-muted-foreground italic mt-1">
                  {product.nick_name}
                </p>
              </div>

              <RatingStars
                rating={averageRating}
                size="md"
                showCount
                reviewCount={reviewCount}
              />

              <div className="flex items-baseline gap-2">
                {product?.discount_price &&
                product.discount_price < product.price ? (
                  <>
                    <span className="text-3xl font-bold text-foreground">
                      ₹{product.discount_price}
                    </span>
                    <span className="text-lg text-muted-foreground line-through ml-2">
                      ₹{product.price}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-foreground">
                    ₹{product?.price}
                  </span>
                )}
              </div>
              <Markup content={product.description} />
              <div>
                <h3 className="font-semibold text-sm">Botanical Name</h3>
                <p className="text-muted-foreground">
                  {product.botanical_name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {product.quantity > 0 ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-green-500">In Stock</span>
                  </>
                ) : (
                  <span className="text-destructive">Out of Stock</span>
                )}
              </div>
              {product.quantity > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.quantity} available
                  </span>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={
                    !product || product.quantity === 0 || isAddingToCart
                  }
                  onClick={handleAddToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-accent-foreground" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleFavorite}
                  disabled={isWishlistLoading}
                >
                  <Heart
                    className={`mr-2 h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
                  />
                  {isFavorite ? "In Wishlist" : "Wishlist"}
                </Button>
              </div>
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Category:</span>{" "}
                    {product.category.name}
                  </div>
                  <div>
                    <span className="font-semibold">Type:</span>{" "}
                    {product.type === 1 ? "Physical" : "Digital"}
                  </div>
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
              <Card>
                <CardContent>
                  <Markup content={product.description} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="additional" className="pt-4">
              <Card>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Botanical Name</h4>
                      <p className="text-muted-foreground">
                        {product.botanical_name}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Category</h4>
                      <p className="text-muted-foreground">
                        {product.category.name}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Type</h4>
                      <p className="text-muted-foreground">
                        {product.type === 1 ? "Physical" : "Digital"}
                      </p>
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
                        <div
                          key={review.id}
                          className="border-b pb-4 last:border-0 last:pb-0"
                        >
                          {editingReviewId === review.id ? (
                            <ReviewForm
                              review={review}
                              onCancel={() => setEditingReviewId(null)}
                            />
                          ) : (
                            <>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <RatingStars
                                    rating={review.rating}
                                    size="sm"
                                  />
                                  <span className="font-semibold">
                                    {review.user.name}
                                  </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(
                                    review.created_at,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-2">{review.review}</p>
                              {review.id === userReview?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingReviewId(review.id)}
                                  className="mt-2"
                                >
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
