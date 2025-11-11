"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Markup } from "interweave";
import { Edit, Heart, Minus, Plus, Star } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import RatingStars from "@/components/rating-stars";
import AddToCartButton from "@/components/add-to-cart-button";
import { VariantSelector } from "@/components/variant-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authStorage } from "@/lib/auth-storage";
import { ProductType } from "@/enums/product.enum";
import { CheckoutType } from "@/enums/checkout.enum";
import type { Color, Size, Planter, ProductVariant } from "@/types/product.types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Review } from "@/types/review.type";
import { productService } from "@/services/product.service";
import { variantService } from "@/services/variant.service";
import { reviewService, ReviewFormValues } from "@/services/review.service";
import ImageGallery from "@/components/image-gallery";
import { LoginDialog } from "@/components/login-dialog";
import { useProductWishlist } from "@/hooks/use-product-wishlist";

const reviewSchema = z.object( {
  rating: z.number().min( 1 ).max( 5 ),
  review: z.string().min( 1 ),
} );

function ReviewForm( { review, onCancel, onSubmit, isSubmitting }: {
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

  return (
    <Form { ...form }>
      <form onSubmit={ form.handleSubmit( v => onSubmit( review?.id || null, v ) ) } className="mt-4 p-4 border rounded-lg bg-muted/20 space-y-4">
        <h4 className="text-lg font-semibold">{ review ? "Edit Your Review" : "Add a Review" }</h4>
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
                      key={ i }
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
                <Textarea className="min-h-32" { ...field } />
              </FormControl>
              <FormMessage />
            </FormItem>
          ) }
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={ isSubmitting }>{ isSubmitting ? "Submitting..." : review ? "Update Review" : "Submit Review" }</Button>
          <Button type="button" variant="outline" onClick={ onCancel } disabled={ isSubmitting }>Cancel</Button>
        </div>
      </form>
    </Form>
  );
}

