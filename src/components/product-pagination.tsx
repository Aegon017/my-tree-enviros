"use client";

import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface ProductPaginationProps {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const ProductPagination = ({
  currentPage,
  lastPage,
  perPage,
  total,
  onPageChange,
  isLoading = false
}: ProductPaginationProps) => {
  // Don't show pagination if there's only one page
  if (lastPage <= 1) {
    return null;
  }

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page links to show
    
    if (lastPage <= showPages) {
      // Show all pages if total pages is less than or equal to showPages
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(lastPage - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < lastPage) {
          pages.push(i);
        }
      }
      
      if (currentPage < lastPage - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (lastPage > 1) {
        pages.push(lastPage);
      }
    }
    
    return pages;
  };

  const getPageRangeText = () => {
    const from = (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, total);
    return `Showing ${from} to ${to} of ${total} products`;
  };

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="text-sm text-muted-foreground text-center">
        {getPageRangeText()}
      </div>
      
      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          {/* Previous button */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1 && !isLoading) {
                  onPageChange(currentPage - 1);
                }
              }}
              className={currentPage === 1 || isLoading ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {/* Page numbers */}
          {generatePageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isActive && !isLoading) {
                      onPageChange(pageNumber);
                    }
                  }}
                  isActive={isActive}
                  className={
                    isActive 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  }
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          {/* Next button */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < lastPage && !isLoading) {
                  onPageChange(currentPage + 1);
                }
              }}
              className={currentPage === lastPage || isLoading ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ProductPagination;