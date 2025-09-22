"use client"

import { Card } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

const BasicTreeCardSkeleton = () => {
    return (
        <Card className="gap-0 group relative overflow-hidden bg-card border border-border/50 shadow-sm py-0">
            <div className="relative aspect-square overflow-hidden">
                <Skeleton className="absolute inset-0 w-full h-full" />
            </div>
            <div className="px-6 py-4">
                <Skeleton className="h-6 w-3/4 rounded" />
                <div className="mt-3 h-px bg-gradient-to-r from-muted/30 to-transparent scale-x-100 transition-transform duration-500 origin-left" />
            </div>
        </Card>
    )
}

export default BasicTreeCardSkeleton