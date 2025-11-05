"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Markup } from "interweave";
import { Edit, Heart, Minus, Plus, Star } from "lucide-react";
import Image from "next/image";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import RatingStars from "@/components/rating-stars";
import AddToCartButton from "@/components/add-to-cart-button";
import { VariantSelector } from "@/components/variant-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lens } from "@/components/ui/lens";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authStorage } from "@/lib/auth-storage";
import { ProductType } from "@/enums/product.enum";
import { CheckoutType } from "@/enums/checkout.enum";
import { productService } from "@/services/product.service";
import type { Product, Color, Size, Planter, ProductVariant } from "@/types/product";
import type { ProductReview } from "@/types/product-review.types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import api from "@/lib/axios";
import { Review } from "@/types/review.type";

const fetcher = async ( url: string ) => {
  const response = await api.request({ url });
  return response.data;
};

const productFetcher = async ( url: string ) => {
  const response = await productService.getById(Number(url.split('/').pop()));
  return {
    success: response.success,
    message: response.message,
    data: { product: response.data.product }
  };
};

const reviewSchema = z.object( {
  rating: z.number().min( 1, "Rating is required." ).max( 5 ),
  review: z.string().min( 1, "Review text is required." ),
} );

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    product: Product;
  };
}

interface CanReviewResponse {
  status: boolean;
  message: string;
  data: {
    can_review: boolean;
    reviewed: boolean;
    review: Review | null;
  };
}

