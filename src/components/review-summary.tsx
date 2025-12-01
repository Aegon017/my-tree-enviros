"use client";

import RatingStars from "@/components/rating-stars";
import { Progress } from "@/components/ui/progress";

interface ReviewSummaryProps {
    averageRating: number;
    totalReviews: number;
    ratingDistribution?: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

export function ReviewSummary({
    averageRating,
    totalReviews,
    ratingDistribution,
}: ReviewSummaryProps) {
    if (totalReviews === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="text-center">
                    <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                    <RatingStars rating={averageRating} size="md" />
                    <div className="text-sm text-muted-foreground mt-1">
                        {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </div>
                </div>

                {ratingDistribution && (
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingDistribution[star as keyof typeof ratingDistribution] || 0;
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                            return (
                                <div key={star} className="flex items-center gap-2 text-sm">
                                    <span className="w-12">{star} star</span>
                                    <Progress value={percentage} className="flex-1 h-2" />
                                    <span className="w-12 text-right text-muted-foreground">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
