"use client";

import { Heart, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import WishlistItemCardSkeleton from "@/components/skeletons/wishlist-item-card-skeleton";
import WishlistItemCard from "@/components/wishlist-item-card";
import { useAuth } from "@/hooks/use-auth";
import { wishlistService } from "@/services/wishlist.services";
import { WishlistItem } from "@/types/wishlist";

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  removingIds: number[];
  addingToCartIds: number[];
}

const TOAST_MESSAGES = {
  REMOVED: "Removed from wishlist",
  MOVED_TO_CART: "Moved to cart",
  CLEARED: "Wishlist cleared",
  ERROR: "Something went wrong",
} as const;

const useWishlist = () => {
  const [state, setState] = useState<WishlistState>({
    items: [],
    isLoading: true,
    removingIds: [],
    addingToCartIds: [],
  });

  const { isAuthenticated } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await wishlistService.getWishlist();
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          items: response.data!.wishlist.items || [],
        }));
      }
    } catch {
      toast.error(TOAST_MESSAGES.ERROR);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated]);

  const removeItem = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, removingIds: [...prev.removingIds, id] }));
    try {
      const response = await wishlistService.removeFromWishlist(id);
      if (response.success) {
        setState(prev => ({
          ...prev,
          items: prev.items.filter(item => item.id !== id),
        }));
        toast.success(TOAST_MESSAGES.REMOVED);
      }
    } catch {
      toast.error(TOAST_MESSAGES.ERROR);
    } finally {
      setState(prev => ({
        ...prev,
        removingIds: prev.removingIds.filter(itemId => itemId !== id),
      }));
    }
  }, []);

  const moveToCart = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, addingToCartIds: [...prev.addingToCartIds, id] }));
    try {
      const response = await wishlistService.moveToCart(id);
      if (response.success) {
        setState(prev => ({
          ...prev,
          items: prev.items.filter(item => item.id !== id),
        }));
        toast.success(TOAST_MESSAGES.MOVED_TO_CART);
      }
    } catch {
      toast.error(TOAST_MESSAGES.ERROR);
    } finally {
      setState(prev => ({
        ...prev,
        addingToCartIds: prev.addingToCartIds.filter(itemId => itemId !== id),
      }));
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return { ...state, removeItem, moveToCart };
};

const EmptyWishlistState = () => (
  <div className="text-center">
    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-4">Your wishlist is empty</h3>
    <Button asChild variant="outline">
      <Link href="/store">Browse Products</Link>
    </Button>
  </div>
);

const WishlistPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    items: wishlistItems,
    isLoading,
    removingIds,
    addingToCartIds,
    removeItem,
    moveToCart,
  } = useWishlist();

  const itemCountText = useMemo(() => {
    const count = wishlistItems.length;
    return `You have ${count} item${count !== 1 ? "s" : ""}`;
  }, [wishlistItems.length]);

  return (
    <Section>
      <SectionTitle
        align="center"
        title="Wishlist"
        subtitle={isLoading ? "Loading..." : itemCountText}
      />
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <WishlistItemCardSkeleton key={index} />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <EmptyWishlistState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {wishlistItems.map(item => (
            <WishlistItemCard
              key={item.id}
              item={item}
              isAuthenticated={isAuthenticated}
              onRemove={removeItem}
              onMoveToCart={moveToCart}
              removingIds={removingIds}
              addingToCartIds={addingToCartIds}
            />
          ))}
        </div>
      )}
    </Section>
  );
};

export default WishlistPage;