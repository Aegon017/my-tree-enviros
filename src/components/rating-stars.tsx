import { Star } from "lucide-react";
import { useMemo } from "react";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  reviewCount?: number;
}

const sizeClasses = {
  sm: { star: "w-3 h-3", text: "text-xs" },
  md: { star: "w-4 h-4", text: "text-sm" },
  lg: { star: "w-5 h-5", text: "text-base" },
};

const starIds = [ "star-1", "star-2", "star-3", "star-4", "star-5" ];

const RatingStars = ( {
  rating,
  size = "md",
  showCount = false,
  reviewCount = 0,
}: RatingStarsProps ) => {
  const stars = useMemo( () =>
    starIds.map( ( starId, index ) => {
      const fillPercentage = Math.max( 0, Math.min( 100, ( rating - index ) * 100 ) );

      return (
        <div key={ starId } className="relative">
          <Star className={ `${ sizeClasses[ size ].star } text-gray-300` } />
          { fillPercentage > 0 && (
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={ { width: `${ fillPercentage }%` } }
            >
              <Star
                className={ `${ sizeClasses[ size ].star } text-yellow-400 fill-yellow-400` }
              />
            </div>
          ) }
        </div>
      );
    } ), [ rating, size ]
  );

  return (
    <div className="flex items-center gap-1">
      { stars }
      { showCount && reviewCount > 0 && (
        <span className={ `ml-1 ${ sizeClasses[ size ].text } text-gray-500` }>
          ({ reviewCount })
        </span>
      ) }
    </div>
  );
};

export default RatingStars;