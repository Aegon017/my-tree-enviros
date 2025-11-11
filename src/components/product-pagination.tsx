"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface Props {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  onPageChange: ( page: number ) => void;
  isLoading?: boolean;
}

const ProductPagination = ( {
  currentPage,
  lastPage,
  perPage,
  total,
  onPageChange,
  isLoading = false
}: Props ) => {
  if ( lastPage <= 1 ) return null;

  const pages = () => {
    const arr: ( number | string )[] = [];
    const max = 5;

    if ( lastPage <= max ) {
      for ( let i = 1; i <= lastPage; i++ ) arr.push( i );
    } else {
      arr.push( 1 );
      if ( currentPage > 3 ) arr.push( "..." );
      const start = Math.max( 2, currentPage - 1 );
      const end = Math.min( lastPage - 1, currentPage + 1 );
      for ( let i = start; i <= end; i++ ) arr.push( i );
      if ( currentPage < lastPage - 2 ) arr.push( "..." );
      arr.push( lastPage );
    }
    return arr;
  };

  const range = () => {
    const from = ( currentPage - 1 ) * perPage + 1;
    const to = Math.min( currentPage * perPage, total );
    return `Showing ${ from } to ${ to } of ${ total } products`;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground text-center">{ range() }</div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={ ( e ) => {
                e.preventDefault();
                if ( currentPage > 1 && !isLoading ) onPageChange( currentPage - 1 );
              } }
              className={ currentPage === 1 || isLoading ? "pointer-events-none opacity-50" : "" }
            />
          </PaginationItem>

          { pages().map( ( page, i ) =>
            page === "..." ? (
              <PaginationItem key={ `e-${ i }` }>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={ page }>
                <PaginationLink
                  href="#"
                  onClick={ ( e ) => {
                    e.preventDefault();
                    if ( page !== currentPage && !isLoading ) onPageChange( page as number );
                  } }
                  isActive={ page === currentPage }
                >
                  { page }
                </PaginationLink>
              </PaginationItem>
            )
          ) }

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={ ( e ) => {
                e.preventDefault();
                if ( currentPage < lastPage && !isLoading ) onPageChange( currentPage + 1 );
              } }
              className={ currentPage === lastPage || isLoading ? "pointer-events-none opacity-50" : "" }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ProductPagination;