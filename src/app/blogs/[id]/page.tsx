'use client'
import Image from "next/image";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import useSWR from "swr";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = ( url: string ) => fetch( url ).then( res => {
    if ( !res.ok ) throw new Error( 'Failed to fetch blog details' );
    return res.json();
} );

const Page = () => {
    const params = useParams();
    const id = params?.id as string;

    const { data, error, isLoading, mutate } = useSWR(
        id ? `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/blog/${ id }` : null,
        fetcher,
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    const blog = data?.data;
    const formattedDate = useMemo( () => {
        if ( !blog?.created_at ) return "";
        return new Date( blog.created_at ).toLocaleDateString( 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        } );
    }, [ blog?.created_at ] );

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if ( error ) return (
        <AppLayout>
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Blog</h1>
                    <Button onClick={ () => mutate() }>Try Again</Button>
                </div>
            </div>
        </AppLayout>
    );

    if ( isLoading ) return (
        <AppLayout>
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <div className="space-y-6">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-96 rounded-lg" />
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );

    return (
        <AppLayout>
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <h1 className="text-3xl font-bold text-foreground mb-4">{ blog?.title }</h1>
                        <div className="flex items-center text-sm text-muted-foreground mb-8">
                            <span>{ formattedDate }</span>
                        </div>

                        <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
                            <Image
                                src={ blog?.main_image_url || "/placeholder-image.jpg" }
                                alt={ blog?.title || "Blog image" }
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        <div
                            className="prose max-w-none text-foreground mb-8"
                            dangerouslySetInnerHTML={ { __html: blog?.content || "" } }
                        />

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4">Share this post</h3>
                            <div className="flex space-x-4">
                                <a
                                    href={ `https://www.facebook.com/sharer/sharer.php?u=${ encodeURIComponent( shareUrl ) }` }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-10 w-10 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                                >
                                    <span className="font-medium">f</span>
                                </a>
                                <a
                                    href={ `https://twitter.com/intent/tweet?url=${ encodeURIComponent( shareUrl ) }&text=${ encodeURIComponent( blog?.title || '' ) }` }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-10 w-10 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                                >
                                    <span className="font-medium">x</span>
                                </a>
                                <a
                                    href={ `https://www.linkedin.com/sharing/share-offsite/?url=${ encodeURIComponent( shareUrl ) }` }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-10 w-10 flex items-center justify-center rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                                >
                                    <span className="font-medium">in</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-card p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Blog Details</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Published</p>
                                    <p className="font-medium">{ formattedDate }</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Page;