interface ReviewsResponse {
  data: {
    data: Review[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

function ReviewForm( {
  review,
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  review?: Review;
  onCancel: () => void;
  onSubmit: ( reviewId: number | null, values: ReviewFormValues ) => void;
  isSubmitting: boolean;
} ) {
  const form = useForm<ReviewFormValues>( {
    resolver: zodResolver( reviewSchema ),
    defaultValues: {
      rating: review?.rating || 0,
      review: review?.review || "",
    },
  } );

  const handleSubmit = ( values: ReviewFormValues ) => {
    onSubmit( review?.id || null, values );
  };

  return (
    <Form { ...form }>
      <form onSubmit={ form.handleSubmit( handleSubmit ) } className="mt-4 p-4 border rounded-lg bg-muted/20 space-y-4">
        <h4 className="text-lg font-semibold">
          { review ? "Edit Your Review" : "Add a Review" }
        </h4>
        <FormField
          control={ form.control }
          name="rating"
          render={ ( { field } ) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <div className="flex">
                  { Array.from( { length: 5 }, ( _, i ) => (
                    <Star
                      key={ `star-${ i }` }
                      className={ `h-5 w-5 cursor-pointer ${ i < field.value ? "text-yellow-400 fill-yellow-400" : "text-gray-300" } hover:text-yellow-400` }
                      onClick={ () => field.onChange( i + 1 ) }
                    />
                  ) ) }
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          ) }
        />
        <FormField
          control={ form.control }
          name="review"
          render={ ( { field } ) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea placeholder="Write your review..." className="min-h-32" { ...field } />
              </FormControl>
              <FormMessage />
            </FormItem>
          ) }
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={ isSubmitting }>
            { isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-accent-foreground" />
                Submitting...
              </>
            ) : review ? (
              "Update Review"
            ) : (
              "Submit Review"
            ) }
          </Button>
          <Button type="button" variant="outline" onClick={ onCancel } disabled={ isSubmitting }>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ProductGallery( {
  images,
  currentImageIndex,
  onImageChange,
}: {
  images: Array<{ id: number; url: string }>;
  currentImageIndex: number;
  onImageChange: ( index: number ) => void;
} ) {
  if ( images.length <= 1 ) return null;

  return (
    <div className="flex justify-center gap-2 overflow-x-auto pb-2">
      { images.map( ( image, index ) => (
        <button
          key={ image.id }
          onClick={ () => onImageChange( index ) }
          className={ `relative h-16 w-16 border-2 rounded-md overflow-hidden shrink-0 transition-all ${ currentImageIndex === index
              ? "border-primary ring-2 ring-primary/20"
              : "border-gray-300 hover:border-gray-400"
            }` }
        >
          <Image
            src={ image.url }
            alt={ `Product image ${ index + 1 }` }
            fill
            className="object-cover"
            sizes="64px"
          />
        </button>
      ) ) }
    </div>
  );
}

function ProductHeader( { product }: { product: Product } ) {
  return (
    <div>
      <Badge variant="outline" className="mb-2">
        { product.category.name }
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight">{ product.name }</h1>
      <p className="text-muted-foreground italic mt-1">{ product.nick_name }</p>
    </div>
  );
}

function StockStatus( { isInStock }: { isInStock: boolean } ) {
  return (
    <div className="flex items-center gap-2">
      { isInStock ? (
        <>
          <div className="h-2 w-2 bg-green-500 rounded-full" />
          <span className="text-green-500">In Stock</span>
        </>
      ) : (
        <span className="text-destructive">Out of Stock</span>
      ) }
    </div>
  );
}

function QuantitySelector( {
  quantity,
  maxStock,
  onChange
}: {
  quantity: number;
  maxStock: number;
  onChange: ( value: number ) => void;
} ) {
  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        onClick={ () => onChange( quantity - 1 ) }
        disabled={ quantity <= 1 }
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        min="1"
        max={ maxStock }
        value={ quantity }
        onChange={ ( e ) => onChange( Number( e.target.value ) ) }
        className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        onClick={ () => onChange( quantity + 1 ) }
        disabled={ quantity >= maxStock }
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function PriceDisplay( { price, basePrice }: { price: number; basePrice?: number } ) {
  const hasDiscount = basePrice && price < basePrice;

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-foreground">₹{ price }</span>
      { hasDiscount && (
        <span className="text-lg text-muted-foreground line-through ml-2">
          ₹{ basePrice }
        </span>
      ) }
    </div>
  );
}

export default function ProductPage( { params }: Props ) {
  const { id } = use( params );
  const isAuth = authStorage.isAuthenticated();
  const [ quantity, setQuantity ] = useState( 1 );
  const [ isWishlistLoading, setIsWishlistLoading ] = useState( false );
  const [ isFavorite, setIsFavorite ] = useState( false );
  const [ isSubmittingReview, setIsSubmittingReview ] = useState( false );
  const [ currentPage, setCurrentPage ] = useState( 1 );
  const [ editingReviewId, setEditingReviewId ] = useState<number | null>( null );
  const [ selectedColor, setSelectedColor ] = useState<Color>();
  const [ selectedSize, setSelectedSize ] = useState<Size>();
  const [ selectedPlanter, setSelectedPlanter ] = useState<Planter>();
  const [ selectedVariant, setSelectedVariant ] = useState<ProductVariant>();
  const [ isUserInteracting, setIsUserInteracting ] = useState( false );
  const [ currentImageIndex, setCurrentImageIndex ] = useState( 0 );
  const [ selectedImages, setSelectedImages ] = useState<Array<{ id: number; url: string }>>( [] );

  const productUrl = `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/products/${ id }`;
  const { data: response, error, isLoading } = useSWR<ApiResponse>( productUrl, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  } );

  const canReviewUrl = `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/product/${ id }/can-review`;
  const { data: canReviewData, mutate: mutateCanReview } = useSWR<CanReviewResponse>(
    isAuth ? canReviewUrl : null,
    fetcher
  );

  const reviewsUrl = `${ process.env.NEXT_PUBLIC_BACKEND_API_URL }/product/${ id }/reviews?page=${ currentPage }`;
  const { data: reviewsData, mutate: mutateReviews } = useSWR<ReviewsResponse>( reviewsUrl, fetcher );

  const product = response?.data?.product;
  const reviews = reviewsData?.data?.data || [];
  const userReview = canReviewData?.data?.review;
  const canReview = canReviewData?.data?.can_review;
  const hasReviewed = canReviewData?.data?.reviewed;

  const averageRating = useMemo(
    () => reviews.length ? reviews.reduce( ( sum, review ) => sum + review.rating, 0 ) / reviews.length : 0,
    [ reviews ]
  );

  const reviewCount = reviews.length;
  const productImage = selectedImages[ currentImageIndex ]?.url ?? product?.thumbnail_url ?? "/placeholder.jpg";

  const maxStock = useMemo(
    () => selectedVariant?.stock_quantity ?? product?.default_variant?.stock_quantity ?? product?.inventory?.stock_quantity ?? 0,
    [ selectedVariant, product ]
  );

  const displayPrice = useMemo(
    () => selectedVariant?.price ?? product?.default_variant?.price ?? 0,
    [ selectedVariant, product ]
  );

  const displayBasePrice = useMemo(
    () => selectedVariant?.base_price ?? product?.default_variant?.base_price,
    [ selectedVariant, product ]
  );

  const isInStock = useMemo(
    () => product?.has_variants ? selectedVariant?.is_instock : product?.default_variant?.is_instock ?? product?.inventory?.is_instock,
    [ product, selectedVariant ]
  );

  const getAvailableColors = useCallback( () => {
    return product?.variant_options?.colors?.filter( ( color ) =>
      product.variants?.some(
        ( variant ) =>
          variant.variant.color?.id === color.id &&
          variant.variant.planter?.id === selectedPlanter?.id
      )
    ) ?? [];
  }, [ product, selectedPlanter ] );

  const getAvailableSizes = useCallback( () => {
    return product?.variant_options?.sizes?.filter( ( size ) =>
      product.variants?.some(
        ( variant ) =>
          variant.variant.size?.id === size.id &&
          variant.variant.planter?.id === selectedPlanter?.id &&
          ( !selectedColor || variant.variant.color?.id === selectedColor.id )
      )
    ) ?? [];
  }, [ product, selectedPlanter, selectedColor ] );

  const getAvailablePlanters = useCallback( () => {
    return product?.variant_options?.planters?.filter( ( planter ) =>
      product.variants?.some(
        ( variant ) =>
          variant.variant.planter?.id === planter.id &&
          ( !selectedColor || variant.variant.color?.id === selectedColor.id ) &&
          ( !selectedSize || variant.variant.size?.id === selectedSize.id )
      )
    ) ?? [];
  }, [ product, selectedColor, selectedSize ] );

  useEffect( () => {
    if ( !isAuth && typeof window !== "undefined" ) {
      try {
        const guestWishlist = localStorage.getItem( "guest_wishlist" );
        if ( guestWishlist ) {
          const items = JSON.parse( guestWishlist );
          const isInWishlist = items.some(
            ( item: any ) => item.id === Number( id ) && item.type === "product"
          );
          setIsFavorite( isInWishlist );
        }
      } catch ( err ) {
        console.error( "Failed to check guest wishlist:", err );
      }
    }
  }, [ id, isAuth ] );

  useEffect( () => {
    if ( product && isAuth ) {
      setIsFavorite( product.wishlist_tag ?? false );
    }
  }, [ product, isAuth ] );

  useEffect( () => {
    const images = selectedVariant?.images ||
      product?.default_variant?.images ||
      product?.image_urls?.map( ( url, index ) => ( { id: index, url } ) ) ||
      [];
    setSelectedImages( images );
    setCurrentImageIndex( 0 );
  }, [ selectedVariant, product ] );

  useEffect( () => {
    if ( product?.default_variant && !selectedVariant && !isUserInteracting ) {
      setSelectedVariant( product.default_variant );
      setSelectedColor( product.default_variant.variant.color );
      setSelectedSize( product.default_variant.variant.size );
      setSelectedPlanter( product.default_variant.variant.planter );
    }
  }, [ product?.default_variant, selectedVariant, isUserInteracting ] );

  useEffect( () => {
    if ( !product?.variants || !selectedPlanter ) return;

    const variant = product.variants.find(
      ( v ) =>
        v.variant.color?.id === selectedColor?.id &&
        v.variant.size?.id === selectedSize?.id &&
        v.variant.planter?.id === selectedPlanter?.id
    );
    setSelectedVariant( variant );
  }, [ product, selectedColor, selectedSize, selectedPlanter ] );

  const handleQuantityChange = useCallback( ( value: number ) => {
    if ( !isNaN( value ) && value >= 1 && value <= maxStock ) {
      setQuantity( value );
    } else if ( value > maxStock ) {
      setQuantity( maxStock );
    }
  }, [ maxStock ] );

  const handleVariantSelect = useCallback( ( type: 'color' | 'size' | 'planter', value: any ) => {
    setIsUserInteracting( true );

    switch ( type ) {
      case 'color':
        setSelectedColor( value );
        if ( selectedPlanter ) {
          const hasValidSize = product?.variants?.some(
            ( variant ) =>
              variant.variant.color?.id === value.id &&
              variant.variant.size?.id === selectedSize?.id &&
              variant.variant.planter?.id === selectedPlanter.id
          );
          if ( !hasValidSize && selectedSize ) {
            setSelectedSize( undefined );
          }
        }
        break;
      case 'size':
        setSelectedSize( value );
        if ( selectedPlanter ) {
          const hasValidColor = product?.variants?.some(
            ( variant ) =>
              variant.variant.size?.id === value.id &&
              variant.variant.color?.id === selectedColor?.id &&
              variant.variant.planter?.id === selectedPlanter.id
          );
          if ( !hasValidColor && selectedColor ) {
            setSelectedColor( undefined );
          }
        }
        break;
      case 'planter':
        setSelectedPlanter( value );
        setSelectedColor( undefined );
        setSelectedSize( undefined );
        break;
    }
  }, [ product, selectedPlanter, selectedColor, selectedSize ] );

  const handleToggleFavorite = async () => {
    setIsWishlistLoading( true );
    const newStatus = !isFavorite;

    if ( !isAuth ) {
      const { store } = await import( "@/store" );
      try {
        if ( newStatus ) {
          store.dispatch( {
            type: "wishlist/addToWishlist",
            payload: {
              id: Number( id ),
              name: product?.name || "Product",
              type: "product",
              price: displayPrice,
              image: productImage,
              slug: product?.slug,
            },
          } );
          toast.success( `Added ${ product?.name } to wishlist` );
        } else {
          store.dispatch( {
            type: "wishlist/removeFromWishlist",
            payload: { id: Number( id ), type: "product" },
          } );
          toast.success( `Removed ${ product?.name } from wishlist` );
        }
        setIsFavorite( newStatus );
      } catch {
        toast.error( "Failed to update wishlist" );
      } finally {
        setIsWishlistLoading( false );
        return;
      }
    }

    try {
      const { wishlistService } = await import( "@/services/wishlist.service" );
      await wishlistService.toggleWishlist( Number( id ) );
      setIsFavorite( newStatus );
      toast.success(
        newStatus
          ? `Added ${ product?.name } to wishlist`
          : `Removed ${ product?.name } from wishlist`
      );
    } catch ( err ) {
      toast.error(
        `Failed to update wishlist - ${ err instanceof Error ? err.message : "Unknown error" }`
      );
    } finally {
      setIsWishlistLoading( false );
    }
  };

  const handleReviewSubmit = async ( reviewId: number | null, values: ReviewFormValues ) => {
    if ( !isAuth ) return;
    setIsSubmittingReview( true );
    try {
      await api.request( {
        url: `/product-reviews${ reviewId ? `/${ reviewId }` : "" }`,
        method: reviewId ? "PUT" : "POST",
        data: {
          product_id: Number( id ),
          ...values,
        },
      } );
      toast.success( reviewId ? "Review updated successfully" : "Review added successfully" );
      setEditingReviewId( null );
      mutateCanReview();
      mutateReviews();
    } catch ( error ) {
      toast.error(
        `Failed to ${ reviewId ? "update" : "submit" } review - ${ error instanceof Error ? error.message : "Unknown error" }`
      );
    } finally {
      setIsSubmittingReview( false );
    }
  };

  if ( error ) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-96 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Product</h2>
            <p className="text-muted-foreground">
              { error.message.includes( "Failed to fetch" )
                ? "Network error. Please check your connection."
                : "Sorry, we couldn't load the product details." }
            </p>
            <Button onClick={ () => window.location.reload() } className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4 lg:sticky top-16 self-start">
          { isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : (
            <>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Lens zoomFactor={ 2 }>
                  <Image
                    src={ productImage }
                    alt={ product?.name ?? "Product" }
                    height={ 600 }
                    width={ 600 }
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                </Lens>
              </div>
              <ProductGallery
                images={ selectedImages }
                currentImageIndex={ currentImageIndex }
                onImageChange={ setCurrentImageIndex }
              />
            </>
          ) }
        </div>
        <div className="space-y-6">
          { isLoading ? (
            <>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </>
          ) : product ? (
            <>
              <ProductHeader product={ product } />

              <div>
                <h3 className="font-semibold text-sm">Botanical Name</h3>
                <p className="text-muted-foreground">{ product.botanical_name }</p>
              </div>

              <RatingStars rating={ averageRating } size="md" showCount reviewCount={ reviewCount } />

              { product.has_variants && product.variant_options && (
                <div className="space-y-6 border-b pb-8">
                  <VariantSelector
                    colors={ getAvailableColors() }
                    sizes={ getAvailableSizes() }
                    planters={ getAvailablePlanters() }
                    selectedColor={ selectedColor }
                    selectedSize={ selectedSize }
                    selectedPlanter={ selectedPlanter }
                    onColorSelect={ ( color ) => handleVariantSelect( 'color', color ) }
                    onSizeSelect={ ( size ) => handleVariantSelect( 'size', size ) }
                    onPlanterSelect={ ( planter ) => handleVariantSelect( 'planter', planter ) }
                  />

                  { selectedVariant && (
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Selected:</span>
                        <span className="text-sm bg-background px-2 py-1 rounded">
                          { selectedVariant.variant_name }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        { selectedVariant.is_instock ? (
                          <>
                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                            <span className="text-green-500 text-sm">
                              In Stock ({ selectedVariant.stock_quantity } available)
                            </span>
                          </>
                        ) : (
                          <span className="text-destructive text-sm">Out of Stock</span>
                        ) }
                      </div>
                      { !selectedVariant.is_instock && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Please select a different combination or check back later.
                        </div>
                      ) }
                    </div>
                  ) }
                </div>
              ) }

              { ( !product.has_variants || !selectedVariant ) && (
                <StockStatus isInStock={ product.inventory?.is_instock ?? false } />
              ) }

              { isInStock && (
                <div className="flex items-center gap-4">
                  <QuantitySelector
                    quantity={ quantity }
                    maxStock={ maxStock }
                    onChange={ handleQuantityChange }
                  />
                  <span className="text-sm text-muted-foreground">{ maxStock } available</span>
                  <PriceDisplay price={ displayPrice } basePrice={ displayBasePrice } />
                </div>
              ) }

              <div className="flex gap-3">
                <AddToCartButton
                  productId={ Number( id ) }
                  quantity={ quantity }
                  productType={ ProductType.ECOMMERCE }
                  cartType={ CheckoutType.CART }
                  disabled={
                    !product ||
                    ( product.has_variants && !selectedVariant ) ||
                    ( product.has_variants && selectedVariant && !selectedVariant.is_instock ) ||
                    ( !product.has_variants && !product.default_variant?.is_instock && !product.inventory?.is_instock )
                  }
                  productName={ product.name }
                  productPrice={ displayPrice }
                  productImage={ productImage }
                  selectedVariantId={ selectedVariant?.id }
                  selectedVariant={ selectedVariant }
                  product={ product }
                />
                <Button variant="outline" size="lg" onClick={ handleToggleFavorite } disabled={ isWishlistLoading }>
                  <Heart className={ `mr-2 h-5 w-5 ${ isFavorite ? "fill-current" : "" }` } />
                  { isFavorite ? "In Wishlist" : "Wishlist" }
                </Button>
              </div>
            </>
          ) : null }
        </div>
      </div>

