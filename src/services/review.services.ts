import api from "./http-client";

export type ReviewFormValues = { rating: number; comment?: string };

export const reviewService = {
  async submit(productId: number, payload: ReviewFormValues) {
    return api
      .post(`/products/${productId}/reviews`, payload)
      .then((r) => r.data);
  },

  async update(reviewId: number, productId: number, payload: ReviewFormValues) {
    return api
      .put(`/products/${productId}/reviews/${reviewId}`, payload)
      .then((r) => r.data);
  },

  async delete(reviewId: number, productId: number) {
    return api
      .delete(`/products/${productId}/reviews/${reviewId}`)
      .then((r) => r.data);
  },

  async getRatings(productId: number) {
    return api.get(`/products/${productId}/ratings`).then((r) => r.data);
  },
};
