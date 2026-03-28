import React from 'react';
import { FaChevronLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";

import { FaStar } from "react-icons/fa";



const FavoritesPage = () => {
  const favorites = [
    { id: 1, name: "Apple Watch Series 4", price: "120.00", reviews: 131, rating: 4, isFavorite: true },
    { id: 2, name: "Air-Max-270", price: "60.00", reviews: 64, rating: 4, isFavorite: false },
    { id: 3, name: "Minimal Chair Tool", price: "24.59", reviews: 63, rating: 5, isFavorite: false },
    { id: 4, name: "Amazfit Vip", price: "70.00", reviews: 131, rating: 4, isFavorite: false },
    { id: 5, name: "Gumbo Mouse", price: "20.00", reviews: 131, rating: 4, isFavorite: false },
    { id: 6, name: "Camera Tripod", price: "50.00", reviews: 131, rating: 4, isFavorite: false },
  ];

  return (
    <div className="bg-[#F5F6FA]">
      <h1 className="text-xl sm:text-2xl font-bold text-[#202224] mb-6 sm:mb-8">Favorites</h1>

      {/* Responsive Grid: 1 col on mobile, 3 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {favorites.map((product) => (
          <div key={product.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-50 relative group">
            
            {/* Image Container with Arrows */}
            <div className="relative flex justify-center items-center mb-6 bg-[#f8f9fa] rounded-2xl py-4">
              <button className="absolute left-2 p-1.5 bg-white/80 shadow-sm rounded-full text-gray-400 hover:text-[#4379EE] transition-all">
                <FaChevronLeft size={16} />
              </button>
              
              <img 
                src="https://llounge.in/wp-content/uploads/2024/09/MC7J4ref_FV99_VW_34FRwatch-case-46-titanium-natural-cell-s10_VW_34FRwatch-face-46-titanium-natural-s10_VW_34FR.jfif-removebg-preview.webp" 
                alt={product.name} 
                className="w-25 h-50 object-contain mix-blend-multiply"
              />

              <button className="absolute right-2 p-1.5 bg-white/80 shadow-sm rounded-full text-gray-400 hover:text-[#4379EE] transition-all">
                <FaChevronRight size={16} />
              </button>
            </div>

            {/* Title, Price and Heart */}
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="text-[16px] font-bold text-[#202224] leading-tight">
                  {product.name}
                </h3>
                <p className="text-[#4379EE] font-bold text-[15px] mt-1">
                  ${product.price}
                </p>
              </div>
              
              {/* Heart Icon: If isFavorite is true, it shows as filled red */}
              <button className="mt-1">
                <FaHeart 
                  size={20} 
                  className={product.id === 1 ? "fill-[#FF4B55] text-[#FF4B55]" : "text-gray-300 hover:text-red-400"} 
                />
              </button>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-0.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  size={14} 
                  className={i < product.rating ? "fill-[#FFAD33] text-[#FFAD33]" : "text-gray-200"} 
                />
              ))}
              <span className="text-[12px] text-gray-400 ml-1 font-medium">({product.reviews})</span>
            </div>

            {/* Action Button */}
            <button className="w-fit py-2 px-4 bg-[#F1F4F9] text-[#202224] font-bold text-xs rounded-md hover:bg-[#e2e8f0] transition-colors uppercase tracking-wide">
              Edit Product
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;