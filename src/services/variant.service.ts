import type { Product, Color, Size, Planter, ProductVariant } from "@/types/product.types";

export const variantService = {
    getAvailableColors( product: Product | undefined, selectedPlanter: Planter | undefined ): Color[] {
        return (
            product?.variant_options?.colors?.filter( ( color ) =>
                product?.variants?.some(
                    ( v ) => v.variant.color?.id === color.id && v.variant.planter?.id === selectedPlanter?.id
                )
            ) ?? []
        );
    },
    getAvailableSizes( product: Product | undefined ): Size[] {
        return product?.variant_options?.sizes ?? [];
    },
    getAvailablePlanters( product: Product | undefined, selectedSize: Size | undefined ): Planter[] {
        if ( !selectedSize ) return product?.variant_options?.planters ?? [];
        return (
            product?.variant_options?.planters?.filter( ( planter ) =>
                product?.variants?.some(
                    ( v ) => v.variant.size?.id === selectedSize.id && v.variant.planter?.id === planter.id
                )
            ) ?? []
        );
    },
    resolveVariant( product: Product | undefined, color?: Color, size?: Size, planter?: Planter ): ProductVariant | undefined {
        return product?.variants?.find(
            ( v ) =>
                v.variant.color?.id === color?.id &&
                v.variant.size?.id === size?.id &&
                v.variant.planter?.id === planter?.id
        );
    },
};