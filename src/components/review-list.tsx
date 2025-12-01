"use client";

import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RatingStars from "@/components/rating-stars";
import { ReviewForm } from "@/components/review-form";

interface Review {
    id: number;
    rating: number;
    comment?: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface ReviewListProps {
    reviews: Review[];
    currentUserId?: number;
    editingReviewId: number | null;
    onEdit: (reviewId: number) => void;
    onCancelEdit: () => void;
    onSubmitEdit: (
        reviewId: number,
        values: { rating: number; comment?: string }
    ) => Promise<void>;
    onDelete?: (reviewId: number) => Promise<void>;
    isSubmitting?: boolean;
}

export function ReviewList({
    reviews,
    currentUserId,
    editingReviewId,
    onEdit,
    onCancelEdit,
    onSubmitEdit,
    onDelete,
    isSubmitting = false,
}: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this product!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => {
                const isOwnReview = currentUserId && review.user.id === currentUserId;
                const isEditing = editingReviewId === review.id;

                return (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                        {isEditing ? (
                            <ReviewForm
                                initialValues={{
                                    rating: review.rating,
                                    comment: review.comment ?? "",
                                }}
                                onSubmit={(values) => onSubmitEdit(review.id, values)}
                                onCancel={onCancelEdit}
                                isSubmitting={isSubmitting}
                            />
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-3 items-center">
                                        <RatingStars rating={review.rating} size="sm" />
                                        <span className="font-semibold">{review.user.name}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(review.created_at).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>

                                {review.comment && (
                                    <p className="text-sm mt-2 text-muted-foreground">
                                        {review.comment}
                                    </p>
                                )}

                                {isOwnReview && (
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(review.id)}
                                            disabled={isSubmitting}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        {onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(review.id)}
                                                disabled={isSubmitting}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
