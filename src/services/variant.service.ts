import type { Product } from "@/types/product.types";
import type {
    ProductVariant,
    VariantColor,
    VariantPlanter,
    VariantSize,
} from "@/types/variant.types";

const nameKey = ( obj?: { name?: string; code?: string } | null ) => {
    if ( !obj ) return "";
    return obj.code ? `${ obj.name }::${ obj.code }` : `${ obj.name }`;
};

export const variantService = {
    getAvailableSizes( product?: Product ): VariantSize[] {
        if ( !product?.variants ) return [];
        const map: Record<string, VariantSize> = {};
        for ( const v of product.variants ) {
            const size = v.variant?.size;
            if ( !size ) continue;
            map[ nameKey( size ) ] = size;
        }
        return Object.values( map );
    },

    getAvailablePlanters( product?: Product, selectedSize?: VariantSize ): VariantPlanter[] {
        if ( !product?.variants ) return [];
        const map: Record<string, VariantPlanter> = {};
        for ( const v of product.variants ) {
            const planter = v.variant?.planter;
            const size = v.variant?.size;
            if ( !planter ) continue;
            if ( selectedSize && size?.name !== selectedSize.name ) continue;
            map[ nameKey( planter ) ] = planter;
        }
        return Object.values( map );
    },

    getAvailableColors(
        product?: Product,
        selectedSize?: VariantSize,
        selectedPlanter?: VariantPlanter
    ): VariantColor[] {
        if ( !product?.variants ) return [];
        const map: Record<string, VariantColor> = {};
        for ( const v of product.variants ) {
            const color = v.variant?.color;
            const size = v.variant?.size;
            const planter = v.variant?.planter;
            if ( !color ) continue;
            if ( selectedSize && size?.name !== selectedSize.name ) continue;
            if ( selectedPlanter && planter?.name !== selectedPlanter.name ) continue;
            map[ nameKey( color ) ] = color;
        }
        return Object.values( map );
    },

    resolveVariant(
        product?: Product,
        color?: VariantColor,
        size?: VariantSize,
        planter?: VariantPlanter
    ): ProductVariant | undefined {
        if ( !product?.variants?.length ) return undefined;
        return product.variants.find( ( v ) => {
            const matchColor = !color || v.variant?.color?.name === color.name;
            const matchSize = !size || v.variant?.size?.name === size.name;
            const matchPlanter = !planter || v.variant?.planter?.name === planter.name;
            return matchColor && matchSize && matchPlanter;
        } );
    },
};