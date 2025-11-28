export interface CheckoutItem {
    id: number;
    type: "product" | "sponsor" | "adopt";
    quantity: number;
    amount: number; // Unit price
    total_amount: number; // Line total
    name: string;
    image_url: string;

    // Product specific
    product_variant_id?: number;
    variant?: {
        color?: string;
        size?: string;
        planter?: string;
    };

    // Tree specific
    plan_price_id?: number;
    plan_id?: number;
    tree_id?: number;
    duration?: number;
    duration_unit?: string;
    dedication?: {
        name?: string;
        occasion?: string;
        message?: string;
    };
}

export interface CheckoutCharge {
    code: string;
    label: string;
    type: "tax" | "shipping" | "fee";
    mode: "fixed" | "percentage";
    amount: number;
}

export interface CheckoutSummary {
    items: CheckoutItem[];
    subtotal: number;
    discount: number;
    tax_total: number;
    fee_total: number;
    grand_total: number;
    charges: CheckoutCharge[];
    coupon?: {
        code: string;
        discount_amount: number;
    };
}

export interface CheckoutPreparePayload {
    items: Array<{
        type: string;
        quantity: number;
        amount: number;
        product_variant_id?: number;
        campaign_id?: number;
        tree_id?: number;
        plan_id?: number;
        plan_price_id?: number;
        tree_instance_id?: number;
        sponsor_quantity?: number;
    }>;
    coupon_code?: string;
    payment_method?: string;
    currency?: string;
}

export interface CheckoutPrepareResponse {
    order: {
        id: number;
        reference_number: string;
        subtotal: number;
        discount: number;
        tax: number;
        shipping: number;
        fee: number;
        grand_total: number;
        charges: Array<{
            type: string;
            label: string;
            amount: number;
        }>;
    };
    payment: {
        gateway: string;
        order_id: string;
        amount: number;
        currency: string;
    };
}
