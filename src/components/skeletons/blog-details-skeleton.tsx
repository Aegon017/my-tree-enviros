import { Skeleton } from "@/components/ui/skeleton"

const BlogDetailsSkeleton = () => {
    return (
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
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>

                        <div className="border-t pt-6">
                            <Skeleton className="h-6 w-1/4 mb-4" />
                            <div className="flex space-x-4">
                                <Skeleton className="h-10 w-10 rounded-md" />
                                <Skeleton className="h-10 w-10 rounded-md" />
                                <Skeleton className="h-10 w-10 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-card p-6 rounded-lg border">
                        <Skeleton className="h-6 w-1/2 mb-4" />
                        <div className="space-y-3">
                            <div>
                                <Skeleton className="h-4 w-1/3 mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlogDetailsSkeleton