"use client";

import { Calendar, DollarSign, MapPin, ShieldCheck, Trees, Leaf, Minus, Plus, Star, Check } from "lucide-react";
import AppLayout from "@/components/app-layout";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Tree } from "@/types/tree";
import { use, useState } from "react";
import { toast } from "sonner";
import { storage } from "@/lib/storage";
import Image from "next/image";
import { Markup } from "interweave";
import { Lens } from "@/components/ui/lens";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const fetcher = ( url: string, token: string | null ) =>
    fetch( url, {
        headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${ token }` : "Bearer 420|xoAHPcuvjeSjE7EVDfQMGsu1l9BkHYIhlz35nEv43a162de5",
            "X-CSRF-TOKEN": "",
        },
    } ).then( ( res ) => {
        if ( !res.ok ) throw new Error( "Failed to fetch tree data" );
        return res.json();
    } );

async function cartMutation( url: string, { arg }: { arg: { token: string; body: any } } ) {
    const { token, body } = arg;
    const res = await fetch( url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${ token }`,
        },
        body: JSON.stringify( body ),
    } );
    if ( !res.ok ) throw new Error( "Failed to add to cart" );
    return res.json();
}

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default function Page( { params }: Props ) {
    const { id } = use( params );
    const token = storage.getToken();
    const [ quantity, setQuantity ] = useState( 1 );
    const [ selectedImage, setSelectedImage ] = useState( 0 );
    const [ selectedYears, setSelectedYears ] = useState( 1 );
    const [ rating, setRating ] = useState( 0 );
    const [ reviewText, setReviewText ] = useState( "" );

    const { data: response, error, isLoading } = useSWR(
        id ? [ `https://arboraid.co/beta/public/api/tree/${ id }`, token ] : null,
        ( [ url, token ] ) => fetcher( url, token ),
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    const tree: Tree = response?.data;
    const mainImage = tree
        ? tree.images?.length > 0 && selectedImage > 0
            ? tree.images[ selectedImage - 1 ].image_url
            : tree.main_image_url || "/placeholder.jpg"
        : "/placeholder.jpg";
    const averageRating = tree?.reviews?.length
        ? tree.reviews.reduce( ( sum, r ) => sum + r.rating, 0 ) / tree.reviews.length
        : 0;

    const { trigger: addTrigger, isMutating: isAdding } = useSWRMutation(
        [ `https://arboraid.co/beta/public/api/cart/add/${ id }`, "add" ],
        cartMutation
    );

    const { trigger: sponsorTrigger, isMutating: isSponsoring } = useSWRMutation(
        [ `https://arboraid.co/beta/public/api/cart/add/${ id }`, "sponsor" ],
        cartMutation
    );

    const handleQuantityChange = ( value: number ) => {
        if ( tree && value >= 1 && value <= tree.quantity ) setQuantity( value );
    };

    const handleYearsChange = ( value: number ) => {
        if ( tree && value >= 1 && value <= 50 ) setSelectedYears( value );
    };

    const getPriceForDuration = ( duration: number ) => {
        const priceOption = tree?.price?.find( ( p ) => p.duration === duration );
        return priceOption ? parseFloat( priceOption.price ) : 0;
    };

    const handleAddToCart = async () => {
        if ( !token ) {
            toast.error( "Please login to add to cart" );
            return;
        }

        if ( !tree || quantity === 0 || quantity > tree.quantity ) return;

        const priceOption = tree.price.find( ( p ) => p.duration === selectedYears );
        if ( !priceOption ) {
            toast.error( "Invalid duration selected" );
            return;
        }

        const body = {
            quantity: quantity,
            type: 1,
            product_type: 1,
            cart_type: 1,
            duration: selectedYears,
            price_option_id: priceOption.id,
        };

        try {
            const result = await addTrigger( { token, body } );

            console.log( result );


            if ( result.status ) {
                toast.success( `Added ${ quantity } tree${ quantity > 1 ? "s" : "" } to cart` );
            } else {
                throw new Error( result.message || "Failed to add to cart" );
            }
        } catch ( err ) {
            toast.error( `Failed to add to cart - ${ err instanceof Error ? err.message : "Unknown error" }` );
        }
    };

    const handleSponsorPlant = async () => {
        if ( !token ) {
            toast.error( "Please login to sponsor trees" );
            return;
        }

        if ( !tree || quantity === 0 || quantity > tree.quantity ) return;

        const priceOption = tree.price.find( ( p ) => p.duration === selectedYears );
        if ( !priceOption ) {
            toast.error( "Invalid duration selected" );
            return;
        }

        const body = {
            quantity: quantity,
            type: 1,
            product_type: 2,
            cart_type: 2,
            duration: selectedYears,
            price_option_id: priceOption.id,
        };

        try {
            const result = await sponsorTrigger( { token, body } );

            if ( result.status ) {
                toast.success( `Sponsored ${ quantity } tree${ quantity > 1 ? "s" : "" } for ${ selectedYears } year${ selectedYears > 1 ? "s" : "" }` );
            } else {
                throw new Error( result.message || "Failed to sponsor tree" );
            }
        } catch ( err ) {
            toast.error( `Failed to sponsor tree - ${ err instanceof Error ? err.message : "Unknown error" }` );
        }
    };

    const handleSubmitReview = async ( e: React.FormEvent ) => {
        e.preventDefault();
        if ( !token ) {
            toast.error( "Please login to submit a review" );
            return;
        }
        if ( rating === 0 || !reviewText.trim() ) {
            toast.error( "Please provide both rating and review text" );
            return;
        }
        toast.success( "Review submitted successfully!" );
        setRating( 0 );
        setReviewText( "" );
    };

    const breadcrumbItems = [
        { title: "Home", href: "/" },
        { title: "Sponsor A Tree", href: "/sponsor-a-tree" },
        { title: tree?.name || "Tree Details", href: "" },
    ];

    const priceOption = tree?.price?.find( ( p ) => p.duration === selectedYears );

    if ( error ) {
        return (
            <AppLayout>
                <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh] bg-background">
                    <Card className="w-full max-w-md border-destructive/20">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                                <Trees className="h-6 w-6 text-destructive" />
                            </div>
                            <h2 className="text-xl font-bold text-destructive">Error Loading Tree</h2>
                            <p className="text-muted-foreground">Sorry, we couldn't load the tree details. Please try again later.</p>
                            <Button onClick={ () => window.location.reload() } variant="outline">
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 max-w-6xl bg-background">
                <BreadcrumbNav items={ breadcrumbItems } className="mb-8" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6 sticky top-24 self-start">
                        { isLoading ? (
                            <Skeleton className="aspect-square rounded-2xl" />
                        ) : tree ? (
                            <>
                                <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/30 border">
                                    <Lens zoomFactor={ 2.5 }>
                                        <Image
                                            src={ mainImage }
                                            alt={ tree.name }
                                            width={ 1080 }
                                            height={ 1080 }
                                            className="object-cover"
                                            priority
                                        />
                                    </Lens>
                                </div>

                                { tree.images && tree.images.length > 0 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        { [ tree.main_image_url, ...tree.images.map( ( img ) => img.image_url ) ].map( ( imageUrl, index ) => (
                                            <button
                                                key={ index }
                                                className={ `relative h-20 w-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${ selectedImage === index ? "border-primary ring-2 ring-primary/20" : "border-muted hover:border-muted-foreground/30"
                                                    }` }
                                                onClick={ () => setSelectedImage( index ) }
                                            >
                                                <Image
                                                    src={ imageUrl }
                                                    alt={ `${ tree.name } view ${ index + 1 }` }
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            </button>
                                        ) ) }
                                    </div>
                                ) }
                            </>
                        ) : null }
                    </div>

                    <div className="space-y-8">
                        { isLoading ? (
                            <>
                                <Skeleton className="h-8 w-3/4 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </>
                        ) : tree ? (
                            <>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <Badge variant="secondary" className="px-3 py-1">
                                            { tree.sku }
                                        </Badge>
                                        <Badge variant="outline" className="px-3 py-1">
                                            <Leaf className="h-3 w-3 mr-1" />
                                            { tree.age } years old
                                        </Badge>
                                    </div>

                                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                        { tree.name }
                                    </h1>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            { Array.from( { length: 5 }, ( _, i ) => (
                                                <Star
                                                    key={ i }
                                                    className={ `h-5 w-5 ${ i < Math.round( averageRating ) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30" }` }
                                                />
                                            ) ) }
                                        </div>
                                        <span className="text-muted-foreground">
                                            { tree.reviews?.length || 0 } review{ tree.reviews?.length !== 1 ? "s" : "" }
                                        </span>
                                    </div>
                                </div>

                                <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <ShieldCheck className="h-6 w-6 text-green-600" />
                                            <span className="font-semibold text-green-700 dark:text-green-400">{ tree.price_info }</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            { tree.city && tree.state && (
                                                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                                                    <MapPin className="h-5 w-5 text-blue-600" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Location</p>
                                                        <p className="font-semibold">
                                                            { tree.city?.name }, { tree.state?.name }
                                                        </p>
                                                    </div>
                                                </div>
                                            ) }
                                            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                                                <Trees className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Available</p>
                                                    <p className="font-semibold">{ tree.quantity } trees</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-l-4 border-l-primary">
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            Configure Your Sponsorship
                                        </h3>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-sm font-medium flex items-center gap-2">
                                                        <Trees className="h-4 w-4" />
                                                        Number of Trees
                                                    </label>
                                                    <div className="flex items-center border rounded-lg bg-background justify-between">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 rounded-r-none"
                                                            onClick={ () => handleQuantityChange( quantity - 1 ) }
                                                            disabled={ quantity <= 1 }
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max={ tree.quantity }
                                                            value={ quantity }
                                                            onChange={ ( e ) => handleQuantityChange( Number( e.target.value ) ) }
                                                            className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 rounded-l-none"
                                                            onClick={ () => handleQuantityChange( quantity + 1 ) }
                                                            disabled={ quantity >= tree.quantity }
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-sm font-medium flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        Duration (Years)
                                                    </label>
                                                    <div className="flex items-center border rounded-lg bg-background justify-between">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 rounded-r-none"
                                                            onClick={ () => handleYearsChange( selectedYears - 1 ) }
                                                            disabled={ selectedYears <= 1 }
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max="50"
                                                            value={ selectedYears }
                                                            onChange={ ( e ) => handleYearsChange( Number( e.target.value ) ) }
                                                            className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 rounded-l-none"
                                                            onClick={ () => handleYearsChange( selectedYears + 1 ) }
                                                            disabled={ selectedYears >= 50 }
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            { tree.price && tree.price.length > 0 && (
                                                <div className="space-y-4">
                                                    <div className="bg-primary/5 p-4 rounded-lg border">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <span className="font-semibold">Total Contribution</span>
                                                                <p className="text-sm text-muted-foreground">
                                                                    { quantity } tree{ quantity > 1 ? "s" : "" } × { selectedYears } year{ selectedYears > 1 ? "s" : "" }
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-3xl font-bold text-primary">
                                                                        ₹{ ( getPriceForDuration( selectedYears ) * quantity ).toLocaleString( "en-IN" ) }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1"
                                                            onClick={ handleAddToCart }
                                                            disabled={ isAdding || !priceOption }
                                                        >
                                                            { isAdding ? (
                                                                <>
                                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-accent-foreground" />
                                                                    Adding...
                                                                </>
                                                            ) : (
                                                                "Add To Cart"
                                                            ) }
                                                        </Button>
                                                        <Button
                                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                                            onClick={ handleSponsorPlant }
                                                            disabled={ isSponsoring || !priceOption }
                                                        >
                                                            { isSponsoring ? (
                                                                <>
                                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-accent-foreground" />
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Leaf className="mr-2 h-5 w-5" />
                                                                    Sponsor Now
                                                                </>
                                                            ) }
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) }
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : null }
                    </div>
                </div>

                { !isLoading && tree && (
                    <div className="mt-16">
                        <Tabs defaultValue="description" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                                <TabsTrigger value="description" className="flex items-center gap-2">
                                    Tree Story
                                </TabsTrigger>
                                <TabsTrigger value="reviews" className="flex items-center gap-2">
                                    <Star className="h-4 w-4" />
                                    Reviews ({ tree.reviews?.length || 0 })
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="description" className="space-y-6">
                                <Card>
                                    <CardContent className="p-8">
                                        <div className="prose prose-lg max-w-none dark:prose-invert">
                                            <Markup content={ tree.description } />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="reviews" className="space-y-6">
                                <Card>
                                    <CardContent className="p-8">
                                        { tree.reviews?.length ? (
                                            <div className="space-y-6">
                                                { tree.reviews.map( ( review ) => (
                                                    <div key={ review.id } className="border-b pb-6 last:border-0 last:pb-0">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex">
                                                                    { Array.from( { length: 5 }, ( _, i ) => (
                                                                        <Star
                                                                            key={ i }
                                                                            className={ `h-4 w-4 ${ i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30" }` }
                                                                        />
                                                                    ) ) }
                                                                </div>
                                                                <span className="font-semibold">Anonymous User</span>
                                                            </div>
                                                            <span className="text-sm text-muted-foreground">
                                                                { new Date( review.created_at ).toLocaleDateString() }
                                                            </span>
                                                        </div>
                                                        <p className="text-muted-foreground">{ review.review }</p>
                                                    </div>
                                                ) ) }
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                                <h4 className="text-lg font-semibold mb-2">No reviews yet</h4>
                                                <p className="text-muted-foreground">Be the first to sponsor this tree and share your experience!</p>
                                            </div>
                                        ) }

                                        <div className="mt-8 pt-8 border-t">
                                            <h4 className="text-lg font-semibold mb-6">Share Your Experience</h4>
                                            <form onSubmit={ handleSubmitReview } className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">Your Rating:</span>
                                                    <div className="flex">
                                                        { Array.from( { length: 5 }, ( _, i ) => (
                                                            <button
                                                                key={ i }
                                                                type="button"
                                                                onClick={ () => setRating( i + 1 ) }
                                                                className="p-1 hover:scale-110 transition-transform"
                                                            >
                                                                <Star
                                                                    className={ `h-6 w-6 ${ i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 hover:text-yellow-400/50"
                                                                        }` }
                                                                />
                                                            </button>
                                                        ) ) }
                                                    </div>
                                                </div>
                                                <Textarea
                                                    placeholder="Tell us about your sponsorship experience..."
                                                    className="min-h-32"
                                                    value={ reviewText }
                                                    onChange={ ( e ) => setReviewText( e.target.value ) }
                                                />
                                                <Button type="submit" disabled={ !rating || !reviewText.trim() }>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Submit Review
                                                </Button>
                                            </form>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                ) }
            </div>
        </AppLayout>
    );
}