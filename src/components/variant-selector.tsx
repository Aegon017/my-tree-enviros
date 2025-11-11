"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Color, Size, Planter } from "@/types/product.types";
import { useEffect, useCallback, useMemo } from "react";

interface VariantSelectorProps {
  colors: Color[];
  sizes: Size[];
  planters: Planter[];
  selectedColor?: Color;
  selectedSize?: Size;
  selectedPlanter?: Planter;
  onColorSelect: ( color: Color ) => void;
  onSizeSelect: ( size: Size ) => void;
  onPlanterSelect: ( planter: Planter ) => void;
}

export function VariantSelector( {
  colors,
  sizes,
  planters,
  selectedColor,
  selectedSize,
  selectedPlanter,
  onColorSelect,
  onSizeSelect,
  onPlanterSelect,
}: VariantSelectorProps ) {
  const defaultPlanter = useMemo( () => planters[ 0 ], [ planters ] );
  const defaultSize = useMemo( () => sizes[ 0 ], [ sizes ] );
  const defaultColor = useMemo( () => colors[ 0 ], [ colors ] );

  const initializeValues = useCallback( () => {
    if ( !selectedPlanter && defaultPlanter ) onPlanterSelect( defaultPlanter );
    if ( !selectedSize && defaultSize ) onSizeSelect( defaultSize );
    if ( !selectedColor && defaultColor ) onColorSelect( defaultColor );
  }, [ selectedPlanter, selectedSize, selectedColor, defaultPlanter, defaultSize, defaultColor, onPlanterSelect, onSizeSelect, onColorSelect ] );

  useEffect( () => {
    initializeValues();
  }, [ initializeValues ] );

  return (
    <div className="space-y-6">
      { sizes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Size</h4>
          <div className="flex flex-wrap gap-2">
            { sizes.map( ( size ) => (
              <Button
                key={ size.id }
                variant={ selectedSize?.id === size.id ? "default" : "outline" }
                onClick={ () => onSizeSelect( size ) }
                className={ cn(
                  "px-4 py-2 text-sm rounded-md border transition-all duration-200",
                  selectedSize?.id === size.id ? "border-primary" : "border-muted hover:border-primary/50"
                ) }
              >
                { size.name }
              </Button>
            ) ) }
          </div>
        </div>
      ) }

      { planters.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Planter</h4>
          <div className="flex flex-wrap gap-3">
            { planters.map( ( planter ) => (
              <Button
                key={ planter.id }
                variant="outline"
                onClick={ () => onPlanterSelect( planter ) }
                className={ cn(
                  "relative p-3 border-2 rounded-lg transition-all duration-200 flex gap-2 items-center h-auto",
                  selectedPlanter?.id === planter.id ? "border-primary shadow-md" : "border-muted hover:border-primary/50"
                ) }
              >
                <div className="relative w-8 h-8 rounded-md overflow-hidden bg-muted">
                  <Image src={ planter.image_url || "/placeholder.jpg" } alt={ planter.name } fill sizes="32px" />
                </div>
                <span className="text-xs font-medium whitespace-nowrap">{ planter.name }</span>
              </Button>
            ) ) }
          </div>
        </div>
      ) }

      { colors.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Color</h4>
          <div className="flex flex-wrap gap-3">
            { colors.map( ( color ) => (
              <Button
                key={ color.id }
                variant="outline"
                size="icon"
                onClick={ () => onColorSelect( color ) }
                className={ cn(
                  "relative w-10 h-10 rounded-full p-0 transition-all duration-200",
                  selectedColor?.id === color.id ? "border-primary ring-1 ring-primary" : "border-muted hover:border-primary/50"
                ) }
                title={ color.name }
              >
                <div className="w-8 h-8 rounded-full" style={ { backgroundColor: color.code } } />
              </Button>
            ) ) }
          </div>
        </div>
      ) }
    </div>
  );
}