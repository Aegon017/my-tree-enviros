"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "./ui/button";

export const CartList = () => {
  const { cartItems, loading, error, removeItem, clearCart } = useCart();
  const cart = cartItems?.data;

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!cart || cart.length === 0) return <p>Your cart is empty.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">🛒 Your Cart</h2>
      <ul>
        {cart.map((item) => (
          <li
            key={item.id}
            className="mb-4 p-2 border rounded flex justify-between items-center"
          >
            <div>
              <p>
                <strong>{item.ecom_product.name}</strong>
              </p>
              <p>Qty: {item.quantity}</p>
              <p>Price: ₹{item.ecom_product.price}</p>
            </div>
            <Button
              onClick={() => removeItem(item.id)}
              className="text-red-600 hover:underline"
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <Button
        onClick={clearCart}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Clear Cart
      </Button>
    </div>
  );
};
