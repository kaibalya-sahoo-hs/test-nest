// src/pages/CartPage.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';

const CartPage = () => {
  const { cart, fetchCart, updateQuantity, removeItem } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate()
  // Re-fetch cart with coupon whenever user applies it
  const handleApplyCoupon = async () => {
    if (couponInput.trim() === "") {
      toast.error("Empty fields are not allowed")
      return
    };
    setIsApplying(true);
    const data = await fetchCart(couponInput);
    setIsApplying(false);
    console.log(data)
    if(data.appliedCoupon){
      toast.success("Coupon applied")
    }else{
      toast.error("Coupon not applied")
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <div className="bg-blue-50 p-6 rounded-full mb-4">
          <FiShoppingBag size={48} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Looks like you haven't added anything yet.</p>
        <button className="mt-6 px-8 py-3 bg-[#4379EE] text-white rounded-xl font-bold hover:bg-blue-600 transition-all" onClick={() => navigate('/products')}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl sm:px-6 lg:px-8 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart ({cart.items.length})</h1>

      <div className="grid grid-cols-1 gap-8 items-start">
        
        {/* Left Side: Cart Items */}
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
              {/* Product Image */}
              <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                <img 
                  src={item.product.image || 'https://via.placeholder.com/150'} 
                  alt={item.product.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-gray-800">{item.product.name}</h3>
                <p className="text-sm text-gray-400 mb-2">Unit Price: ${item.product.price}</p>
                <p className="text-[#4379EE] font-bold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-500"
                >
                  <FiMinus size={18} />
                </button>
                <span className="px-4 font-bold text-gray-700 min-w-[40px] text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-500"
                >
                  <FiPlus size={18} />
                </button>
              </div>

              {/* Remove Button */}
              <button 
                onClick={() => removeItem(item.id)}
                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
              >
                <FiTrash2 size={22} />
              </button>
            </div>
          ))}
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-8 shadow-md border border-gray-50 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Order Summary</h2>
            
            {/* Coupon Section */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <FiTag className="text-[#4379EE]" /> Have a coupon?
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none uppercase font-bold"
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={isApplying}
                  className="bg-blue-500 text-white px-5 py-3 rounded-lg font-bold text-sm hover:bg-gray-700 disabled:opacity-50 transition-all"
                >
                  {isApplying ? '...' : 'Apply'}
                </button>
              </div>
              {cart.appliedCoupon && (
                <p className="text-xs text-green-600 font-bold mt-2 ml-1">✓ Coupon {cart.appliedCoupon} applied!</p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span>${cart.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600 font-bold">
                <span>Discount</span>
                <span>-${cart.discount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-end">
                <span className="text-gray-800 font-bold">Total Amount</span>
                <span className="text-3xl font-black text-[#4379EE]">${cart.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;