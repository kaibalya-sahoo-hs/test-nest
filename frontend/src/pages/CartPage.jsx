// src/pages/CartPage.js
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiTag,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";

const CartPage = () => {
  const { cart, fetchCart, updateQuantity, removeItem } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleApplyCoupon = async () => {
    if (couponInput.trim() === "") {
      toast.error("Please enter a coupon code");
      return;
    }
    setIsApplying(true);
    try {
      const data = await fetchCart(couponInput);
      console.log(data);
      if (data && data.appliedCoupon) {
        toast.success(`Coupon "${data.appliedCoupon}" applied!`);
      } else {
        toast.error("Invalid or expired coupon");
      }
    } catch (err) {
      toast.error("Error applying coupon");
    } finally {
      setIsApplying(false);
    }
  };


  useEffect(() => {
    if(user && user?.role == "admin"){
      toast.error("This page doesnot belong to you")
      navigate("/admin/dashboard")
      return 
    }
  }, [user])


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
    <div className="max-w-7xl mx-auto ">
      <h1 className="text-3xl font-extrabold text-[#202224] mb-8 flex items-center gap-3">
        Shopping Cart
        <span className="text-sm bg-blue-100 text-[#4379EE] px-3 py-1 rounded-full">
          {cart.items && cart.items.length} Items
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <div className=" space-y-4 md:col-span-1">
          {cart.items.map((item) => (
            // IMPORTANT: use item.product.id for the key if it's unique
            <div
              key={item.product?.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 hover:border-blue-200 transition-colors"
            >
              {/* Product Image - Mapping to item.product */}
              <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-50">
                <img
                  src={item.product?.image}
                  alt={item.product?.name}
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-[#202224]">
                  {item.product?.name}
                </h3>
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  Product ID: {item.product?.id?.slice(0, 8)}...
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <span className="text-gray-400 line-through text-sm flex items-center">
                    <FaRupeeSign className="text-sm"/>{(Number(item.product?.price) * 1.2).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[#4379EE] text-xl flex items-center">
                    <FaRupeeSign className="text-sm"/><span className="font-extrabold ">{Number(item.product?.price).toLocaleString('en-IN')}</span>
                  </span>
                </div>
              </div>

              {/* Quantity Selector - Uses item.product.id */}
              <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                <button
                  onClick={() =>
                    updateQuantity(
                      item.product.id,
                      item.quantity - 1,
                      couponInput,
                    )
                  }
                  className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 disabled:opacity-30"
                  disabled={item.quantity <= 1}
                >
                  <FiMinus size={16} />
                </button>
                <span className="px-4 font-bold text-[#202224] min-w-[40px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(
                      item.product.id,
                      item.quantity + 1,
                      couponInput,
                    )
                  }
                  className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500"
                >
                  <FiPlus size={16} />
                </button>
              </div>

              {/* Remove Button - Uses item.product.id */}
              <button
                onClick={() => removeItem(item.product.id, couponInput)}
                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          ))}
          <div>
            <button className="px-4 py-2 rounded-lg bg-blue-500 text-white cursor-pointer" onClick={() => navigate('/products')}>
              Explore More
            </button>
          </div>
        </div>

        {/* Right Side: Order Summary (Takes up 1 col) */}
        <div className="md:col-span-1 md:sticky top-24 h-fit">
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-50 sticky top-24">
            <h2 className="text-xl font-bold text-[#202224] mb-6 flex items-center justify-between">
              Summary
              <FiShoppingBag className="text-gray-300" />
            </h2>

            {/* Coupon Section */}
            {user && (
              <div className="mb-8">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. SUMMER20"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#4379EE] outline-none uppercase font-bold text-[#202224]"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplying}
                    className="bg-[#202224] text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-black disabled:opacity-50 transition-all uppercase tracking-tight"
                  >
                    {isApplying ? "..." : "Apply"}
                  </button>
                </div>
                {cart.appliedCoupon && (
                  <div className="bg-green-50 text-green-700 text-[11px] font-bold mt-3 p-2 rounded-lg flex items-center gap-2 border border-green-100">
                    <FiTag /> {cart.appliedCoupon} APPLIED SUCCESSFULLY
                  </div>
                )}
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-4 mb-8 border-b pb-8 border-dashed border-gray-100">
              <div className="flex justify-between text-gray-500 font-medium text-sm">
                <span>Subtotal</span>
                <span className="text-[#202224] font-bold flex items-center">
                  <FaRupeeSign className="text-sm"/>{cart.subTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-green-600 font-bold text-sm">
                <span>Discount</span>
                <span className="flex items-center"> - <FaRupeeSign className="text-sm"/>{cart.discount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium text-sm">
                <span>Estimated Shipping</span>
                <span className="text-green-500 font-bold uppercase text-[10px] bg-green-50 px-2 py-0.5 rounded">
                  Free
                </span>
              </div>
            </div>

            <div className="mb-8 flex justify-between items-end">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase block mb-1">
                  Total Amount
                </span>
                <span className="text-4xl font-black text-[#202224] tracking-tighter flex items-center">
                  <FaRupeeSign/>{(cart.total).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            {user && (
              <button className="w-full py-4 bg-[#4379EE] text-white font-extrabold rounded-2xl hover:bg-[#3662c1] transition-all shadow-lg shadow-blue-100 hover:shadow-blue-200 active:scale-[0.98]">
                Proceed to Checkout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
