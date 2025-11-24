"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import {
  VariantColor,
  VariantPlanter,
  VariantSize,
} from "@/types/variant.types";

interface VariantSelectorProps {
  colors: VariantColor[];
  sizes: VariantSize[];
  planters: VariantPlanter[];
  selectedColor?: VariantColor;
  selectedSize?: VariantSize;
  selectedPlanter?: VariantPlanter;
  onColorSelect: (color: VariantColor) => void;
  onSizeSelect: (size: VariantSize) => void;
  onPlanterSelect: (planter: VariantPlanter) => void;
}

export function VariantSelector({
  colors,
  sizes,
  planters,
  selectedColor,
  selectedSize,
  selectedPlanter,
  onColorSelect,
  onSizeSelect,
  onPlanterSelect,
}: VariantSelectorProps) {
  const handleColorSelect = useCallback(
    (color: VariantColor) => {
      if (selectedColor?.name !== color.name) onColorSelect(color);
    },
    [selectedColor, onColorSelect],
  );

  const handleSizeSelect = useCallback(
    (size: VariantSize) => {
      if (selectedSize?.name !== size.name) onSizeSelect(size);
    },
    [selectedSize, onSizeSelect],
  );

  const handlePlanterSelect = useCallback(
    (planter: VariantPlanter) => {
      if (selectedPlanter?.name !== planter.name) onPlanterSelect(planter);
    },
    [selectedPlanter, onPlanterSelect],
  );

  return (
    <div className="space-y-6">
      {sizes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Size</h4>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Button
                key={size.id ?? size.name}
                variant={
                  selectedSize?.name === size.name ? "default" : "outline"
                }
                onClick={() => handleSizeSelect(size)}
                className={cn(
                  "px-4 py-2 text-sm rounded-md border transition-all duration-200",
                  selectedSize?.name === size.name
                    ? "border-primary"
                    : "border-muted hover:border-primary/50",
                )}
              >
                {size.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {planters.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Planter</h4>
          <div className="flex flex-wrap gap-3">
            {planters.map((planter) => (
              <Button
                key={planter.id ?? planter.name}
                variant="outline"
                onClick={() => handlePlanterSelect(planter)}
                className={cn(
                  "relative p-3 border-2 rounded-md transition-all duration-200 flex gap-2 items-center h-auto",
                  selectedPlanter?.name === planter.name
                    ? "border-primary shadow-md"
                    : "border-muted hover:border-primary/50",
                )}
              >
                <div className="relative w-8 h-8 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={planter.image_url || "/placeholder.svg"}
                    alt={planter.name}
                    fill
                    sizes="32px"
                  />
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  {planter.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Color</h4>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <Button
                key={color.id ?? color.name}
                variant="outline"
                size="icon"
                onClick={() => handleColorSelect(color)}
                className={cn(
                  "relative w-10 h-10 rounded-full p-0 transition-all duration-200",
                  selectedColor?.name === color.name
                    ? "border-primary ring-1 ring-primary"
                    : "border-muted hover:border-primary/50",
                )}
                title={color.name}
              >
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: color.code }}
                />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
