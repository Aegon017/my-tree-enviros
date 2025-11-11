import api from "@/lib/axios";

export type ReviewFormValues = {
    rating: number;
    review: string;
};

export const reviewService = {
    async submit( slug: string, values: ReviewFormValues ) {
        await api.post( `/products/${ slug }/reviews`, values );
    },

    async update( reviewId: number, slug: string, values: ReviewFormValues ) {
        await api.put( `/products/${ slug }/reviews/${ reviewId }`, values );
    },
};