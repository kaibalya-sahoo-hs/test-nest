import React, { useEffect } from 'react'
import { useState } from 'react';
import toast from 'react-hot-toast';
import { CiHeart } from 'react-icons/ci'
import { FaRupeeSign } from 'react-icons/fa';
import { FaAngleLeft, FaAngleRight, FaStar } from 'react-icons/fa6'
import { LuCreditCard, LuHeadphones, LuRotateCcw, LuTruck } from 'react-icons/lu';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

function Index() {

  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  const features = [
    {
      icon: <LuTruck size={32} className="text-gray-800" />,
      title: "FASTEST DELIVERY",
      desc: "Delivery in 24/H"
    },
    {
      icon: <LuRotateCcw size={32} className="text-gray-800" />,
      title: "24 HOURS RETURN",
      desc: "Money-back guarantee"
    },
    {
      icon: <LuCreditCard size={32} className="text-gray-800" />,
      title: "SECURE PAYMENT",
      desc: "Your money is safe"
    },
    {
      icon: <LuHeadphones size={32} className="text-gray-800" />,
      title: "SUPPORT 24/7",
      desc: "Live contact/message"
    }
  ];

  const handleShopNow = () => {
    navigate('/products');
  };
  return (
    <div className="bg-[#F5F6FA] min-h-screen font-sans">
      {/* Hero Banner Section */}
      <div className="relative w-full h-[200px] sm:h-[280px] bg-[#4379EE] rounded-lg overflow-hidden mb-8 flex items-center px-6 sm:px-12 shadow-lg">
        {/* Background SVG Pattern (Wavy Lines) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100 Q 250 50 400 200 T 800 150 T 1200 250" stroke="white" fill="transparent" strokeWidth="2" />
            <path d="M0 150 Q 300 100 500 250 T 900 200 T 1300 300" stroke="white" fill="transparent" strokeWidth="2" />
          </svg>
        </div>

        {/* Banner Content */}
        <div className="relative z-10 text-white max-w-lg ml-2 sm:ml-6">
          <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 opacity-90">September 12-22</p>
          <h2 className="text-xl sm:text-4xl font-bold mb-2 sm:mb-4 leading-tight">
            Enjoy free home <br className="hidden sm:block" />delivery in this summer
          </h2>
          <p className="text-xs sm:text-sm mb-4 sm:mb-6 opacity-80">Designer Dresses - Pick from trendy Designer Dress.</p>
          <button className="bg-[#FF8743] hover:bg-[#e67635] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm transition-colors">
            Get Started
          </button>
        </div>

        {/* Banner Navigation Arrows */}
        <button className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-1 text-sm rounded-full text-white backdrop-blur-sm transition-all">
          <FaAngleLeft size={20} />
        </button>
        <button className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-1 text-sm rounded-full text-white backdrop-blur-sm transition-all">
          <FaAngleRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 min-h-[500px]">
        
        {/* Left Side: Large Hero Section (Spans 2 columns on desktop) */}
        <div className="md:col-span-2 relative rounded-2xl bg-[#4b4b4b] overflow-hidden group min-h-[350px]">
          {/* Main content would go here */}
          <div className="absolute">
          <button 
                onClick={handleShopNow}
                className="bg-blue-600 absolute bottom-15 left-10 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
              >
                Shop Now <span>→</span>
              </button>
            <img src="https://webandcrafts.com/_next/image?url=https%3A%2F%2Fadmin.wac.co%2Fuploads%2FWhat_is_E_commerce_and_What_are_its_Applications_2_d2eb0d4402.jpg&w=4500&q=90" className='h-full' />
          </div>
        </div>

        {/* Right Side: Two Stacked Banners */}
        <div className="grid grid-rows-2 gap-4 lg:gap-6">
          
          {/* Top Right Card: Pixel 6 Pro */}
          <div className="relative bg-black rounded-2xl p-6 overflow-hidden flex flex-col justify-center border border-gray-800">
            <div className="relative z-10">
              <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Summer Sales</span>
              <h2 className="text-white text-2xl font-bold mt-2 mb-4 leading-tight">
                New Google <br /> Pixel 6 Pro
              </h2>
              <button 
                onClick={handleShopNow}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
              >
                Shop Now <span>→</span>
              </button>
            </div>
            {/* Discount Badge */}
            <div className="absolute top-4 right-4 bg-yellow-400 text-black font-bold px-3 py-1 text-sm rounded">
              29% OFF
            </div>
            {/* Background Image Placeholder */}
            <img 
              src="https://images.unsplash.com/photo-1635350736475-c8cef4b21906?q=80&w=500" 
              alt="Pixel 6" 
              className="absolute right-[-20px] top-4 w-40 opacity-80"
            />
          </div>

          {/* Bottom Right Card: FlipBuds Pro */}
          <div className="relative bg-black rounded-2xl p-6 overflow-hidden flex items-center border border-gray-800">
            <div className="flex-1 z-10">
              <h2 className="text-white text-2xl font-bold mb-1">Xiaomi <br /> FlipBuds Pro</h2>
              <p className="text-blue-500 font-bold mb-4">$299 USD</p>
              <button 
                onClick={handleShopNow}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
              >
                Shop Now <span>→</span>
              </button>
            </div>
            {/* Background Image Placeholder */}
            <img 
              src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=500" 
              alt="Earbuds" 
              className="absolute right-0 w-32 object-contain"
            />
          </div>  

        </div>
      </div>

      <div className="mt-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="bg-white p-6 flex items-center space-x-4 border border-gray-100 shadow-sm rounded-sm"
          >
            {/* Icon Container */}
            <div className="flex-shrink-0">
              {feature.icon}
            </div>
            
            {/* Text Content */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight leading-none mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}

export default Index