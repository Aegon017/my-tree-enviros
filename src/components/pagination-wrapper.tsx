"use client";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { BaseMeta } from "@/types/common.types";

export default function PaginationWrapper( {
    meta,
    onPageChange,
}: {
    meta: BaseMeta;
    onPageChange: ( page: number ) => void;
} ) {
    const current = meta.current_page;
    const last = meta.last_page;

    const pages = [];

    if ( last <= 5 ) {
        for ( let i = 1; i <= last; i++ ) pages.push( i );
    } else {
        pages.push( 1 );

        if ( current > 3 ) pages.push( "ellipsis-left" );

        const start = Math.max( 2, current - 1 );
        const end = Math.min( last - 1, current + 1 );

        for ( let i = start; i <= end; i++ ) pages.push( i );

        if ( current < last - 2 ) pages.push( "ellipsis-right" );

        pages.push( last );
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={ () => current > 1 && onPageChange( current - 1 ) }
                        className={ current === 1 ? "opacity-40 cursor-not-allowed" : "" }
                    />
                </PaginationItem>

                { pages.map( ( p, i ) => {
                    if ( p === "ellipsis-left" || p === "ellipsis-right" ) {
                        return (
                            <PaginationItem key={ i }>
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }

                    return (
                        <PaginationItem key={ i }>
                            <PaginationLink
                                isActive={ current === p }
                                onClick={ () => onPageChange( Number( p ) ) }
                                className="cursor-pointer"
                            >
                                { p }
                            </PaginationLink>
                        </PaginationItem>
                    );
                } ) }

                <PaginationItem>
                    <PaginationNext
                        onClick={ () => current < last && onPageChange( current + 1 ) }
                        className={ current === last ? "opacity-40 cursor-not-allowed" : "" }
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}