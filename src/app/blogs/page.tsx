'use client'

import { AlertCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"
import AppLayout from "@/components/app-layout"
import BlogCard from "@/components/blog-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Blog } from "@/types/blog"
import BlogCardSkeleton from "@/components/skeletons/blog-card-skeleton"

interface ApiResponse {
    data: Blog[]
    meta?: {
        current_page: number
        total_pages: number
        total_count: number
    }
}

const fetcher = async ( url: string ) => {
    const response = await fetch( url )
    if ( !response.ok ) {
        throw new Error( 'Failed to fetch blogs' )
    }
    return response.json()
}

const Page = () => {
    const [ retryCount, setRetryCount ] = useState( 0 )
    const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
        `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/api/blogs?retry=${ retryCount }`,
        fetcher,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false
        }
    )

    const handleRetry = () => {
        setRetryCount( prev => prev + 1 )
        mutate()
    }

    if ( error ) {
        return (
            <AppLayout>
                <div className="container max-w-4xl mx-auto py-8 px-4">
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading Blogs</AlertTitle>
                        <AlertDescription>
                            Failed to load blog posts. Please try again.
                        </AlertDescription>
                    </Alert>
                    <div className="flex justify-center">
                        <Button onClick={ handleRetry } className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Retry Loading
                        </Button>
                    </div>
                </div>
            </AppLayout>
        )
    }

    const blogs = data?.data;

    return (
        <AppLayout>
            <div className="container max-w-6xl mx-auto py-8 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Our Blog</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Insights, stories, and updates from the My Tree Enviros team
                    </p>
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    { isLoading ? (
                        Array.from( { length: 6 } ).map( ( _, i ) => (
                            <BlogCardSkeleton key={ i } />
                        ) )
                    ) : (
                        blogs?.map( ( blog: Blog ) => (
                            <BlogCard key={ blog.id } blog={ blog } />
                        ) )
                    ) }
                </div>
                { data?.meta && data.meta.total_pages > 1 && (
                    <div className="flex justify-center mt-12">
                        <div className="flex gap-2">
                            <Button variant="outline" disabled={ data.meta.current_page === 1 }>
                                Previous
                            </Button>
                            <Button variant="outline" disabled={ data.meta.current_page === data.meta.total_pages }>
                                Next
                            </Button>
                        </div>
                    </div>
                ) }
            </div>
        </AppLayout >
    )
}

export default Page