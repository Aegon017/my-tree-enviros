"use client"

import Link from "next/link"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { BreadcrumbItemType } from "./types/type"

interface BreadcrumbResponsiveProps {
    items: BreadcrumbItemType[]
    itemsToDisplay?: number
}

export function BreadcrumbResponsive( {
    items,
    itemsToDisplay = 3,
}: BreadcrumbResponsiveProps ) {
    const totalItems = items.length

    const visibleItems =
        totalItems <= itemsToDisplay
            ? items
            : [ items[ 0 ], ...items.slice( totalItems - itemsToDisplay + 1 ) ]

    return (
        <Breadcrumb>
            <BreadcrumbList>
                { visibleItems.map( ( item, index ) => (
                    <BreadcrumbItem key={ item.title }>
                        { item.href ? (
                            <BreadcrumbLink
                                asChild
                                className="max-w-20 truncate md:max-w-none"
                            >
                                <Link href={ item.href }>{ item.title }</Link>
                            </BreadcrumbLink>
                        ) : (
                            <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                                { item.title }
                            </BreadcrumbPage>
                        ) }
                        { index < visibleItems.length - 1 && <BreadcrumbSeparator /> }
                    </BreadcrumbItem>
                ) ) }
            </BreadcrumbList>
        </Breadcrumb>
    )
}