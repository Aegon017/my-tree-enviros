'use client'
import { useState } from "react";
import { Heart, ShoppingCart, Star, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Product, Review } from "@/types/product";

interface ProductDetailPageProps {
    product: Product;
}

export default function ProductDetailPage( { product }: ProductDetailPageProps ) {
    const [ quantity, setQuantity ] = useState( 1 );
    const [ isFavorite, setIsFavorite ] = useState( product.wishlist_tag );

    const handleAddToCart = () => {
        toast.success( "Added to cart successfully!" );
    };

    const handleAddToWishlist = () => {
        setIsFavorite( !isFavorite );
        // Here you would make an API call to update the wishlist
        toast.success( isFavorite ? "Removed from wishlist" : "Added to wishlist!" );
    };

    const discountPercentage = product.discount_price && product.discount_price < product.price
        ? Math.round( ( ( product.price - product.discount_price ) / product.price ) * 100 )
        : 0;

    const averageRating = product.reviews?.length
        ? product.reviews.reduce( ( sum, r ) => sum + r.rating, 0 ) / product.reviews.length
        : 0;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Image */ }
                    <div className="space-y-4">
                        <div className="relative aspect-square overflow-hidden rounded-xl border border-border">
                            <img
                                src={ product.main_image_url }
                                alt={ product.name }
                                className="w-full h-full object-cover"
                            />
                            { discountPercentage > 0 && (
                                <Badge className="absolute top-3 left-3 bg-primary">
                                    { discountPercentage }% OFF
                                </Badge>
                            ) }
                        </div>
                    </div>

                    {/* Product Info */ }
                    <div className="space-y-6">
                        <div>
                            <Badge variant="secondary" className="mb-2">
                                { product.category.name }
                            </Badge>
                            <h1 className="text-3xl font-bold tracking-tight">{ product.name }</h1>
                            { product.nick_name && (
                                <p className="text-muted-foreground mt-1">{ product.nick_name }</p>
                            ) }
                            { product.botanical_name && (
                                <p className="text-sm text-muted-foreground italic mt-1">
                                    Botanical: { product.botanical_name }
                                </p>
                            ) }

                            <div className="flex items-center mt-2">
                                <div className="flex">
                                    { [ ...Array( 5 ) ].map( ( _, i ) => (
                                        <Star
                                            key={ i }
                                            className={ `w-5 h-5 ${ i < Math.floor( averageRating )
                                                ? "fill-primary text-primary"
                                                : i < averageRating
                                                    ? "fill-muted/50 text-muted"
                                                    : "text-muted-foreground/30"
                                                }` }
                                        />
                                    ) ) }
                                </div>
                                <span className="ml-2 text-sm text-muted-foreground">
                                    ({ product.reviews.length } Reviews)
                                </span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2">
                            { product.discount_price && product.discount_price < product.price ? (
                                <>
                                    <span className="text-3xl font-bold">₹{ product.discount_price.toLocaleString() }</span>
                                    <span className="text-xl text-muted-foreground line-through">
                                        ₹{ product.price.toLocaleString() }
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-bold">₹{ product.price.toLocaleString() }</span>
                            ) }
                        </div>

                        <div
                            className="text-muted-foreground prose prose-sm"
                            dangerouslySetInnerHTML={ { __html: product.description } }
                        />

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <span className="font-medium">Quantity:</span>
                                <div className="flex items-center border rounded-md">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={ () => setQuantity( Math.max( 1, quantity - 1 ) ) }
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                        type="number"
                                        value={ quantity }
                                        onChange={ ( e ) => setQuantity( Math.max( 1, parseInt( e.target.value ) || 1 ) ) }
                                        className="w-12 h-8 text-center border-0"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={ () => setQuantity( quantity + 1 ) }
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    { product.quantity > 0 ? `${ product.quantity } available` : 'Out of stock' }
                                </span>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    className="flex-1"
                                    size="lg"
                                    onClick={ handleAddToCart }
                                    disabled={ product.quantity === 0 }
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Add to Cart
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="px-3"
                                    onClick={ handleAddToWishlist }
                                >
                                    <Heart className={ `h-5 w-5 ${ isFavorite ? 'fill-destructive text-destructive' : '' }` } />
                                </Button>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                <p>SKU: { product.sku }</p>
                                <p className="mt-1">Category: { product.category.name }</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */ }
                <div className="mt-12">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-md">
                            <TabsTrigger value="description">Description</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews ({ product.reviews.length })</TabsTrigger>
                        </TabsList>

                        <TabsContent value="description" className="mt-6">
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={ { __html: product.description } }
                            />
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-6">
                            <div className="space-y-6">
                                { product.reviews.length > 0 ? (
                                    product.reviews.map( ( review ) => (
                                        <div key={ review.id } className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-medium">{ review.user_name || "Anonymous" }</h4>
                                                    <div className="flex items-center mt-1">
                                                        <div className="flex">
                                                            { [ ...Array( 5 ) ].map( ( _, i ) => (
                                                                <Star
                                                                    key={ i }
                                                                    className={ `w-4 h-4 ${ i < review.rating
                                                                        ? "fill-primary text-primary"
                                                                        : "text-muted-foreground/30"
                                                                        }` }
                                                                />
                                                            ) ) }
                                                        </div>
                                                        <span className="ml-2 text-sm text-muted-foreground">
                                                            { new Date( review.created_at ).toLocaleDateString() }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-muted-foreground">{ review.comment }</p>
                                        </div>
                                    ) )
                                ) : (
                                    <p className="text-muted-foreground">No reviews yet.</p>
                                ) }
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}