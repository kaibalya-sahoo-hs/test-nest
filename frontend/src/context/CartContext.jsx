import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initial state matches your backend getMyCart() return structure
  const [cart, setCart] = useState({
    items: [],
    subTotal: 0,
    discount: 0,
    total: 0,
    appliedCoupon: null,
  });
  const [loading, setLoading] = useState(false);

  // Helper: Get the latest user from storage (avoids stale closures)
  const getUser = () => JSON.parse(localStorage.getItem("user"));

  // Helper: Calculate totals for Guest Mode locally
  const calculateGuestTotals = (items) => {
    const subTotal = items.reduce((acc, item) => {
      return acc + Number(item.price || item.product?.price) * item.quantity;
    }, 0);
    return {
      items,
      subTotal,
      discount: 0,
      total: subTotal,
      appliedCoupon: null,
    };
  };

  // 1. FETCH CART
  const fetchCart = async (coupon = "") => {
    const user = getUser();
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/cart`);
      console.log(data);
      setCart(data.cart);
      return data.cart;
    } catch (err) {
      console.error("Fetch Cart Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. ADD TO CART
  const addToCart = async (product) => {

    if(product.stock < 1) {
      toast.error("Sorry, this product is out of stock.");
      return;
    }

    const user = getUser();
    if (user) {
      try {
        const res = await api.post("/cart/add", { productId: product.id });
        setCart(res.data.cart);
      } catch (err) {
        toast.error("Failed to add to cart");
      }
    } else {
      console.log(cart);
      let newItems = [...cart.items];
      // Look for product.id inside the nested structure
      const existing = newItems.find((item) => item.product.id === product.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        newItems.push({
          product: { ...product }, // Wrap it!
          quantity: 1,
        });
      }

      const guestState = calculateGuestTotals(newItems);
      console.log("Guest State", guestState);
      setCart(guestState);
      localStorage.setItem("cart", JSON.stringify(guestState));
    }
  };

  // 3. UPDATE QUANTITY
  const updateQuantity = async (productId, newQuantity, coupon, stock, currentQuantity) => {
    


    if (newQuantity < 1) return;
    const user = getUser();

    if (user) {
      const isIncreasing = currentQuantity < newQuantity;
    if( isIncreasing && stock == 0) {
      toast.error("Sorry, this product is out of stock.");
      return;
    }
      try {
        const res = await api.patch(`/cart/${productId}`, {
          quantity: newQuantity,
        });
        console.log(res.data.cart)
        setCart(res.data.cart);
      } catch (err) {
        toast.error("Update failed");
      }
    } else {
      if(newQuantity > stock){
        toast.error("Sorry, not enough stock available.");
        return;
      }
      const newItems = cart.items.map((item) => {
        console.log(item);
        return item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item;
      });
      const guestState = calculateGuestTotals(newItems);
      setCart(guestState);
      localStorage.setItem("cart", JSON.stringify(guestState));
    }
  };

  // 4. REMOVE ITEM
  const removeItem = async (productId, coupon) => {
    const user = getUser();
    if (user) {
      try {
        const res = await api.delete(`/cart/${productId}`);
        setCart(res.data);
        toast.success("Item removed");
        fetchCart(coupon);
      } catch (err) {
        toast.error("Removal failed");
      }
    } else {
      console.log("Trigreed");
      const newItems = cart.items.filter(
        (item) => item.product.id !== productId,
      );
      const guestState = calculateGuestTotals(newItems);
      setCart(guestState);
      localStorage.setItem("cart", JSON.stringify(guestState));
    }
  };

  // 5. SYNC GUEST CART TO SERVER (Call this on Login)
  const syncCartWithServer = async () => {
    const saved = localStorage.getItem("cart");
    const localCart = saved ? JSON.parse(saved) : null;
    if (localCart && localCart.items.length > 0) {
      const itemsToSync = localCart.items.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
      }));
      try {
        const res = await api.post("/cart/sync", { items: itemsToSync });
        setCart(res.data.cart);
        localStorage.removeItem("cart");
        toast.success("Guest items synced!");
      } catch (err) {
        console.error("Sync Error:", err);
      }
    }
  };

  // Initialize: Load from DB if logged in, or LocalStorage if guest
  useEffect(() => {
    const user = getUser();
    if (user) {
      fetchCart();
    } else {
      const saved = localStorage.getItem("cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        syncCartWithServer,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
