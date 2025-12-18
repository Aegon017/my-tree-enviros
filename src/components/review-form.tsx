"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating."),
  comment: z.string().max(1000).optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  onSubmit: (values: ReviewFormValues) => Promise<void>;
  onCancel?: () => void;
  initialValues?: ReviewFormValues;
  isSubmitting?: boolean;
  serverErrors?: {
    rating?: string;
    comment?: string;
    form?: string;
  };
}

export function ReviewForm({
  onSubmit,
  onCancel,
  initialValues,
  isSubmitting = false,
  serverErrors,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialValues?.rating ?? 0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: initialValues?.rating ?? 0,
      comment: initialValues?.comment ?? "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      setRating(initialValues.rating);
      form.reset(initialValues);
    }
  }, [initialValues, form]);

  useEffect(() => {
    if (!serverErrors) return;
    if (serverErrors.rating) {
      form.setError("rating", { type: "server", message: serverErrors.rating });
    }
    if (serverErrors.comment) {
      form.setError("comment", {
        type: "server",
        message: serverErrors.comment,
      });
    }
  }, [serverErrors, form]);

  const submitting = isSubmitting || form.formState.isSubmitting;

  const handleSubmit = async (values: ReviewFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={() => (
            <FormItem>
              <FormLabel>Rating *</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRating(star);
                        form.setValue("rating", star, { shouldValidate: true });
                      }}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverErrors?.form && (
          <p className="text-sm text-destructive">{serverErrors.form}</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
