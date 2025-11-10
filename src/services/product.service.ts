import { Product, Meta, ProductParams, ProductsApiResponse, ProductCategory, ProductCategoriesResponse } from "@/types/product.types";

const buildQuery = ( params: ProductParams ): string => {
  const query = new URLSearchParams();

  Object.entries( params ).forEach( ( [ key, value ] ) => {
    if ( value !== undefined && value !== null && value !== "" ) {
      query.set( key, String( value ) );
    }
  } );

  return query.toString();
};

class ProductService {
  private baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  async getProducts( params: ProductParams ): Promise<{ products: Product[]; meta: Meta }> {
    const query = buildQuery( params );
    const response = await fetch( `${ this.baseUrl }/products?${ query }` );
    const data: ProductsApiResponse = await response.json();

    if ( !data.success ) {
      throw new Error( data.message );
    }

    return { products: data.data.products, meta: data.data.meta };
  }

  async getCategories(): Promise<ProductCategory[]> {
    const response = await fetch( `${ this.baseUrl }/product-categories` );
    const data: ProductCategoriesResponse = await response.json();

    if ( !data.success ) {
      throw new Error( data.message );
    }

    return data.data.categories;
  }
}

export const productService = new ProductService();