import { Star } from "lucide-react";

interface RatingStarsProps {
    rating: number;
    size?: "sm" | "md" | "lg";
    showCount?: boolean;
    reviewCount?: number;
}

const RatingStars = ( {
    rating,
    size = "md",
    showCount = false,
    reviewCount = 0,
}: RatingStarsProps ) => {
    const sizeClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    const textSizes = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
    };

    const stars = Array.from( { length: 5 }, ( _, i ) => {
        const fillPercentage = Math.max( 0, Math.min( 100, ( rating - i ) * 100 ) );

        return (
            <div key={ `star-${ i }` } className="relative">
                <Star className={ `${ sizeClasses[ size ] } text-gray-300` } />
                { fillPercentage > 0 && (
                    <div
                        className="absolute top-0 left-0 overflow-hidden"
                        style={ { width: `${ fillPercentage }%` } }
                    >
                        <Star className={ `${ sizeClasses[ size ] } text-yellow-400 fill-yellow-400` } />
                    </div>
                ) }
            </div>
        );
    } );

    return (
        <div className="flex items-center gap-1">
            { stars }
            { showCount && reviewCount > 0 && (
                <span className={ `ml-1 ${ textSizes[ size ] } text-gray-500` }>
                    ({ reviewCount })
                </span>
            ) }
        </div>
    );
};

export default RatingStars;