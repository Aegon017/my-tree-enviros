import { cn } from "@/lib/utils";
import Image from "next/image";
import type { Color, Size, Planter } from "@/types/product";

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
  return (
    <div className="space-y-6">
      {/* Color Selector - Visual circles like Ugaoo */ }

      {/* Size Selector - Buttons like Ugaoo */ }
      { sizes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Size</h4>
          <div className="flex flex-wrap gap-2">

            { sizes.map( ( size ) => (
              <button
                key={ size.id }
                onClick={ () => onSizeSelect( size ) }
                className={ cn(
                  "px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200",
                  selectedSize?.id === size.id
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                ) }
              >
                { size.name }
              </button>
            ) ) }
          </div>
        </div>
      ) }

      {/* Planter Selector - Image buttons like Ugaoo */ }
      { planters.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Planter</h4>
          <div className="flex gap-3">
            { planters.map( ( planter ) => (
              <button
                key={ planter.id }
                onClick={ () => onPlanterSelect( planter ) }
                className={ cn(
                  "relative p-3 border-2 rounded-lg transition-all duration-200 hover:shadow-md flex gap-2 items-center",
                  selectedPlanter?.id === planter.id
                    ? "border-gray-900 shadow-lg"
                    : "border-gray-300 hover:border-gray-400"
                ) }
              >
                <div className="aspect-square relative rounded-md overflow-hidden bg-gray-50 w-6">
                  <Image
                    src={ planter.image_url || "/placeholder.jpg" }
                    alt={ planter.name }
                    fill
                  />
                </div>
                <span className="text-xs font-medium text-center block">{ planter.name }</span>
                { selectedPlanter?.id === planter.id && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                ) }
              </button>
            ) ) }
          </div>
        </div>
      ) }
      { colors.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Color</h4>
          <div className="flex flex-wrap gap-3">
            { colors.map( ( color ) => (
              <button
                key={ color.id }
                onClick={ () => onColorSelect( color ) }
                className={ cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110",
                  selectedColor?.id === color.id
                    ? "border-gray-900 shadow-lg"
                    : "border-gray-300 hover:border-gray-400"
                ) }
                title={ color.name }
              >
                <div
                  className="w-8 h-8 rounded-full border border-gray-200"
                  style={ { backgroundColor: color.code } }
                />
                { selectedColor?.id === color.id && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                ) }
              </button>
            ) ) }
          </div>
        </div>
      ) }
    </div>
  );
}