      { !isLoading && product && (
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({ reviewCount })</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-4">
              <Card>
                <CardContent>
                  <Markup content={ product.description } />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="pt-4">
              <Card>
                <CardContent>
                  { reviewsData?.data.data?.length ? (
                    <div className="space-y-6">
                      { reviewsData.data.data.map( ( review ) => (
                        <div key={ review.id } className="border-b pb-4 last:border-0 last:pb-0">
                          { editingReviewId === review.id ? (
                            <ReviewForm
                              review={ review }
                              onCancel={ () => setEditingReviewId( null ) }
                              onSubmit={ handleReviewSubmit }
                              isSubmitting={ isSubmittingReview }
                            />
                          ) : (
                            <>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <RatingStars rating={ review.rating } size="sm" />
                                  <span className="font-semibold">{ review.user.name }</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  { new Date( review.created_at ).toLocaleDateString() }
                                </span>
                              </div>
                              <p className="mt-2">{ review.review }</p>
                              { review.id === userReview?.id && (
                                <Button variant="ghost" size="sm" onClick={ () => setEditingReviewId( review.id ) } className="mt-2">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              ) }
                            </>
                          ) }
                        </div>
                      ) ) }
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No reviews yet.</p>
                  ) }
                  { canReview && !hasReviewed && editingReviewId === null && (
                    <div className="mt-8">
                      <ReviewForm
                        onCancel={ () => { } }
                        onSubmit={ handleReviewSubmit }
                        isSubmitting={ isSubmittingReview }
                      />
                    </div>
                  ) }
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) }
    </div>
  );
}