export default function ProductPage( { params }: { params: Promise<{ slug: string }> } ) {
  const { slug } = use( params )
  const isAuth = authStorage.isAuthenticated();

  const [ quantity, setQuantity ] = useState( 1 );
  const [ isSubmittingReview, setIsSubmittingReview ] = useState( false );
  const [ currentPage ] = useState( 1 );
  const [ editingReviewId, setEditingReviewId ] = useState<number | null>( null );
  const [ selectedColor, setSelectedColor ] = useState<Color>();
  const [ selectedSize, setSelectedSize ] = useState<Size>();
  const [ selectedPlanter, setSelectedPlanter ] = useState<Planter>();
  const [ selectedVariant, setSelectedVariant ] = useState<ProductVariant>();
  const [ isUserInteracting, setIsUserInteracting ] = useState( false );
  const [ currentImageIndex, setCurrentImageIndex ] = useState( 0 );
  const [ selectedImages, setSelectedImages ] = useState<Array<{ id: number; url: string }>>( [] );

  const { data: product, error, isLoading } = useSWR(
    [ "product", slug ],
    () => productService.getProductBySlug( slug ),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: canReviewData, mutate: mutateCanReview } = useSWR(
    isAuth ? [ "can-review", slug ] : null,
    () => productService.canReviewBySlug( slug )
  );

  const { data: reviewsData, mutate: mutateReviews } = useSWR(
    [ "reviews", slug, currentPage ],
    () => productService.getReviewsBySlug( slug, currentPage )
  );

  const reviews = reviewsData?.data?.data || [];
  const userReview = canReviewData?.data?.review || null;
  const canReview = canReviewData?.data?.can_review;
  const hasReviewed = canReviewData?.data?.reviewed;
  const averageRating = useMemo( () => ( reviews.length ? reviews.reduce( ( s: number, r: any ) => s + r.rating, 0 ) / reviews.length : 0 ), [ reviews ] );
  const reviewCount = reviews.length;

  useEffect( () => {
    const im =
      selectedVariant?.image_urls ||
      product?.default_variant?.image_urls ||
      product?.image_urls?.map( ( url: string, i: number ) => ( { id: i, url } ) ) ||
      [];
    setSelectedImages( im );
    setCurrentImageIndex( 0 );
  }, [ selectedVariant, product ] );

  useEffect( () => {
    if ( product?.default_variant && !selectedVariant && !isUserInteracting ) {
      setSelectedVariant( product.default_variant as ProductVariant );
      setSelectedColor( product.default_variant?.variant?.color );
      setSelectedSize( product.default_variant?.variant?.size );
      setSelectedPlanter( product.default_variant?.variant?.planter );
    }
  }, [ product, selectedVariant, isUserInteracting ] );

  useEffect( () => {
    if ( !product?.variants || !selectedPlanter ) return;
    setSelectedVariant( variantService.resolveVariant( product, selectedColor, selectedSize, selectedPlanter ) );
  }, [ product, selectedColor, selectedSize, selectedPlanter ] );

  const productImage = selectedImages[ currentImageIndex ]?.url ?? product?.thumbnail_url ?? "/placeholder.jpg";
  const maxStock = selectedVariant?.stock_quantity ?? product?.default_variant?.stock_quantity ?? product?.inventory?.stock_quantity ?? 0;
  const displayPrice = selectedVariant?.selling_price ?? product?.default_variant?.selling_price ?? product?.selling_price ?? 0;
  const displayBasePrice = selectedVariant?.original_price ?? product?.default_variant?.original_price ?? product?.original_price ?? null;
  const isInStock = product?.has_variants ? selectedVariant?.is_instock : product?.default_variant?.is_instock ?? product?.inventory?.is_instock;
  const availableColors = useMemo( () => variantService.getAvailableColors( product, selectedPlanter ), [ product, selectedPlanter ] );
  const availableSizes = useMemo( () => variantService.getAvailableSizes( product ), [ product ] );
  const availablePlanters = useMemo( () => variantService.getAvailablePlanters( product, selectedSize ), [ product, selectedSize ] );

  const { isFavorite, loading: isWishlistLoading, toggleFavorite, loginOpen, setLoginOpen } =
    useProductWishlist( product?.id, selectedVariant?.id );

  const handleQuantityChange = ( v: number ) => setQuantity( Math.max( 1, Math.min( v, maxStock ) ) );

  const handleVariantSelect = ( t: "color" | "size" | "planter", v: any ) => {
    setIsUserInteracting( true );
    if ( t === "size" ) {
      setSelectedSize( v );
      if ( selectedPlanter && !product?.variants?.some( x => x.variant.size?.id === v.id && x.variant.planter?.id === selectedPlanter.id ) )
        setSelectedPlanter( undefined );
      if ( selectedColor && !product?.variants?.some( x => x.variant.size?.id === v.id && x.variant.color?.id === selectedColor.id ) )
        setSelectedColor( undefined );
    }
    if ( t === "planter" ) {
      setSelectedPlanter( v );
      setSelectedColor( undefined );
    }
    if ( t === "color" ) setSelectedColor( v );
  };

  const submitReview = async ( reviewId: number | null, v: ReviewFormValues ) => {
    if ( !authStorage.isAuthenticated() ) return;
    setIsSubmittingReview( true );
    try {
      if ( reviewId ) await reviewService.update( reviewId, slug, v );
      else await reviewService.submit( slug, v );
      toast.success( reviewId ? "Review updated" : "Review added" );
      setEditingReviewId( null );
      mutateCanReview();
      mutateReviews();
    } catch {
      toast.error( "Review error" );
    }
    setIsSubmittingReview( false );
  };

  if ( error ) {
    return (
      <div className="flex justify-center items-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Product</h2>
            <Button onClick={ () => window.location.reload() }>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 lg:sticky top-24 self-start">
          { isLoading ? (
            <Skeleton className="aspect-square rounded-2xl" />
          ) : product ? (
            <ImageGallery
              images={ selectedImages.map( img => img.url ) }
              name={ product.name }
            />
          ) : null }
        </div>
        <div className="space-y-6">
          { isLoading ? (
            <>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </>
          ) : product ? (
            <>
              <Badge variant="outline">{ product.category.name }</Badge>
              <h1 className="text-3xl font-bold">{ product.name }</h1>
              <p className="italic text-muted-foreground">{ product.nick_name }</p>
              <RatingStars rating={ averageRating } size="md" showCount reviewCount={ reviewCount } />

              { product.has_variants && (
                <div className="space-y-6 border-b pb-8">
                  <VariantSelector
                    colors={ availableColors }
                    sizes={ availableSizes }
                    planters={ availablePlanters }
                    selectedColor={ selectedColor }
                    selectedSize={ selectedSize }
                    selectedPlanter={ selectedPlanter }
                    onColorSelect={ v => handleVariantSelect( "color", v ) }
                    onSizeSelect={ v => handleVariantSelect( "size", v ) }
                    onPlanterSelect={ v => handleVariantSelect( "planter", v ) }
                  />

                  { selectedVariant && (
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      <div className="font-medium mb-1">{ selectedVariant.variant_name }</div>
                      { selectedVariant.is_instock ? `In Stock (${ selectedVariant.stock_quantity })` : "Out of Stock" }
                    </div>
                  ) }
                </div>
              ) }

              { ( !product.has_variants || !selectedVariant ) && (
                <div className="text-sm">{ product.inventory?.is_instock ? "In Stock" : "Out of Stock" }</div>
              ) }

              { isInStock && (
                <div className="flex gap-4 items-center">
                  <div className="flex border rounded-md items-center">
                    <Button variant="ghost" size="icon" onClick={ () => handleQuantityChange( quantity - 1 ) } disabled={ quantity <= 1 }>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input type="number" value={ quantity } onChange={ e => handleQuantityChange( +e.target.value ) } className="w-16 text-center border-0" />
                    <Button variant="ghost" size="icon" onClick={ () => handleQuantityChange( quantity + 1 ) } disabled={ quantity >= maxStock }>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-sm">{ maxStock } available</div>

                  <div className="flex gap-2 items-baseline">
                    <span className="text-3xl font-bold">₹{ displayPrice }</span>
                    { displayBasePrice && displayBasePrice > displayPrice && (
                      <span className="line-through text-muted-foreground">₹{ displayBasePrice }</span>
                    ) }
                  </div>
                </div>
              ) }

              <div className="flex gap-3">
                <AddToCartButton
                  productId={ product.id }
                  quantity={ quantity }
                  productType={ ProductType.ECOMMERCE }
                  cartType={ CheckoutType.CART }
                  disabled={ !product || ( product.has_variants && !selectedVariant ) || ( product.has_variants && !selectedVariant?.is_instock ) || ( !product.has_variants && !product.inventory?.is_instock ) }
                  productName={ product.name }
                  productPrice={ displayPrice }
                  productImage={ productImage }
                  selectedVariantId={ selectedVariant?.id }
                  selectedVariant={ selectedVariant }
                  product={ product }
                />

                <Button variant="outline" size="lg" onClick={ toggleFavorite } disabled={ isWishlistLoading }>
                  <Heart className={ `mr-2 h-5 w-5 ${ isFavorite ? "fill-current" : "" }` } />
                  { isFavorite ? "In Wishlist" : "Wishlist" }
                </Button>
                <LoginDialog open={ loginOpen } onOpenChange={ setLoginOpen } />
              </div>
            </>
          ) : null }
        </div>
      </div>

      { !isLoading && product && (
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="grid grid-cols-2">
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
                  { reviews.length > 0 ? (
                    <div className="space-y-6">
                      { reviews.map( ( r: any ) => (
                        <div key={ r.id } className="border-b pb-4">
                          { editingReviewId === r.id ? (
                            <ReviewForm review={ r } onCancel={ () => setEditingReviewId( null ) } onSubmit={ submitReview } isSubmitting={ isSubmittingReview } />
                          ) : (
                            <>
                              <div className="flex justify-between items-start">
                                <div className="flex gap-2 items-center">
                                  <RatingStars rating={ r.rating } size="sm" />
                                  <span className="font-semibold">{ r.user.name }</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{ new Date( r.created_at ).toLocaleDateString() }</span>
                              </div>
                              <p className="mt-2">{ r.review }</p>
                              { r.id === userReview?.id && (
                                <Button variant="ghost" size="sm" className="mt-2" onClick={ () => setEditingReviewId( r.id ) }>
                                  <Edit className="h-4 w-4 mr-1" /> Edit
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
                      <ReviewForm onCancel={ () => { } } onSubmit={ submitReview } isSubmitting={ isSubmittingReview } />
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