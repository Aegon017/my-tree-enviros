"use client";

import { useEffect, useState, useMemo } from "react";
import type { Product } from "@/types/product.types";
import { ProductVariant } from "@/types/variant.types";

interface ImageItem {
  id: number;
  url: string;
}

export function useProductImages( product?: Product, selectedVariant?: ProductVariant ) {
  const [ currentIndex, setCurrentIndex ] = useState( 0 );

  const images = useMemo<ImageItem[]>( () => {
    if ( selectedVariant?.image_urls?.length ) {
      return selectedVariant.image_urls.map( ( img, i ) => ( { id: i, url: img.url } ) );
    }

    const defaultVariant = product?.variants?.[ 0 ];
    if ( defaultVariant?.image_urls?.length ) {
      return defaultVariant.image_urls.map( ( img, i ) => ( { id: i, url: img.url } ) );
    }

    const productImageUrls = ( product as any )?.image_urls as string[] | undefined;
    if ( productImageUrls?.length ) {
      return productImageUrls.map( ( url, i ) => ( { id: i, url } ) );
    }

    return [];
  }, [ selectedVariant, product ] );

  useEffect( () => {
    setCurrentIndex( 0 );
  }, [ images ] );

  const currentImage =
    images[ currentIndex ]?.url ??
    product?.variants?.[ 0 ]?.image_urls?.[ 0 ]?.url ??
    "/placeholder.svg";

  return {
    images,
    currentIndex,
    setCurrentIndex,
    currentImage,
  };
}