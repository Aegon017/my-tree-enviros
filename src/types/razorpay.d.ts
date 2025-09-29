export interface Options {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description: string;
    image: string;
    callback_url: string;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    notes: {
        address: string;
    };
    theme: {
        color: string;
    };
}