"use client";

import { Loader2, Minus, Plus, ShoppingBag, Trash2, MapPin, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { storage } from "@/lib/storage";
import type { CartItem } from "@/types/cart";

interface CartResponse {
  status: boolean;
  data: CartItem[];
}

interface State {
  id: number;
  name: string;
}

interface Area {
  id: number;
  name: string;
  locationId: number;
}

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const DEFAULT_IMAGE = "/placeholder.jpg";
const MAX_DURATION = 50;
const MIN_QUANTITY = 1;

// API Fetcher
const fetcher = ( url: string ) =>
  fetch( url, {
    headers: { Authorization: `Bearer ${ storage.getToken() }` },
  } ).then( ( res ) => {
    if ( !res.ok ) throw new Error( "Failed to fetch cart" );
    return res.json();
  } );

// Search Modal Component
function SearchModal( {
  open,
  onClose,
  searchText,
  onSearchChange,
  dropdownData,
  onSelect,
  placeholder,
  isLoading = false,
}: {
  open: boolean;
  onClose: () => void;
  searchText: string;
  onSearchChange: ( text: string ) => void;
  dropdownData: ( State | Area )[];
  onSelect: ( item: State | Area ) => void;
  placeholder: string;
  isLoading?: boolean;
} ) {
  return (
    <Dialog open={ open } onOpenChange={ onClose }>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Search</DialogTitle>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={ placeholder }
              value={ searchText }
              onChange={ ( e ) => onSearchChange( e.target.value ) }
              className="pl-10"
              autoFocus
            />
          </div>

          <ScrollArea className="h-64">
            { isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : dropdownData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="space-y-2">
                { dropdownData.map( ( item ) => (
                  <Card
                    key={ item.id }
                    className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={ () => onSelect( item ) }
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{ item.name }</span>
                      </div>
                    </CardContent>
                  </Card>
                ) ) }
              </div>
            ) }
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add Detail Modal Component
function AddDetailModal( {
  open,
  onClose,
  item,
  onUpdateDetails,
}: {
  open: boolean;
  onClose: () => void;
  item: CartItem | null;
  onUpdateDetails: (
    cartId: number,
    details: { name: string; occasion: string; message: string; location_id: number }
  ) => void;
} ) {
  const [ formData, setFormData ] = useState( {
    name: "",
    occasion: "",
    message: "",
  } );
  const [ selectedState, setSelectedState ] = useState<State | null>( null );
  const [ selectedArea, setSelectedArea ] = useState<Area | null>( null );
  const [ states, setStates ] = useState<State[]>( [] );
  const [ areas, setAreas ] = useState<Area[]>( [] );
  const [ searchText, setSearchText ] = useState( "" );
  const [ dropdownData, setDropdownData ] = useState<( State | Area )[]>( [] );
  const [ currentSearchLevel, setCurrentSearchLevel ] = useState<"state" | "area" | null>( null );
  const [ searchPlaceholder, setSearchPlaceholder ] = useState( "Search State" );
  const [ isDropdownVisible, setDropdownVisible ] = useState( false );
  const [ isAreaLoading, setIsAreaLoading ] = useState( false );

  // Reset form when modal closes
  const resetForm = useCallback( () => {
    setFormData( { name: "", occasion: "", message: "" } );
    setSelectedState( null );
    setSelectedArea( null );
    setSearchText( "" );
    setDropdownVisible( false );
    setCurrentSearchLevel( null );
    setDropdownData( [] );
  }, [] );

  // Initialize form when item changes or modal opens
  useEffect( () => {
    if ( open && item ) {
      setFormData( {
        name: item.name || "",
        occasion: item.occasion || "",
        message: item.message || "",
      } );
    } else if ( !open ) {
      resetForm();
    }
  }, [ open, item, resetForm ] );

  // Fetch states on modal open
  useEffect( () => {
    const fetchStates = async () => {
      try {
        const response = await fetch( `${ API_BASE_URL }/api/tree-locations/states`, {
          headers: { Authorization: `Bearer ${ storage.getToken() }` },
        } );
        if ( response.ok ) {
          const data = await response.json();
          setStates( data.data || [] );
        }
      } catch ( error ) {
        console.error( "Failed to fetch states:", error );
      }
    };

    if ( open ) {
      fetchStates();
    }
  }, [ open ] );

  // Fetch areas when state is selected
  const fetchAreas = useCallback( async ( stateId: number ) => {
    setIsAreaLoading( true );
    try {
      const response = await fetch(
        `${ API_BASE_URL }/api/tree-locations/states/${ stateId }/areas`,
        {
          headers: { Authorization: `Bearer ${ storage.getToken() }` },
        }
      );
      if ( response.ok ) {
        const data = await response.json();
        const mappedAreas: Area[] = ( data.data || [] ).map( ( area: any ) => ( {
          id: area.area_id,
          name: area.area_name,
          locationId: area.location_id,
        } ) );
        setAreas( mappedAreas );
      }
    } catch ( error ) {
      console.error( "Failed to fetch areas:", error );
    } finally {
      setIsAreaLoading( false );
    }
  }, [] );

  const handleSelect = useCallback( ( selectedItem: State | Area ) => {
    if ( currentSearchLevel === "state" ) {
      const state = selectedItem as State;
      setSelectedState( state );
      setSelectedArea( null );
      setSearchPlaceholder( "Search Area" );
      fetchAreas( state.id );
    } else {
      setSelectedArea( selectedItem as Area );
    }
    setSearchText( "" );
    setDropdownVisible( false );
  }, [ currentSearchLevel, fetchAreas ] );

  const handleSearch = useCallback( ( text: string ) => {
    setSearchText( text );
    const list = currentSearchLevel === "state" ? states : areas;
    const filtered = list.filter( i =>
      i.name.toLowerCase().includes( text.toLowerCase() )
    );
    setDropdownData( filtered );
  }, [ currentSearchLevel, states, areas ] );

  const openSearchModal = useCallback( ( level: "state" | "area" ) => {
    setCurrentSearchLevel( level );
    setDropdownData( level === "state" ? states : areas );
    setSearchText( "" );
    setDropdownVisible( true );
  }, [ states, areas ] );

  const handleInputChange = useCallback( ( field: keyof typeof formData ) =>
    ( value: string ) => {
      setFormData( prev => ( { ...prev, [ field ]: value } ) );
    }, [] );

  const handleSubmit = useCallback( () => {
    if ( !formData.name || !formData.occasion || !selectedArea?.locationId || !item ) {
      alert( "Please complete all required fields." );
      return;
    }

    onUpdateDetails( item.id, {
      name: formData.name,
      occasion: formData.occasion,
      message: formData.message,
      location_id: selectedArea.locationId,
    } );

    resetForm();
    onClose();
  }, [ formData, selectedArea, item, onUpdateDetails, resetForm, onClose ] );

  const handleClose = useCallback( () => {
    resetForm();
    onClose();
  }, [ resetForm, onClose ] );

  return (
    <>
      <Dialog open={ open } onOpenChange={ ( open ) => !open && handleClose() }>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Add Details</DialogTitle>
          </div>

          <DialogDescription>
            Please provide the necessary details for your order.
          </DialogDescription>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {/* State Selection */ }
              <div>
                <label className="text-sm font-medium">State*</label>
                <Button
                  variant="outline"
                  className="w-full justify-between mt-1 h-11"
                  onClick={ () => openSearchModal( "state" ) }
                >
                  <span className={ selectedState ? "text-foreground" : "text-muted-foreground" }>
                    { selectedState ? selectedState.name : "Select State" }
                  </span>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Area Selection */ }
              { selectedState && (
                <div>
                  <label className="text-sm font-medium">Area*</label>
                  <Button
                    variant="outline"
                    className="w-full justify-between mt-1 h-11"
                    onClick={ () => openSearchModal( "area" ) }
                  >
                    <span className={ selectedArea ? "text-foreground" : "text-muted-foreground" }>
                      { selectedArea ? selectedArea.name : "Select Area" }
                    </span>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              ) }

              {/* Name Input */ }
              <div>
                <label className="text-sm font-medium">Name*</label>
                <Input
                  placeholder="Enter name"
                  value={ formData.name }
                  onChange={ ( e ) => handleInputChange( "name" )( e.target.value ) }
                  className="mt-1 h-11"
                />
              </div>

              {/* Occasion Input */ }
              <div>
                <label className="text-sm font-medium">Occasion*</label>
                <Input
                  placeholder="Enter occasion"
                  value={ formData.occasion }
                  onChange={ ( e ) => handleInputChange( "occasion" )( e.target.value ) }
                  className="mt-1 h-11"
                />
              </div>

              {/* Message Input */ }
              <div>
                <label className="text-sm font-medium">Special Message</label>
                <textarea
                  placeholder="Enter special message"
                  value={ formData.message }
                  onChange={ ( e ) => handleInputChange( "message" )( e.target.value ) }
                  className="w-full mt-1 p-3 border rounded-md min-h-[100px] resize-y text-sm"
                  rows={ 3 }
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={ handleClose } className="flex-1">
              Cancel
            </Button>
            <Button onClick={ handleSubmit } className="flex-1">
              Save Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Modal */ }
      <SearchModal
        open={ isDropdownVisible }
        onClose={ () => setDropdownVisible( false ) }
        searchText={ searchText }
        onSearchChange={ handleSearch }
        dropdownData={ dropdownData }
        onSelect={ handleSelect }
        placeholder={ searchPlaceholder }
        isLoading={ isAreaLoading && currentSearchLevel === "area" }
      />
    </>
  );
}

