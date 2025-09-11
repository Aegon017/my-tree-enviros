import { Heart, ShoppingCart, Star } from 'lucide-react'
import Image, { type StaticImageData } from 'next/image'
import { useState } from 'react'
import { Button } from './ui/button'

interface Props {
    category: string
    name: string
    description: string
    originalPrice: string
    discountedPrice: string
    discountPercentage: number
    rating: number
    imageUrl?: StaticImageData
    imageAlt?: string
}

const EcommerceCard = ( {
    category,
    name,
    description,
    originalPrice,
    discountedPrice,
    discountPercentage,
    rating,
    imageUrl,
    imageAlt = name
}: Props ) => {
    const [ isFavorite, setIsFavorite ] = useState( false )

    const renderRatingStars = ( rating: number ) => {
        const stars = []
        const fullStars = Math.floor( rating )
        const fractional = rating - fullStars
        const emptyStars = 5 - fullStars - ( fractional > 0 ? 1 : 0 )

        for ( let i = 0; i < fullStars; i++ ) {
            stars.push(
                <Star key={ `full-${ i }` } className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            )
        }

        if ( fractional > 0 ) {
            stars.push(
                <div key="half-star" className="relative">
                    <Star className="w-4 h-4 text-gray-300" aria-hidden="true" />
                    <div className="absolute inset-0 overflow-hidden" style={ { width: `${ fractional * 100 }%` } }>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    </div>
                </div>
            )
        }

        for ( let i = 0; i < emptyStars; i++ ) {
            stars.push(
                <Star key={ `empty-${ i }` } className="w-4 h-4 text-gray-300" aria-hidden="true" />
            )
        }

        return stars
    }

    return (
        <div className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
            <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
                <Image
                    src={ imageUrl ?? '' }
                    alt={ imageAlt }
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    priority={ false }
                />

                <Button
                    className={ `absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${ isFavorite
                        ? 'bg-red-100 text-red-500 scale-110'
                        : 'bg-white/80 text-gray-500 hover:bg-white'
                        }` }
                    onClick={ () => setIsFavorite( !isFavorite ) }
                    aria-label={ isFavorite ? "Remove from Favorites" : "Add to Favorites" }
                >
                    <Heart className={ `w-4 h-4 ${ isFavorite ? 'fill-current' : '' }` } />
                </Button>

                { discountPercentage > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        { `-${ discountPercentage }%` }
                    </span>
                ) }
            </div>

            <div className="p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    { category }
                </div>

                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{ name }</h3>
                    <div className="flex items-center ml-2">
                        { renderRatingStars( rating ) }
                        <span className="ml-1 text-xs text-gray-500">({ rating.toFixed( 1 ) })</span>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    { description }
                </p>

                <div className="flex items-baseline mb-4">
                    <span className="text-xl font-bold text-gray-900">
                        { `$${ discountedPrice }` }
                    </span>
                    { originalPrice && originalPrice !== discountedPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                            { `$${ originalPrice }` }
                        </span>
                    ) }
                </div>

                <Button className="w-full" aria-label="Add to Cart">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                </Button>
            </div>
        </div>
    )
}

export default EcommerceCard