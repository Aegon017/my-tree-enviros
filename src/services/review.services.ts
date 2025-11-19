import api from "./http-client";

export type ReviewFormValues = { rating: number; review: string };

export const reviewService = {
    async submit(slug: string, payload: ReviewFormValues) {
        return api.post(`/products/${slug}/reviews`, payload).then((r) => r.data);
    },

    async update(reviewId: number, slug: string, payload: ReviewFormValues) {
        return api.put(`/products/${slug}/reviews/${reviewId}`, payload).then((r) => r.data);
    },
};