// Individual cart item component
function CartItemComponent( {
  item,
  isUpdating,
  onUpdateItem,
  onRemoveItem,
  onOpenDetailModal,
}: {
  item: CartItem;
  isUpdating: boolean;
  onUpdateItem: ( productId: number, params: Partial<CartItem> ) => void;
  onRemoveItem: ( itemId: number ) => void;
  onOpenDetailModal: ( item: CartItem ) => void;
} ) {
  const { imageUrl, productName, itemPrice, isTreeProduct } = useMemo( () => {
    const product = item.product_type === 1 ? item.product : item.ecom_product;
    const imageUrl = product?.main_image_url || DEFAULT_IMAGE;
    const productName = product?.name || "Product";
    const itemPrice = item.product_type === 1
      ? parseFloat( item.product?.price?.find( p => p.duration === item.duration )?.price || "0" )
      : item.ecom_product?.price || 0;

    return {
      imageUrl,
      productName,
      itemPrice,
      isTreeProduct: item.product_type === 1
    };
  }, [ item ] );

  const handleQuantityChange = useCallback( ( newQuantity: number ) => {
    onUpdateItem( item.product_id, {
      ...item,
      quantity: Math.max( MIN_QUANTITY, newQuantity )
    } );
  }, [ onUpdateItem, item ] );

  const handleDurationChange = useCallback( ( newDuration: number ) => {
    onUpdateItem( item.product_id, {
      ...item,
      duration: Math.max( MIN_QUANTITY, Math.min( MAX_DURATION, newDuration ) )
    } );
  }, [ onUpdateItem, item ] );

  const handleInputChange = useCallback( ( field: 'quantity' | 'duration' ) =>
    ( value: number ) => {
      const clampedValue = Math.max(
        MIN_QUANTITY,
        field === 'duration' ? Math.min( MAX_DURATION, value ) : value
      );

      onUpdateItem( item.product_id, {
        ...item,
        [ field ]: clampedValue
      } );
    }, [ onUpdateItem, item ] );

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start space-x-6">
          <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={ imageUrl }
              alt={ productName }
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>

          <div className="flex-1 space-y-4 min-w-0">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg truncate">{ productName }</h3>
              { !isTreeProduct && (
                <p className="text-sm text-muted-foreground truncate">
                  { item.ecom_product?.botanical_name }
                </p>
              ) }
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <div className="flex items-center border rounded-md mt-1 justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={ () => handleQuantityChange( item.quantity - 1 ) }
                      disabled={ item.quantity <= MIN_QUANTITY || isUpdating }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min={ MIN_QUANTITY.toString() }
                      value={ item.quantity }
                      onChange={ ( e ) => handleInputChange( 'quantity' )( parseInt( e.target.value ) || MIN_QUANTITY ) }
                      className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={ isUpdating }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={ () => handleQuantityChange( item.quantity + 1 ) }
                      disabled={ isUpdating }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                { isTreeProduct && (
                  <div>
                    <label className="text-sm font-medium">Duration (Years)</label>
                    <div className="flex items-center border rounded-md mt-1 justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={ () => handleDurationChange( item.duration - 1 ) }
                        disabled={ item.duration <= MIN_QUANTITY || isUpdating }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min={ MIN_QUANTITY.toString() }
                        max={ MAX_DURATION.toString() }
                        value={ item.duration }
                        onChange={ ( e ) => handleInputChange( 'duration' )( parseInt( e.target.value ) || MIN_QUANTITY ) }
                        className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        disabled={ isUpdating }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={ () => handleDurationChange( item.duration + 1 ) }
                        disabled={ item.duration >= MAX_DURATION || isUpdating }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) }
              </div>

              { isTreeProduct && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Details</label>
                    <Button
                      variant="outline"
                      className="w-full mt-1"
                      onClick={ () => onOpenDetailModal( item ) }
                    >
                      Edit Name, Occasion & Message
                    </Button>
                  </div>
                  { item.name && (
                    <p className="text-sm"><span className="font-medium">Name:</span> { item.name }</p>
                  ) }
                  { item.occasion && (
                    <p className="text-sm"><span className="font-medium">Occasion:</span> { item.occasion }</p>
                  ) }
                  { item.message && (
                    <p className="text-sm"><span className="font-medium">Message:</span> { item.message }</p>
                  ) }
                </div>
              ) }
            </div>

            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={ () => onRemoveItem( item.id ) }
                disabled={ isUpdating }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="text-right">
                <p className="text-lg font-bold">
                  ₹{ ( itemPrice * item.quantity ).toFixed( 2 ) }
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Order summary component
function OrderSummary( { subtotal }: { subtotal: number } ) {
  return (
    <Card className="sticky top-20">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{ subtotal.toFixed( 2 ) }</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-4 border-t">
            <span>Total</span>
            <span>₹{ subtotal.toFixed( 2 ) }</span>
          </div>
        </div>
        <Link href="/checkout">
          <Button className="w-full mt-6" size="lg">
            Place Order
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Empty cart state component
function EmptyCart() {
  return (
    <div className="text-center py-12">
      <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-6">Add some plants to get started</p>
      <Button asChild>
        <Link href="/products">Continue Shopping</Link>
      </Button>
    </div>
  );
}

// Loading component
function LoadingState() {
  return (
    <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

// Error component
function ErrorState( { onRetry }: { onRetry: () => void } ) {
  return (
    <div className="container mx-auto p-6 text-center">
      <p>Failed to load cart</p>
      <Button className="mt-4" onClick={ onRetry }>
        Retry
      </Button>
    </div>
  );
}

// Main cart page component
export default function CartPage() {
  const { data, error, isLoading, mutate } = useSWR<CartResponse>(
    `${ API_BASE_URL }/api/cart`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const [ updatingItems, setUpdatingItems ] = useState<Set<number>>( new Set() );
  const [ detailModalOpen, setDetailModalOpen ] = useState( false );
  const [ selectedItem, setSelectedItem ] = useState<CartItem | null>( null );

  const updateCart = useCallback( async (
    url: string,
    method: string,
    itemId: number,
    body?: object
  ) => {
    setUpdatingItems( prev => new Set( prev ).add( itemId ) );
    try {
      const response = await fetch( url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${ storage.getToken() }`,
        },
        ...( body && { body: JSON.stringify( body ) } ),
      } );

      if ( !response.ok ) throw new Error( `HTTP error! status: ${ response.status }` );

      mutate();
    } catch ( error ) {
      console.error( "Cart operation failed:", error );
    } finally {
      setUpdatingItems( prev => {
        const newSet = new Set( prev );
        newSet.delete( itemId );
        return newSet;
      } );
    }
  }, [ mutate ] );

  const updateCartItem = useCallback( async (
    productId: number,
    params: Partial<CartItem>
  ) => {
    await updateCart(
      `${ API_BASE_URL }/api/cart/add/${ productId }`,
      "POST",
      productId,
      params
    );
  }, [ updateCart ] );

  const updateCartDetails = useCallback( async (
    cartId: number,
    details: { name: string; occasion: string; message: string; location_id: number }
  ) => {
    await updateCart(
      `${ API_BASE_URL }/api/cart/addDetails/${ cartId }`,
      "POST",
      cartId,
      details
    );
  }, [ updateCart ] );

  const removeItem = useCallback( async ( itemId: number ) => {
    await updateCart(
      `${ API_BASE_URL }/api/cart/remove/${ itemId }`,
      "DELETE",
      itemId
    );
  }, [ updateCart ] );

  const handleOpenDetailModal = useCallback( ( item: CartItem ) => {
    setSelectedItem( item );
    setDetailModalOpen( true );
  }, [] );

  const handleCloseDetailModal = useCallback( () => {
    setDetailModalOpen( false );
    setSelectedItem( null );
  }, [] );

  const cartItems = data?.data || [];

  const subtotal = useMemo( () =>
    cartItems.reduce( ( sum, item ) => {
      let itemPrice = 0;
      if ( item.product_type === 1 && item.product?.price ) {
        const priceOption = item.product.price.find( p => p.duration === item.duration );
        itemPrice = priceOption ? parseFloat( priceOption.price ) : 0;
      } else if ( item.product_type === 2 && item.ecom_product?.price ) {
        itemPrice = item.ecom_product.price;
      }
      return sum + itemPrice * item.quantity;
    }, 0 ),
    [ cartItems ]
  );

  if ( error ) return <ErrorState onRetry={ () => mutate() } />;
  if ( isLoading ) return <LoadingState />;

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        { cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              { cartItems.map( ( item ) => (
                <CartItemComponent
                  key={ item.id }
                  item={ item }
                  isUpdating={ updatingItems.has( item.id ) }
                  onUpdateItem={ updateCartItem }
                  onRemoveItem={ removeItem }
                  onOpenDetailModal={ handleOpenDetailModal }
                />
              ) ) }
            </div>

            <div className="lg:col-span-4">
              <OrderSummary subtotal={ subtotal } />
            </div>
          </div>
        ) }

        {/* Add Detail Modal */ }
        <AddDetailModal
          open={ detailModalOpen }
          onClose={ handleCloseDetailModal }
          item={ selectedItem }
          onUpdateDetails={ updateCartDetails }
        />
      </div>
    </AppLayout>
  );
}