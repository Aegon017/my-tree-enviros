import { Suspense } from "react";
import ProductsPageContent from "./products-content";

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
