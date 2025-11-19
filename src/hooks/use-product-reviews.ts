"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { productService } from "@/services/product.services";
import { reviewService, type ReviewFormValues } from "@/services/review.services";
import { useAuthStore } from "@/store/auth-store";

export function useProductReviews(slug: string) {
  const [currentPage] = useState(1);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useAuthStore((s) => s.token);
  const isAuth = !!token;

  const { data: canReviewData, mutate: mutateCanReview } = useSWR(isAuth ? ["can-review", slug] : null, () => productService.canReviewBySlug(slug).then((res) => res.data));
  const { data: reviewsData, mutate: mutateReviews } = useSWR(["reviews", slug, currentPage], () => productService.getReviewsBySlug(slug, currentPage).then((res) => res.data));

  const reviews = reviewsData?.reviews ?? [];
  const userReview = canReviewData?.review ?? null;
  const canReview = canReviewData?.can_review;
  const hasReviewed = canReviewData?.reviewed;

  const averageRating = useMemo(() => (reviews.length ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0), [reviews]);

  const submitReview = async (reviewId: number | null, values: ReviewFormValues) => {
    if (!isAuth) return;
    setIsSubmitting(true);
    try {
      if (reviewId) {
        await reviewService.update(reviewId, slug, values);
        toast.success("Review updated");
      } else {
        await reviewService.submit(slug, values);
        toast.success("Review added");
      }
      setEditingReviewId(null);
      mutateCanReview();
      mutateReviews();
    } catch {
      toast.error("Review error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    reviews,
    userReview,
    canReview,
    hasReviewed,
    averageRating,
    reviewCount: reviews.length,
    editingReviewId,
    setEditingReviewId,
    isSubmitting,
    submitReview,
  };
}