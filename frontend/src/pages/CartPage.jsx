// src/pages/CartPage.js
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiTag,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";
import api from "../utils/api";

const CartPage = () => {
  const { cart, fetchCart, updateQuantity, removeItem, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleCheckout = () => {
    if(!user){
      toast.error("Please login before checkout")
      sessionStorage.setItem('redirectTo', '/checkout');
      navigate("/login")
    }else{
      navigate('/checkout')
    }
  }

  const handleApplyCoupon = async () => {
    if (couponInput.trim() === "") {
      setCouponError("Please enter a coupon code");
      return;
    }
    setCouponError("");
    setIsApplying(true);
    try {
      const {data} = await api.post(`/users/applycoupon?coupon=${couponInput}`, {cartId: cart.id})
    
      if (data.success) {
        toast.success(`Coupon applied successfully!`);
        fetchCart()
      } else {
        setCouponError(data.message || "Invalid or expired coupon");
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || "Error applying coupon");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setCouponInput("");
    setCouponError("");
  };


  useEffect(() => {
    if (user && user?.role == "admin") {
      toast.error("This page doesnot belong to you")
      navigate("/admin/dashboard")
      return
    }
  }, [user])

  useEffect(() => {
    if(cart.coupon){
      setCouponInput(cart.coupon.displayName || cart.coupon.code || "")
    }
  }, [cart])


  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <div className="bg-blue-50 p-6 rounded-full mb-4 shadow-inner">
          <FiShoppingBag size={48} className="text-[#4379EE]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">
          Explore our products and add something to your cart!
        </p>
        <button
          className="mt-6 px-8 py-3 bg-[#4379EE] text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
          onClick={() => navigate("/products")}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mt-8 mb-6">
        <h1 className="text-3xl font-extrabold text-[#202224]">Your cart</h1>
        <p className="text-sm text-gray-500 mt-2">{cart.items && cart.items.length} items on your cart</p>
      </div>

      <div className="grid grid-cols-1 items-start">
        <div className="md:col-span-2 space-y-4">
          {/* Header row for desktop */}
          <div className="hidden md:flex items-center bg-transparent text-gray-500 text-xs font-bold px-4 py-3 rounded-t-lg">
            <div className="w-1/2">PRODUCT</div>
            <div className="w-1/6 text-right">PRICE</div>
            <div className="w-1/6 text-center">QUANTITY</div>
            <div className="w-1/6 text-right">TOTAL</div>
          </div>
          {cart.items.map((item) => (
            // IMPORTANT: use item.product.id for the key if it's unique
            <div
              key={item.product?.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4 hover:border-blue-200 transition-colors"
            >
                {/* Product Image - Mapping to item.product */}
                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-50">
                <img
                  src={item.product?.image}
                  alt={'Product image'}
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </div>

              {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-sm md:text-lg font-bold text-[#202224]">{item.product?.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">Product ID: {item.product?.id?.slice(0,8)}...</p>
                </div>

                {/* Price (desktop column) */}
                <div className="hidden md:flex md:w-1/6 md:justify-end">
                  <div className="text-sm text-gray-500 line-through mr-3">{<FaRupeeSign className="text-sm inline" />}{(Number(item.product?.price) * 1.2).toLocaleString('en-IN')}</div>
                  <div className="text-[#4379EE] font-extrabold flex items-center">{<FaRupeeSign className="text-sm inline" />}{Number(item.product?.price).toLocaleString('en-IN')}</div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-3 md:w-1/6 justify-center">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        item.quantity - 1,
                        couponInput,
                        item.product.stock,
                        item.quantity
                      )
                    }
                    className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="px-3 font-bold text-[#202224] min-w-[36px] text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        item.quantity + 1,
                        couponInput,
                        item.product.stock,
                        item.quantity
                      )
                    }
                    className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    aria-label="Increase quantity"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                {/* Total & Remove */}
                <div className="flex items-center gap-4 md:w-1/6 md:justify-end">
                  <div className="text-sm font-bold">{<FaRupeeSign className="text-sm inline" />}{(Number(item.product?.price) * item.quantity).toLocaleString('en-IN')}</div>
                  <button
                    onClick={() => removeItem(item.product.id, couponInput)}
                    className="text-gray-300 hover:text-red-500 rounded-full p-2"
                    aria-label="remove item"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
            </div>
          ))}
          <div>
            <button className="px-4 py-2 rounded-lg border border-blue-500 text-blue-500 cursor-pointer" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Right Side: Order Summary (Takes up 1 col) */}
        <div className="h-fit sm:w-full sm:flex sm:justify-end mt-10 sm:mt-0">
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-50 sticky top-24">
            <h2 className="text-lg font-bold text-[#202224] mb-4">Order Details</h2>

            {/* Coupon Section */}
            {user && (
              <div className="mb-8">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Promo Code
                </label>
                {cart.coupon ? (
                  <div className="space-y-2">
                    <div className="bg-green-50 text-green-700 text-sm font-bold p-3 rounded-xl flex items-center justify-between border border-green-100">
                      <div className="flex items-center gap-2">
                        <FiTag />
                        <span>{cart.coupon.displayName || cart.coupon.code}</span>
                        <span className="text-[10px] bg-green-100 px-2 py-0.5 rounded-full font-bold">
                          {cart.coupon.type === 'percentage' ? `${cart.coupon.discountValue}% OFF` : `₹${cart.coupon.discountValue} OFF`}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="p-1 hover:bg-green-100 rounded-lg transition-all"
                        title="Remove coupon"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          if (couponError) setCouponError("");
                        }}
                        placeholder="e.g. SUMMER20"
                        className={`flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#4379EE] outline-none uppercase font-bold text-[#202224] ${couponError ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplying}
                        className="bg-[#202224] text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-black disabled:opacity-50 transition-all uppercase tracking-tight"
                      >
                        {isApplying ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-[11px] font-bold ml-1">{couponError}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-500 font-medium text-sm">
                <span>Items</span>
                <span className="text-[#202224] font-bold">{cart.items && cart.items.length}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium text-sm">
                <span>Delivery Fee</span>
                <span className="text-green-500 font-bold">FREE</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs font-bold text-gray-400 uppercase mb-1">Total Price</div>
              <div className="text-3xl font-extrabold text-[#202224] flex items-center"> <FaRupeeSign />{cart.total && (cart.total).toLocaleString('en-IN')}</div>
            </div>

            <button aria-label="checkout btn" className="w-full py-3 bg-[#03a3ff] text-white font-extrabold rounded-lg hover:bg-[#5a3ee6] transition-all shadow-lg" onClick={handleCheckout}>
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
