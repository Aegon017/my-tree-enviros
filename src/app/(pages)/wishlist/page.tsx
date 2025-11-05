"use client";

import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import WishlistItemCardSkeleton from "@/components/skeletons/wishlist-item-card-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  wishlistService,
  type WishlistItem,
} from "@/services/wishlist.service";
import { cartService } from "@/services/cart.service";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";

const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [removingIds, setRemovingIds] = useState<number[]>([]);
  const [addingToCartIds, setAddingToCartIds] = useState<number[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) {
        
        try {
          const guestWishlist = localStorage.getItem("guest_wishlist");
          if (guestWishlist) {
            setWishlistItems(JSON.parse(guestWishlist));
          }
        } catch (err) {
          console.error("Failed to load guest wishlist:", err);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await wishlistService.getWishlist();
        if (response.success) {
          setWishlistItems(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const handleRemove = async (itemId: number) => {
    setRemovingIds((prev) => [...prev, itemId]);

    try {
      if (isAuthenticated) {
        const response = await wishlistService.removeFromWishlist(itemId);
        if (response.success) {
          setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
          toast.success("Item removed from wishlist");
        }
      } else {
        
        const updatedWishlist = wishlistItems.filter(
          (item) => item.id !== itemId,
        );
        setWishlistItems(updatedWishlist);
        localStorage.setItem("guest_wishlist", JSON.stringify(updatedWishlist));
        toast.success("Item removed from wishlist");
      }
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      toast.error("Failed to remove item from wishlist");
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    
    if (!isAuthenticated) {
      setAddingToCartIds((prev) => [...prev, item.id]);
      try {
        const name = wishlistService.getProductName(item);
        const price = wishlistService.getProductPrice(item);
        const image =
          wishlistService.getProductImage(item) || "/placeholder.jpg";

        addToCart({
          id: item.product_id,
          product_id: item.product_id,
          name,
          type: "product",
          price,
          quantity: 1,
          image,
          metadata: {},
        } as any);

        toast.success(`${name} added to cart`);
      } catch (err) {
        console.error("Failed to add to cart:", err);
        toast.error("Failed to add item to cart");
      } finally {
        setAddingToCartIds((prev) => prev.filter((id) => id !== item.id));
      }
      return;
    }

    
    toast.error("Please use 'Move to Cart' while logged in");
  };

  const handleMoveToCart = async (itemId: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to move items to cart");
      return;
    }

    setAddingToCartIds((prev) => [...prev, itemId]);

    try {
      const response = await wishlistService.moveToCart(itemId);
      if (response.success) {
        setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
        toast.success("Item moved to cart");
      }
    } catch (err) {
      console.error("Failed to move to cart:", err);
      toast.error("Failed to move item to cart");
    } finally {
      setAddingToCartIds((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleClearWishlist = async () => {
    if (!isAuthenticated) {
      localStorage.removeItem("guest_wishlist");
      setWishlistItems([]);
      toast.success("Wishlist cleared");
      return;
    }

    try {
      const response = await wishlistService.clearWishlist();
      if (response.success) {
        setWishlistItems([]);
        toast.success("Wishlist cleared");
      }
    } catch (err) {
      console.error("Failed to clear wishlist:", err);
      toast.error("Failed to clear wishlist");
    }
  };

  if (isLoading) {
    return (
      <Section>
        <SectionTitle
          align="center"
          title="Wishlist"
          subtitle="Your saved items and favorites are listed here."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <WishlistItemCardSkeleton key={`wishlist-skeleton-${index}`} />
          ))}
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <SectionTitle
          align="center"
          title="Wishlist"
          subtitle="Your saved items and favorites are listed here."
        />
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Unable to load wishlist
          </h3>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Section>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Section>
        <SectionTitle
          align="center"
          title="Wishlist"
          subtitle="Your saved items and favorites are listed here."
        />
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-4">
            Start adding your favorite trees and products to see them here!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sponsor-a-tree">
              <Button>Browse Trees</Button>
            </Link>
            <Link href="/store">
              <Button variant="outline">Browse Products</Button>
            </Link>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle
        align="center"
        title="Wishlist"
        subtitle={`You have ${wishlistItems.length} item${wishlistItems.length !== 1 ? "s" : ""} in your wishlist`}
      />

      <div className="flex justify-end mb-4">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearWishlist}
          disabled={wishlistItems.length === 0}
        >
          Clear All
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {wishlistItems.map((item) => {
          const productName = wishlistService.getProductName(item);
          const productPrice = wishlistService.getProductPrice(item);
          const productImage = wishlistService.getProductImage(item);
          const isAvailable = wishlistService.isAvailable(item);
          const isRemoving = removingIds.includes(item.id);
          const isAddingToCart = addingToCartIds.includes(item.id);

          return (
            <Card key={item.id} className="overflow-hidden p-0 gap-0">
              <CardHeader className="p-0">
                <div className="relative aspect-video">
                  {productImage ? (
                    <Image
                      src={productImage}
                      alt={productName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Heart className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {!isAvailable && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {productName}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    ₹{productPrice.toFixed(2)}
                  </span>
                  <Badge variant="outline">Product</Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                {isAuthenticated ? (
                  <Button
                    className="flex-1"
                    onClick={() => handleMoveToCart(item.id)}
                    disabled={!isAvailable || isAddingToCart}
                  >
                    {isAddingToCart ? (
                      "Adding..."
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Move to Cart
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => handleAddToCart(item)}
                    disabled={!isAvailable || isAddingToCart}
                  >
                    {isAddingToCart ? (
                      "Adding..."
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemove(item.id)}
                  disabled={isRemoving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </Section>
  );
};

export default WishlistPage;
