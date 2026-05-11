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
  FiTrash,
} from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { FaCross, FaRupeeSign } from "react-icons/fa";
import api from "../utils/api";

const CartPage = () => {
  const { cart, fetchCart, updateQuantity, removeItem, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
console.log(cart)
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

  // Ensure top of page is visible when this page mounts
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (err) {
      // ignore in non-browser environments
    }
  }, []);

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mt-8 mb-6">
        <h1 className="text-5xl font-extrabold text-[#202224]">Your cart</h1>
        <p className="text-lg text-gray-500 mt-2">{cart.items && cart.items.length} items on your cart</p>
      </div>

      <div className="grid grid-cols-1 items-start">
        <div className="md:col-span-2">
          {/* Header row for desktop (grid) */}
          <div className="grid grid-cols-12 items-center bg-transparent text-gray-500 text-xs font-bold px-4 py-3 rounded-t-lg">
            <div className="col-span-4">PRODUCT</div>
            <div className="col-span-2 text-center">PRICE</div>
            <div className="col-span-3 md:col-span-2 text-center">QUANTITY</div>
            <div className="col-span-2 text-center">TOTAL</div>
          </div>

          {cart.items.map((item) => (
            <div key={item.product?.id} className="bg-white rounded p-2 h-fit md:p-4 shadow-sm border border-gray-100 grid grid-cols-12 gap-4 items-center hover:border-blue-200 transition-colors">
              {/* Product */}
              <div className="col-span-4 flex justify-start items-center gap-4 md:mb-0 mb-4">
                <div className="w-17 h-17 sm:w-20 sm:h-20 bg-gray-50 rounded overflow-hidden flex-shrink-0 border border-gray-50">
                  <img src={item.variant.image} alt={'Product image'} className="w-full h-full object-cover mix-blend-multiply" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-bold text-[#202224]">{item.product?.name}</h3>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-2 text-center">
                <div className="text-[#4379EE] font-extrabold text-xs sm:text-lg">{<FaRupeeSign className="text-sm inline" />}{Number(item.variant.price || item.product?.price).toLocaleString('en-IN')}</div>
              </div>

              {/* Quantity */}
              <div className="col-span-3 md:col-span-2 flex gap-2 items-center justify-center">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, couponInput, item.product.stock, item.quantity)} disabled={item.quantity <= 1} className="w-4 h-4 sm:w-8 sm:h-8 bg-gray-200 cursor-pointer rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"><FiMinus size={14} /></button>
                <div className="px-3 font-bold text-[#202224] w-[20px] sm:min-w-[36px] text-xs sm:text-lg text-center bg-white border border-gray-50">{item.quantity}</div>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, couponInput, item.product.stock, item.quantity)} className="w-4 h-4 sm:w-8 sm:h-8 bg-gray-200 rounded-full cursor-pointer flex items-center justify-center text-gray-600 hover:bg-gray-100"><FiPlus size={14} /></button>
              </div>

              {/* Total + remove */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="text-sm font-bold text-xs sm:text-lg">{<FaRupeeSign className="text-sm inline" />}{(Number(item.variant?.price || item.product?.price) * item.quantity).toLocaleString('en-IN')}</div>
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-center">
                <button onClick={() => removeItem(item.product.id, couponInput)} className="text-gray-300 hover:text-red-500 rounded-full p-2 cursor-pointer" aria-label="remove item"><RxCross1 size={18} /></button>
              </div>
            </div>
          ))}
          <div>
            <button className="px-4 py-2 mt-2 sm:mt-6 rounded test-black cursor-pointer bg-white" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Right Side: Order Summary (Takes up 1 col) */}
        <div className="h-fit sm:w-full sm:flex sm:justify-end mt-10 sm:mt-0">
          <div className="bg-white sm:w-100 rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-50 sticky top-24">
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
              {Number(cart.discount) > 0 &&  <div className="flex justify-between text-gray-500 text-sm mb-6">
              <span>Discount</span>
              <span className="text-green-500 font-semibold">{"-"+cart.discount.toLocaleString('en-IN')}</span>
            </div>}

            </div>

            <div className="mb-6">
              <div className="text-xs font-bold text-gray-400 uppercase mb-1">Total Price</div>
              <div className="text-3xl font-extrabold text-[#202224] flex items-center"> <FaRupeeSign />{cart.total && (cart.total).toLocaleString('en-IN')}</div>
            </div>

            <button aria-label="checkout btn" className="w-full py-3 bg-[#4379EE] text-white font-extrabold rounded-lg hover:bg-[#5a3ee6] transition-all shadow-lg" onClick={handleCheckout}>
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
