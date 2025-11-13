"use client";

import { useCart } from "@/hooks/use-cart";
import CartItemCard from "./cart-item-card";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import type { CartItem } from "@/types/cart.type";

interface Props {
  isBackendCart?: boolean;
}

export const CartList = ({ isBackendCart = false }: Props) => {
  const { items, loading, error, removeFromCart, clearAllItems } = useCart();
  const cart = items; 

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!cart || cart.length === 0) return <p>Your cart is empty.</p>;

  const handleUpdate = (productId: number, params: CartItem) => {
    
    if (isBackendCart) {
      
      
      console.log("Update backend cart item:", productId, params);
    } else {
      
      console.log("Update guest cart item:", productId, params);
    }
  };

  const handleRemove = (itemId: number) => {
    removeFromCart(itemId, "product");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">🛒 Your Cart</h2>
        
        {}
        {/* <div className="mb-6">
          {cart.reduce((total, item) => {
            const price = item.price || item.ecom_product?.selling_price || 0;
            return total + (price * item.quantity);
          }, 0) > 0 && (
            <div className="flex justify-between items-center text-lg font-semibold p-3 bg-muted rounded-md">
              <span>Total:</span>
              <span>
                ₹{cart.reduce((total, item) => {
                  const price = item.price || item.ecom_product?.selling_price || 0;
                  return total + (price * item.quantity);
                }, 0).toFixed(2)}
              </span>
            </div>
          )}
        </div> */}

        <div className="space-y-4">
          {cart.map((item: CartItem, index) => (
            <CartItemCard
              key={`${item.id}-${index}`}
              item={item}
              isUpdating={loading}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Button
            onClick={clearAllItems}
            variant="outline"
            disabled={loading}
          >
            Clear Cart
          </Button>
          
          {cart.length > 0 && (
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Proceed to Checkout
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
