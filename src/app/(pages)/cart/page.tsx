"use client";

import {
  Loader2,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
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
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/hooks/use-cart";
import type { CartItem } from "@/types/cart.type";

interface State {
  id: number;
  name: string;
}

interface Area {
  id: number;
  name: string;
  locationId: number;
}

const DEFAULT_IMAGE = "/placeholder.jpg";
const MAX_DURATION = 50;
const MIN_QUANTITY = 1;

function SearchModal({
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
  onSearchChange: (text: string) => void;
  dropdownData: (State | Area)[];
  onSelect: (item: State | Area) => void;
  placeholder: string;
  isLoading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Search</DialogTitle>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <ScrollArea className="h-64">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : dropdownData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="space-y-2">
                {dropdownData.map((item) => (
                  <Card
                    key={item.id}
                    className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onSelect(item)}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddDetailModal({
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
}) {
  const [formData, setFormData] = useState({
    name: "",
    occasion: "",
    message: "",
  });
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [searchText, setSearchText] = useState("");
  const [dropdownData, setDropdownData] = useState<(State | Area)[]>([]);
  const [currentSearchLevel, setCurrentSearchLevel] = useState<
    "state" | "area" | null
  >(null);
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search State");
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isAreaLoading, setIsAreaLoading] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({ name: "", occasion: "", message: "" });
    setSelectedState(null);
    setSelectedArea(null);
    setSearchText("");
    setDropdownVisible(false);
    setCurrentSearchLevel(null);
    setDropdownData([]);
  }, []);

  useEffect(() => {
    if (open && item) {
      setFormData({
        name: item.name || "",
        occasion: item.occasion || "",
        message: item.message || "",
      });
    } else if (!open) {
      resetForm();
    }
  }, [open, item, resetForm]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/tree-locations/states`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (response.ok) {
          const json = await response.json();
          setStates(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch states:", err);
      }
    };

    if (open) fetchStates();
  }, [open]);

  const fetchAreas = useCallback(async (stateId: number) => {
    setIsAreaLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/tree-locations/states/${stateId}/areas`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (response.ok) {
        const json = await response.json();
        const mapped: Area[] = (json.data || []).map((a: any) => ({
          id: a.area_id,
          name: a.area_name,
          locationId: a.location_id,
        }));
        setAreas(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch areas:", err);
    } finally {
      setIsAreaLoading(false);
    }
  }, []);

  const handleSelect = useCallback(
    (sel: State | Area) => {
      if (currentSearchLevel === "state") {
        const st = sel as State;
        setSelectedState(st);
        setSelectedArea(null);
        setSearchPlaceholder("Search Area");
        fetchAreas(st.id);
      } else {
        setSelectedArea(sel as Area);
      }
      setSearchText("");
      setDropdownVisible(false);
    },
    [currentSearchLevel, fetchAreas],
  );

  const handleSearch = useCallback(
    (text: string) => {
      setSearchText(text);
      const list = currentSearchLevel === "state" ? states : areas;
      const filtered = list.filter((i) =>
        i.name.toLowerCase().includes(text.toLowerCase()),
      );
      setDropdownData(filtered);
    },
    [currentSearchLevel, states, areas],
  );

  const openSearchModal = useCallback(
    (level: "state" | "area") => {
      setCurrentSearchLevel(level);
      setDropdownData(level === "state" ? states : areas);
      setSearchText("");
      setDropdownVisible(true);
    },
    [states, areas],
  );

  const handleInputChange = useCallback(
    (field: keyof typeof formData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (
      !formData.name ||
      !formData.occasion ||
      !selectedArea?.locationId ||
      !item
    ) {
      alert("Please complete all required fields.");
      return;
    }
    onUpdateDetails(item.id, {
      name: formData.name,
      occasion: formData.occasion,
      message: formData.message,
      location_id: selectedArea.locationId,
    });
    resetForm();
    onClose();
  }, [formData, selectedArea, item, onUpdateDetails, resetForm, onClose]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Add Details</DialogTitle>
          </div>

          <DialogDescription>
            Please provide the necessary details for your order.
          </DialogDescription>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="state" className="text-sm font-medium">
                  State*
                </label>
                <Button
                  variant="outline"
                  className="w-full justify-between mt-1 h-11"
                  onClick={() => openSearchModal("state")}
                >
                  <span
                    className={
                      selectedState
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {selectedState ? selectedState.name : "Select State"}
                  </span>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {selectedState && (
                <div>
                  <label htmlFor="area" className="text-sm font-medium">
                    Area*
                  </label>
                  <Button
                    variant="outline"
                    className="w-full justify-between mt-1 h-11"
                    onClick={() => openSearchModal("area")}
                  >
                    <span
                      className={
                        selectedArea
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {selectedArea ? selectedArea.name : "Select Area"}
                    </span>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div>
                <label htmlFor="name" className="text-sm font-medium">
                  Name*
                </label>
                <Input
                  name="name"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name")(e.target.value)}
                  className="mt-1 h-11"
                />
              </div>

              <div>
                <label htmlFor="occasion" className="text-sm font-medium">
                  Occasion*
                </label>
                <Input
                  name="occasion"
                  placeholder="Enter occasion"
                  value={formData.occasion}
                  onChange={(e) =>
                    handleInputChange("occasion")(e.target.value)
                  }
                  className="mt-1 h-11"
                />
              </div>

              <div>
                <label htmlFor="message" className="text-sm font-medium">
                  Special Message
                </label>
                <textarea
                  name="message"
                  placeholder="Enter special message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message")(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-md min-h-[100px] resize-y text-sm"
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Save Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SearchModal
        open={isDropdownVisible}
        onClose={() => setDropdownVisible(false)}
        searchText={searchText}
        onSearchChange={handleSearch}
        dropdownData={dropdownData}
        onSelect={handleSelect}
        placeholder={searchPlaceholder}
        isLoading={isAreaLoading && currentSearchLevel === "area"}
      />
    </>
  );
}

function CartItemComponent({
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
  onRemoveItem: (itemId: number) => void;
  onOpenDetailModal: (item: CartItem) => void;
}) {
  const { imageUrl, productName, itemPrice, isTreeProduct } = useMemo(() => {
    const product = item.product_type === 1 ? item.product : item.ecom_product;
    const imageUrl = product?.main_image_url || DEFAULT_IMAGE;
    const productName = product?.name || "Product";
    let itemPrice = 0;
    if (item.product_type === 1 && Array.isArray(item.product?.price)) {
      const opt = item.product.price.find((p) => p.duration === item.duration);
      itemPrice = opt ? parseFloat(opt.price) : 0;
    } else if (
      item.product_type === 1 &&
      typeof item.product?.price === "number"
    ) {
      itemPrice = item.product.price;
    } else if (item.product_type === 2 && item.ecom_product?.price) {
      itemPrice = item.ecom_product.price;
    }
    return {
      imageUrl,
      productName,
      itemPrice,
      isTreeProduct: item.product_type === 1,
    };
  }, [item]);

  const handleQuantityChange = useCallback(
    (newQ: number) => {
      onUpdateItem(item.id, {
        quantity: Math.max(MIN_QUANTITY, newQ),
      });
    },
    [onUpdateItem, item.id],
  );

  const handleDurationChange = useCallback(
    (newD: number) => {
      onUpdateItem(item.id, {
        duration: Math.max(MIN_QUANTITY, Math.min(MAX_DURATION, newD)),
      });
    },
    [onUpdateItem, item.id],
  );

  const handleInputChange = useCallback(
    (field: "quantity" | "duration") => (value: number) => {
      const clamped = Math.max(
        MIN_QUANTITY,
        field === "duration" ? Math.min(MAX_DURATION, value) : value,
      );
      onUpdateItem(item.id, {
        [field]: clamped,
      });
    },
    [onUpdateItem, item.id],
  );

  return (
    <Card className="mb-4 border border-border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-4 md:gap-6">
          {/* Image */}
          <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={imageUrl}
              alt={productName}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 80px, 96px"
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
            <div>
              <h3 className="font-semibold text-base md:text-lg truncate">
                {productName}
              </h3>
              {!isTreeProduct && (
                <p className="text-sm text-muted-foreground truncate">
                  {item.ecom_product?.botanical_name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground">
                  Quantity
                </label>
                <div className="flex items-center border border-input rounded-md bg-background">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-r-none hover:bg-accent transition-colors"
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={item.quantity <= MIN_QUANTITY || isUpdating}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min={MIN_QUANTITY}
                    value={item.quantity}
                    onChange={(e) =>
                      handleInputChange("quantity")(
                        parseInt(e.target.value) || MIN_QUANTITY,
                      )
                    }
                    className="w-12 text-center border-x-0 bg-transparent focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    disabled={isUpdating}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-l-none hover:bg-accent transition-colors"
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    disabled={
                      item.quantity >=
                        (item.ecom_product?.quantity ||
                          item.product?.quantity) || isUpdating
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Duration Controls for Tree Products */}
              {isTreeProduct && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Duration
                  </label>
                  <div className="flex items-center border border-input rounded-md bg-background">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-r-none hover:bg-accent transition-colors"
                      onClick={() => handleDurationChange(item.duration - 1)}
                      disabled={item.duration <= MIN_QUANTITY || isUpdating}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min={MIN_QUANTITY}
                      max={MAX_DURATION}
                      value={item.duration}
                      onChange={(e) =>
                        handleInputChange("duration")(
                          parseInt(e.target.value) || MIN_QUANTITY,
                        )
                      }
                      className="w-12 text-center border-x-0 bg-transparent focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={isUpdating}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-l-none hover:bg-accent transition-colors"
                      onClick={() => handleDurationChange(item.duration + 1)}
                      disabled={item.duration >= MAX_DURATION || isUpdating}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Tree Product Details */}
            {isTreeProduct && (
              <div className="space-y-3 md:space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenDetailModal(item)}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Edit Details
                </Button>
                <div className="text-sm space-y-1 text-foreground">
                  {item.name && (
                    <p>
                      <span className="font-medium">Name:</span> {item.name}
                    </p>
                  )}
                  {item.occasion && (
                    <p>
                      <span className="font-medium">Occasion:</span>{" "}
                      {item.occasion}
                    </p>
                  )}
                  {item.message && (
                    <p>
                      <span className="font-medium">Message:</span>{" "}
                      {item.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Price and Remove */}
          <div className="flex flex-col items-end gap-3 md:gap-4">
            <p className="text-lg md:text-xl font-bold text-foreground">
              ₹{(itemPrice * item.quantity).toFixed(2)}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveItem(item.id)}
              disabled={isUpdating}
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

function OrderSummary({
  subtotal,
  onClearCart,
  isClearing,
}: {
  subtotal: number;
  onClearCart: () => void;
  isClearing: boolean;
}) {
  return (
    <Card className="sticky top-20">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-4 border-t">
            <span>Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
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
          onClick={onClearCart}
          disabled={isClearing}
        >
          {isClearing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
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
        Add some plants to get started
      </p>
      <Button asChild>
        <Link href="/products">Continue Shopping</Link>
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

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="container mx-auto p-6 text-center">
      <p>Failed to load cart</p>
      <Button className="mt-4" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export default function CartPage() {
  const {
    cartItems,
    loading,
    error,
    removeItem,
    updateDetails,
    clearCart,
    addItem,
  } = useCart();

  const cartData = cartItems || [];

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [isClearing, setIsClearing] = useState(false);

  const handleOpenDetailModal = useCallback((item: CartItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  }, []);

  const wrapAsyncAction = useCallback(
    async (itemId: number, fn: () => Promise<any>) => {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      try {
        await fn();
      } catch (err) {
        console.error("Cart action failed:", err);
      } finally {
        setUpdatingItems((prev) => {
          const s = new Set(prev);
          s.delete(itemId);
          return s;
        });
      }
    },
    [],
  );

  const handleUpdateItem = useCallback(
    async (
      cartId: number,
      params: { quantity?: number; duration?: number },
    ) => {
      const item = cartData.find((item) => item.id === cartId);
      if (!item) return;

      wrapAsyncAction(cartId, async () => {
        const productType = item.product_type;
        const productId =
          productType === 1 ? item.product?.id : item.ecom_product?.id;

        if (!productId) return;

        const payload = {
          type: item.type,
          product_type: productType,
          quantity: params.quantity ?? item.quantity,
        };

        await addItem(productId, payload);
      });
    },
    [wrapAsyncAction, addItem, cartData],
  );

  const handleRemoveItem = useCallback(
    (itemId: number) => {
      wrapAsyncAction(itemId, () => removeItem(itemId));
    },
    [wrapAsyncAction, removeItem],
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
      wrapAsyncAction(cartId, () => updateDetails(cartId, details));
    },
    [wrapAsyncAction, updateDetails],
  );

  const handleClearCart = useCallback(async () => {
    setIsClearing(true);
    try {
      await clearCart();
    } catch (err) {
      console.error("Failed to clear cart:", err);
    } finally {
      setIsClearing(false);
    }
  }, [clearCart]);

  const subtotal = useMemo(
    () =>
      cartData.reduce((sum, item) => {
        let p = 0;

        if (item.product_type === 1 && item.product?.price) {
          if (Array.isArray(item.product.price)) {
            const opt = item.product.price.find(
              (pp) => pp.duration === item.duration,
            );
            if (opt) p = parseFloat(opt.price);
          } else if (typeof item.product.price === "number") {
            p = item.product.price;
          }
        }
        return sum + p * item.quantity;
      }, 0),
    [cartData],
  );

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;
  if (loading) return <LoadingState />;

  return (
    <div className="container mx-auto py-16 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartData.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="lg:grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {cartData.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                isUpdating={updatingItems.has(item.id)}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
                onOpenDetailModal={handleOpenDetailModal}
              />
            ))}
          </div>

          <div className="lg:col-span-4">
            <OrderSummary
              subtotal={subtotal}
              onClearCart={handleClearCart}
              isClearing={isClearing}
            />
          </div>
        </div>
      )}

      <AddDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        item={selectedItem}
        onUpdateDetails={handleUpdateDetails}
      />
    </div>
  );
}
