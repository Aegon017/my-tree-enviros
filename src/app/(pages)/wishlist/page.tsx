'use client'

import { Markup } from "interweave"
import { Heart, Leaf, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"
import AppLayout from "@/components/app-layout"
import Section from "@/components/section"
import SectionTitle from "@/components/section-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { storage } from "@/lib/storage"
import type { WishlistItem } from "@/types/wishlist"

interface WishlistResponse {
    data: WishlistItem[]
    message: string
}

interface RemoveResponse {
    data: Record<string, never>
    message: string
}

const fetcher = async ( url: string ) => {
    const response = await fetch( url, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ storage.getToken() }`,
        },
    } )

    if ( !response.ok ) {
        if ( response.status === 401 ) {
            throw new Error( 'Unauthorized - Please log in' )
        }
        throw new Error( 'Failed to fetch data' )
    }

    return response.json()
}

const WishlistItemCardSkeleton = () => (
    <Card className="flex flex-col animate-pulse">
        <CardHeader className="flex-grow">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-muted rounded"></div>
                        <div className="h-6 bg-muted rounded w-32"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
            <div className="relative mt-4 aspect-video bg-muted rounded-lg"></div>
        </CardContent>
        <CardFooter>
            <div className="h-10 bg-muted rounded w-full"></div>
        </CardFooter>
    </Card>
)

interface WishlistItemCardProps {
    wishlistItem: WishlistItem
    removingIds: number[]
    onRemove: ( treeId: number ) => void
}

const WishlistItemCard = ( { wishlistItem, removingIds, onRemove }: WishlistItemCardProps ) => {
    const isRemoving = removingIds.includes( wishlistItem.product.id )

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-grow">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-green-600" />
                            { wishlistItem.product.name }
                        </CardTitle>
                        { wishlistItem.product.botanical_name && (
                            <CardDescription className="italic mt-1">
                                { wishlistItem.product.botanical_name }
                            </CardDescription>
                        ) }
                    </div>
                    { wishlistItem.product.price && (
                        <span className="font-semibold text-lg text-green-600">
                            ${ wishlistItem.product.price }
                        </span>
                    ) }
                </div>
            </CardHeader>

            <CardContent className="flex-grow">
                { wishlistItem.product.description && (
                    <Markup className="text-sm text-muted-foreground line-clamp-3" content={ wishlistItem.product.description } />
                ) }
                { wishlistItem.product.main_image_url && (
                    <div className="relative mt-4 aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <Image
                            src={ wishlistItem.product.main_image_url }
                            alt={ wishlistItem.product.name }
                            fill
                            className="rounded-lg object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                ) }
            </CardContent>

            <CardFooter>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={ () => onRemove( wishlistItem.product.id ) }
                    disabled={ isRemoving }
                >
                    { isRemoving ? (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                            Removing...
                        </>
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from Wishlist
                        </>
                    ) }
                </Button>
            </CardFooter>
        </Card>
    )
}

const WishlistPage = () => {
    const [ removingIds, setRemovingIds ] = useState<number[]>( [] )

    const { data, error, isLoading, mutate } = useSWR<WishlistResponse>(
        `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/wishlist`,
        fetcher,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        }
    )

    const removeFromWishlist = async ( treeId: number ) => {
        setRemovingIds( prev => [ ...prev, treeId ] )

        try {
            const response = await fetch( `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/wishlist/remove/${ treeId }`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ storage.getToken() }`,
                },
            } )

            if ( !response.ok ) {
                if ( response.status === 401 ) {
                    throw new Error( 'Unauthorized - Please log in to manage your wishlist' )
                }
                throw new Error( 'Failed to remove item from wishlist' )
            }

            const result: RemoveResponse = await response.json()
            mutate()
            toast.success( result.message || "Item removed from wishlist" )
        } catch ( error ) {
            toast.error( error instanceof Error ? error.message : "Failed to remove item" )
        } finally {
            setRemovingIds( prev => prev.filter( id => id !== treeId ) )
        }
    }

    if ( isLoading ) {
        return (
            <AppLayout>
                <Section>
                    <SectionTitle
                        align="center"
                        title="Wishlist"
                        subtitle="Your saved items and favorites are listed here."
                    />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        { Array.from({ length: 6 }).map( () => {
                            const uniqueKey = `wishlist-skeleton-${crypto.randomUUID()}`;
                            return <WishlistItemCardSkeleton key={uniqueKey} />;
                        } ) }
                    </div>
                </Section>
            </AppLayout>
        )
    }

    if ( error ) {
        return (
            <AppLayout>
                <Section>
                    <SectionTitle
                        align="center"
                        title="Wishlist"
                        subtitle="Your saved items and favorites are listed here."
                    />
                    <div className="text-center py-12">
                        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Unable to load wishlist</h3>
                        <p className="text-muted-foreground mb-4">
                            { error.message }
                        </p>
                        <Button onClick={ () => mutate() }>Try Again</Button>
                    </div>
                </Section>
            </AppLayout>
        )
    }

    const wishlistItems = data?.data || []

    if ( wishlistItems.length === 0 ) {
        return (
            <AppLayout>
                <Section>
                    <SectionTitle
                        align="center"
                        title="Wishlist"
                        subtitle="Your saved items and favorites are listed here."
                    />
                    <div className="text-center py-12">
                        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                        <p className="text-muted-foreground">
                            Start adding your favorite trees to see them here!
                        </p>
                    </div>
                </Section>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <Section>
                <SectionTitle
                    align="center"
                    title="Wishlist"
                    subtitle={ `You have ${ wishlistItems.length } item${ wishlistItems.length !== 1 ? 's' : '' } in your wishlist` }
                />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    { wishlistItems.map( ( wishlistItem ) => (
                        <WishlistItemCard
                            key={ wishlistItem.id }
                            wishlistItem={ wishlistItem }
                            removingIds={ removingIds }
                            onRemove={ removeFromWishlist }
                        />
                    ) ) }
                </div>
            </Section>
        </AppLayout>
    )
}

export default WishlistPage