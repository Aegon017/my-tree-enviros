"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import type { CartItem } from "@/types/cart.type";
import { cartService } from "@/services/cart.service";
import { transformBackendCartItem } from "@/types/cart.type";
import { locationService } from "@/services/location.service";
import { useDispatch } from "react-redux";
import { setCartItems } from "@/store/cart-slice";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface State {
  id: number;
  name: string;
}

interface Area {
  id: number;
  name: string;
  locationId: number;
}

const detailsSchema = z.object( {
  state_id: z.string().min( 1, "State is required." ),
  area_id: z.string().min( 1, "Area is required." ),
  name: z.string().min( 1, "Name is required." ),
  occasion: z.string().min( 1, "Occasion is required." ),
  message: z.string().min( 1, "Message is required." ),
} );

type DetailsFormValues = z.infer<typeof detailsSchema>;

const DEFAULT_IMAGE = "/placeholder.jpg";
const MAX_DURATION = 50;
const MIN_QUANTITY = 1;

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
    details: {
      name: string;
      occasion: string;
      message: string;
      location_id: number;
    },
  ) => void;
} ) {
  const [ states, setStates ] = useState<State[]>( [] );
  const [ areas, setAreas ] = useState<Area[]>( [] );
  const [ isAreaLoading, setIsAreaLoading ] = useState( false );

  const form = useForm<DetailsFormValues>( {
    resolver: zodResolver( detailsSchema ),
    defaultValues: {
      state_id: "",
      area_id: "",
      name: "",
      occasion: "",
      message: "",
    },
  } );

  const watchedStateId = form.watch( "state_id" );

  useEffect( () => {
    if ( open && item ) {
      form.reset( {
        name: item.name || "",
        occasion: item.occasion || "",
        message: item.message || "",
        state_id: ( item.metadata as any )?.state_id
          ? String( ( item.metadata as any ).state_id )
          : "",
        area_id:
          item.metadata && ( item.metadata as any ).location_id
            ? String( ( item.metadata as any ).location_id )
            : "",
      } );
    }
  }, [ open, item, form ] );

  useEffect( () => {
    const fetchStates = async () => {
      try {
        const response = await locationService.getTreeLocationStates();
        setStates( response.data || [] );
      } catch ( err ) {
        console.error( "Failed to fetch states:", err );
      }
    };
    if ( open ) fetchStates();
  }, [ open ] );

  useEffect( () => {
    if ( !watchedStateId ) {
      setAreas( [] );
      return;
    }

    const fetchAreas = async ( stateId: string ) => {
      setIsAreaLoading( true );
      try {
        const response = await locationService.getTreeLocationAreas( Number( stateId ) );
        const mapped: Area[] = ( response.data || [] ).map( ( a: any ) => ( {
          id: a.area_id,
          name: a.area_name,
          locationId: a.location_id,
        } ) );
        setAreas( mapped );
      } catch ( err ) {
        console.error( "Failed to fetch areas:", err );
      } finally {
        setIsAreaLoading( false );
      }
    };

    fetchAreas( watchedStateId );
  }, [ watchedStateId ] );

  const onSubmit = ( values: DetailsFormValues ) => {
    if ( !item ) return;
    const selectedArea = areas.find(
      ( area ) => area.id.toString() === values.area_id,
    );
    if ( !selectedArea ) {
      form.setError( "area_id", { message: "Please select a valid area." } );
      return;
    }

    onUpdateDetails( item.id, {
      name: values.name,
      occasion: values.occasion,
      message: values.message,
      location_id: selectedArea.locationId,
    } );
    onClose();
  };

  return (
    <Dialog open={ open } onOpenChange={ onClose }>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Details</DialogTitle>
          <DialogDescription>
            Please provide the necessary details for your order.
          </DialogDescription>
        </DialogHeader>
        <Form { ...form }>
          <form
            onSubmit={ form.handleSubmit( onSubmit ) }
            className="space-y-4 grow overflow-hidden flex flex-col"
          >
            <ScrollArea className="grow pr-4">
              <div className="space-y-4">
                <FormField
                  control={ form.control }
                  name="state_id"
                  render={ ( { field } ) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>State*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={ cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground",
                              ) }
                            >
                              { field.value
                                ? states.find(
                                  ( state ) =>
                                    state.id.toString() === field.value,
                                )?.name
                                : "Select State" }
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                          <Command>
                            <CommandInput placeholder="Search state..." />
                            <CommandEmpty>No state found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-48">
                                { states.map( ( state ) => (
                                  <CommandItem
                                    value={ state.name }
                                    key={ state.id }
                                    onSelect={ () => {
                                      form.setValue(
                                        "state_id",
                                        state.id.toString(),
                                      );
                                      form.setValue( "area_id", "" );
                                    } }
                                  >
                                    <Check
                                      className={ cn(
                                        "mr-2 h-4 w-4",
                                        state.id.toString() === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      ) }
                                    />
                                    { state.name }
                                  </CommandItem>
                                ) ) }
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  ) }
                />

                <FormField
                  control={ form.control }
                  name="area_id"
                  render={ ( { field } ) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Area*</FormLabel>
                      <Popover>
                        <PopoverTrigger
                          asChild
                          disabled={ !watchedStateId || isAreaLoading }
                        >
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={ cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground",
                              ) }
                            >
                              { isAreaLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null }
                              { field.value
                                ? areas.find(
                                  ( area ) =>
                                    area.id.toString() === field.value,
                                )?.name
                                : "Select Area" }
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                          <Command>
                            <CommandInput placeholder="Search area..." />
                            <CommandEmpty>No area found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-48">
                                { areas.map( ( area ) => (
                                  <CommandItem
                                    value={ area.name }
                                    key={ area.id }
                                    onSelect={ () => {
                                      form.setValue(
                                        "area_id",
                                        area.id.toString(),
                                      );
                                    } }
                                  >
                                    <Check
                                      className={ cn(
                                        "mr-2 h-4 w-4",
                                        area.id.toString() === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      ) }
                                    />
                                    { area.name }
                                  </CommandItem>
                                ) ) }
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  ) }
                />

                <FormField
                  control={ form.control }
                  name="name"
                  render={ ( { field } ) => (
                    <FormItem>
                      <FormLabel>Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" { ...field } />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) }
                />

                <FormField
                  control={ form.control }
                  name="occasion"
                  render={ ( { field } ) => (
                    <FormItem>
                      <FormLabel>Occasion*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter occasion" { ...field } />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) }
                />

                <FormField
                  control={ form.control }
                  name="message"
                  render={ ( { field } ) => (
                    <FormItem>
                      <FormLabel>Special Message*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter special message"
                          { ...field }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) }
                />
              </div>
            </ScrollArea>
            <div className="flex space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={ onClose }
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={ form.formState.isSubmitting }
              >
                Save Details
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CartItemComponent( {
  item,
  isUpdating,
  onUpdateItem,
  onRemoveItem,
  onOpenDetailModal,
}: {
  item: CartItem;
  isUpdating: boolean;
  onUpdateItem: (
    cartId: number,
    params: { quantity?: number; duration?: number },
  ) => void;
  onRemoveItem: ( itemId: number ) => void;
  onOpenDetailModal: ( item: CartItem ) => void;
} ) {
  const {
    imageUrl,
    productName,
    itemPrice,
    isTreeProduct,
    variantInfo,
    stockInfo,
  } = useMemo( () => {
    const isProductItem = item.item_type === "product";
    const productData = isProductItem ? ( item.item as any )?.product : null;


    const productName =

      productData?.name ||

      item.item?.name ||

      item.ecom_product?.name ||
      item.name ||
      "Product";

    const imageUrl =

      item.item?.image ||
      productData?.thumbnail_url ||

      item.image ||
      item.ecom_product ||
      DEFAULT_IMAGE;
    const itemPrice =
      typeof item.price === "number"
        ? item.price
        : parseFloat( item.price as string ) || 0;

    const variantInfo = isProductItem
      ? {
        sku: item.item?.variant?.sku || item.item?.sku,
        color: item.item?.variant?.color || item.item?.color,
        size: item.item?.variant?.size || item.item?.size,
        planter: item.item?.variant?.planter,
        name: item.item?.variant?.name,
      }
      : null;

    const stockInfo = productData
      ? {
        quantity: productData.inventory?.stock_quantity || 0,
        isInStock: productData.inventory?.is_instock || false,
      }
      : null;

    return {
      imageUrl,
      productName,
      itemPrice,
      isTreeProduct: item.item_type === "tree",
      variantInfo,
      stockInfo,
    };
  }, [ item ] );

  const handleQuantityChange = useCallback(
    ( newQ: number ) => {
      onUpdateItem( item.id, {
        quantity: Math.max( MIN_QUANTITY, newQ ),
      } );
    },
    [ onUpdateItem, item.id ],
  );

  const handleDurationChange = useCallback(
    ( newD: number ) => {
      onUpdateItem( item.id, {
        duration: Math.max( MIN_QUANTITY, Math.min( MAX_DURATION, newD ) ),
      } );
    },
    [ onUpdateItem, item.id ],
  );

  const handleInputChange = useCallback(
    ( field: "quantity" | "duration" ) => ( value: number ) => {
      const clamped = Math.max(
        MIN_QUANTITY,
        field === "duration" ? Math.min( MAX_DURATION, value ) : value,
      );
      onUpdateItem( item.id, {
        [ field ]: clamped,
      } );
    },
    [ onUpdateItem, item.id ],
  );

  return (
    <Card className="mb-4 border border-border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-4 md:gap-6">
          <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-md overflow-hidden shrink-0">
            <Image
              src={ imageUrl }
              alt={ productName }
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 80px, 96px"
              priority
            />
          </div>

          <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
            <div>
              <h3 className="font-semibold text-base md:text-lg truncate">
                { productName }
              </h3>
              { !isTreeProduct && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground truncate">
                    { stockInfo ? `Stock: ${ stockInfo.quantity } available` : "" }
                  </p>
                  { variantInfo && (
                    <p className="text-xs text-primary font-medium">
                      { variantInfo.name ||
                        `${ variantInfo.color || "" } ${ variantInfo.size || "" } ${ variantInfo.planter || "" }`.trim() }
                    </p>
                  ) }
                </div>
              ) }
              { isTreeProduct && (
                <p className="text-sm text-muted-foreground truncate">
                  Tree { item.type === "tree" ? "(Sponsorship/Adoption)" : "" }
                </p>
              ) }
            </div>

            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground">
                  Quantity
                </label>
                <div className="flex items-center border border-input rounded-md bg-background">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-r-none hover:bg-accent transition-colors"
                    onClick={ () => handleQuantityChange( item.quantity - 1 ) }
                    disabled={ item.quantity <= MIN_QUANTITY || isUpdating }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min={ MIN_QUANTITY }
                    value={ item.quantity }
                    onChange={ ( e ) =>
                      handleInputChange( "quantity" )(
                        parseInt( e.target.value ) || MIN_QUANTITY,
                      )
                    }
                    className="w-12 text-center border-x-0 bg-transparent focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    disabled={ isUpdating }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-l-none hover:bg-accent transition-colors"
                    onClick={ () => handleQuantityChange( item.quantity + 1 ) }
                    disabled={
                      item.quantity >=
                      ( stockInfo?.quantity || Number.MAX_SAFE_INTEGER ) ||
                      isUpdating
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              { isTreeProduct && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Duration
                  </label>
                  <div className="flex items-center border border-input rounded-md bg-background">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-r-none hover:bg-accent transition-colors"
                      onClick={ () =>
                        handleDurationChange(
                          ( item.duration ?? MIN_QUANTITY ) - 1,
                        )
                      }
                      disabled={
                        ( item.duration ?? MIN_QUANTITY ) <= MIN_QUANTITY ||
                        isUpdating
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min={ MIN_QUANTITY }
                      max={ MAX_DURATION }
                      value={ item.duration ?? MIN_QUANTITY }
                      onChange={ ( e ) =>
                        handleInputChange( "duration" )(
                          parseInt( e.target.value ) || MIN_QUANTITY,
                        )
                      }
                      className="w-12 text-center border-x-0 bg-transparent focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={ isUpdating }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-l-none hover:bg-accent transition-colors"
                      onClick={ () =>
                        handleDurationChange(
                          ( item.duration ?? MIN_QUANTITY ) + 1,
                        )
                      }
                      disabled={
                        ( item.duration ?? MIN_QUANTITY ) >= MAX_DURATION ||
                        isUpdating
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) }
            </div>

            { isTreeProduct && (
              <div className="space-y-3 md:space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={ () => onOpenDetailModal( item ) }
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Edit Details
                </Button>
                <div className="text-sm space-y-1 text-foreground">
                  { item.name && (
                    <p>
                      <span className="font-medium">Name:</span> { item.name }
                    </p>
                  ) }
                  { item.occasion && (
                    <p>
                      <span className="font-medium">Occasion:</span>{ " " }
                      { item.occasion }
                    </p>
                  ) }
                  { item.message && (
                    <p>
                      <span className="font-medium">Message:</span>{ " " }
                      { item.message }
                    </p>
                  ) }
                </div>
              </div>
            ) }
          </div>

          <div className="flex flex-col items-end gap-3 md:gap-4">
            <p className="text-lg md:text-xl font-bold text-foreground">
              ₹{ ( itemPrice * item.quantity ).toFixed( 2 ) }
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={ () => onRemoveItem( item.id ) }
              disabled={ isUpdating }
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderSummary( {
  subtotal,
  onClearCart,
  isClearing,
}: {
  subtotal: number;
  onClearCart: () => void;
  isClearing: boolean;
} ) {
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
          <Button className="w-full mt-4" size="lg">
            Place Order
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full mt-3"
          onClick={ onClearCart }
          disabled={ isClearing }
        >
          { isClearing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null }
          Clear Cart
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-12">
      <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-6">
        Add some products and trees to get started
      </p>
      <Button asChild>
        <Link href="/store">Continue Shopping</Link>
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

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

export default function CartPage() {
  const {
    items: cartItems,
    loading,
    error,
    removeFromCart,
    updateItemQuantity,
    clearAllItems,
    addToCart,
    isGuest,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  const [ mounted, setMounted ] = useState( false );
  useEffect( () => setMounted( true ), [] );

  const cartData = cartItems || [];

  useEffect( () => {
    if ( mounted && isAuthenticated ) {
      const fetchCartFromBackend = async () => {
        try {
          const response = await cartService.getCart();
          if ( response.success && response.data ) {

            const cartData = response.data.cart || response.data;
            const items = cartData.items || [];
            const transformedItems = items.map( ( item: any ) => {

              return transformBackendCartItem( item );
            } );
            dispatch( setCartItems( transformedItems ) );
          }
        } catch ( err ) {
          console.error( "Failed to fetch cart from backend:", err );
        }
      };
      fetchCartFromBackend();
    }
  }, [ mounted, isAuthenticated, dispatch ] );

  const [ detailModalOpen, setDetailModalOpen ] = useState( false );
  const [ selectedItem, setSelectedItem ] = useState<CartItem | null>( null );
  const [ updatingItems, setUpdatingItems ] = useState<Set<number>>( new Set() );
  const [ isClearing, setIsClearing ] = useState( false );

  const handleOpenDetailModal = useCallback( ( item: CartItem ) => {
    setSelectedItem( item );
    setDetailModalOpen( true );
  }, [] );

  const handleCloseDetailModal = useCallback( () => {
    setDetailModalOpen( false );
    setSelectedItem( null );
  }, [] );

  const wrapAsyncAction = useCallback(
    async ( itemId: number, fn: () => Promise<any> ) => {
      setUpdatingItems( ( prev ) => new Set( prev ).add( itemId ) );
      try {
        await fn();
      } catch ( err ) {
        console.error( "Cart action failed:", err );
      } finally {
        setUpdatingItems( ( prev ) => {
          const s = new Set( prev );
          s.delete( itemId );
          return s;
        } );
      }
    },
    [],
  );

  const handleUpdateItem = useCallback(
    async (
      cartId: number,
      params: { quantity?: number; duration?: number },
    ) => {
      const item = cartData.find( ( item ) => item.id === cartId );
      if ( !item ) return;

      wrapAsyncAction( cartId, async () => {
        if ( isAuthenticated && !isGuest ) {
          await cartService.updateCartItem( item.cart_id || cartId, {
            quantity: params.quantity,
            duration: params.duration,
          } );
        }

        const productType = item.product_type;
        const productId =
          productType === 1 ? item.product?.id : item.ecom_product?.id;

        if ( !productId ) return;

        const payload = {
          type: item.type,
          product_type: productType,
          quantity: params.quantity ?? item.quantity,
        };

        await updateItemQuantity(
          cartId,
          item.type || "product",
          payload.quantity,
        );
      } );
    },
    [ wrapAsyncAction, updateItemQuantity, cartData, isAuthenticated, isGuest ],
  );

  const handleRemoveItem = useCallback(
    ( itemId: number ) => {
      const item = cartData.find( ( i ) => i.id === itemId );
      if ( !item ) return;
      wrapAsyncAction( itemId, async () => {
        if ( isAuthenticated && !isGuest ) {
          await cartService.removeCartItem( item.cart_id || itemId );
        }
        removeFromCart( itemId, item.type || "product" );
      } );
    },
    [ wrapAsyncAction, removeFromCart, cartData, isAuthenticated, isGuest ],
  );

  const handleUpdateDetails = useCallback(
    (
      cartId: number,
      details: {
        name: string;
        occasion: string;
        message: string;
        location_id: number;
      },
    ) => {
      wrapAsyncAction( cartId, async () => {
        const existing = cartData.find( ( i ) => i.id === cartId );
        if ( !existing ) return;
        await removeFromCart( cartId, existing.type || "product" );
        return Promise.resolve(
          addToCart( {
            ...existing,
            metadata: {
              ...( existing.metadata || {} ),
              ...details,
            },
          } as any ),
        );
      } );
    },
    [ wrapAsyncAction, removeFromCart, addToCart, cartData ],
  );

  const handleClearCart = useCallback( async () => {
    setIsClearing( true );
    try {
      if ( isAuthenticated && !isGuest ) {
        await cartService.clearCart();
      }
      await clearAllItems();
    } catch ( err ) {
      console.error( "Failed to clear cart:", err );
    } finally {
      setIsClearing( false );
    }
  }, [ clearAllItems, isAuthenticated, isGuest ] );

  const subtotal = useMemo(
    () =>
      cartData.reduce( ( sum, item ) => {
        const p =
          typeof item.price === "number"
            ? item.price
            : parseFloat( item.price ) || 0;
        return sum + p * item.quantity;
      }, 0 ),
    [ cartData ],
  );

  if ( error ) return <ErrorState onRetry={ () => window.location.reload() } />;
  if ( loading ) return <LoadingState />;

  return (
    <div className="container mx-auto py-16 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      { !mounted ? (
        <LoadingState />
      ) : cartData.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="lg:grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            { cartData.map( ( item ) => (
              <CartItemComponent
                key={ item.id }
                item={ item }
                isUpdating={ updatingItems.has( item.id ) }
                onUpdateItem={ handleUpdateItem }
                onRemoveItem={ handleRemoveItem }
                onOpenDetailModal={ handleOpenDetailModal }
              />
            ) ) }
          </div>

          <div className="lg:col-span-4">
            <OrderSummary
              subtotal={ subtotal }
              onClearCart={ handleClearCart }
              isClearing={ isClearing }
            />
          </div>
        </div>
      ) }

      { mounted && (
        <AddDetailModal
          open={ detailModalOpen }
          onClose={ handleCloseDetailModal }
          item={ selectedItem }
          onUpdateDetails={ handleUpdateDetails }
        />
      ) }
    </div>
  );
}