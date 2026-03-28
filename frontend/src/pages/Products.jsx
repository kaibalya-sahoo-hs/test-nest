import React from 'react'
import { FaAngleRight } from 'react-icons/fa';
import { FaAngleLeft } from "react-icons/fa6";
import { CiHeart } from "react-icons/ci";
import { FaStar } from "react-icons/fa";



function Products() {
  const products = [1, 2, 3];
  return (
    <div className="bg-[#F5F6FA] min-h-screen font-sans">
      <h1 className="text-xl sm:text-2xl font-bold text-[#202224] mb-6">Products</h1>

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

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {products.map((item) => (
          <div key={item} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 relative group">
            {/* Product Image & Inner Arrows */}
            <div className="relative flex justify-center items-center mb-6">
               <button className="absolute left-0 p-1 bg-gray-100 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <FaAngleLeft size={16} />
              </button>
              
              <img 
                src="https://rukminim2.flixcart.com/image/480/640/xif0q/smartwatch/c/y/h/-original-imagte6zvcbtz7z8.jpeg?q=90" 
                alt="Apple Watch" 
                className="w-48 h-48 object-contain"
              />

              <button className="absolute right-0 p-1 bg-gray-100 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <FaAngleRight size={16} />
              </button>
            </div>

            {/* Product Details */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-[#202224]">Apple Watch Series 4</h3>
                <p className="text-[#4379EE] font-bold">$120.00</p>
              </div>
              <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                <CiHeart size={18} />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-6">
              {[1, 2, 3, 4].map((s) => (
                <FaStar key={s} size={14} className="fill-[#FFAD33] text-[#FFAD33]" />
              ))}
              <FaStar size={14} className="text-gray-300" />
              <span className="text-xs text-gray-400 ml-1">(131)</span>
            </div>

            {/* Edit Button */}
            <button className="w-fit py-2 px-4 bg-[#F1F4F9] text-[#202224] font-bold text-sm rounded-md hover:bg-gray-200 transition-colors">
              Edit Product
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products