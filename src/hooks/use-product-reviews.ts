"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { productService } from "@/services/product.services";
import {
  reviewService,
  type ReviewFormValues,
} from "@/services/review.services";
import { useAuthStore } from "@/store/auth-store";

export function useProductReviews(productId: number | undefined) {
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuth = !!token;

  const { data: reviewsData, mutate: mutateReviews } = useSWR(
    productId ? ["reviews", productId] : null,
    () => productService.getReviewsByProductId(productId!),
  );

  const reviews = Array.isArray(reviewsData?.data?.reviews)
    ? reviewsData.data.reviews
    : [];
  const userReview = reviews.find((r: any) => r.user?.id === user?.id) ?? null;
  const hasReviewed = !!userReview;

  const averageRating = useMemo(
    () =>
      reviews.length
        ? reviews.reduce((s: number, r: any) => s + r.rating, 0) /
        reviews.length
        : 0,
    [reviews],
  );

  const submitReview = async (
    reviewId: number | null,
    values: ReviewFormValues,
  ) => {
    if (!isAuth || !productId) return;
    setIsSubmitting(true);
    try {
      if (reviewId) {
        await reviewService.update(reviewId, productId, values);
        toast.success("Review updated");
      } else {
        await reviewService.submit(productId, values);
        toast.success("Review added");
      }
      setEditingReviewId(null);
      mutateReviews();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!isAuth || !productId) return;
    setIsSubmitting(true);
    try {
      await reviewService.delete(reviewId, productId);
      toast.success("Review deleted");
      mutateReviews();
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    reviews,
    userReview,
    hasReviewed,
    averageRating,
    reviewCount: reviews.length,
    editingReviewId,
    setEditingReviewId,
    isSubmitting,
    submitReview,
    deleteReview,
    currentUserId: user?.id,
    isAuth,
  };
}
