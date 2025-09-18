import { Skeleton } from "../ui/skeleton"

const EcommerceCardSkeleton = () => {
    return (
        <div className="bg-background rounded-lg shadow-md overflow-hidden border border-border w-full">
            <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                <Skeleton className="h-full w-full" />
            </div>

            <div className="p-4">
                <Skeleton className="h-3 w-1/4 mb-2" />

                <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex items-center ml-2">
                        { Array.from( { length: 5 } ).map( ( _, i ) => (
                            <Skeleton key={ i } className="w-4 h-4 rounded-full mr-0.5" />
                        ) ) }
                        <Skeleton className="h-3 w-8 ml-1" />
                    </div>
                </div>

                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />

                <div className="flex items-baseline mb-4">
                    <Skeleton className="h-6 w-1/3" />
                </div>

                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
}

export default EcommerceCardSkeleton