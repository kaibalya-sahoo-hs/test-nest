import React from 'react';
import { FaChevronDown, FaFilterCircleDollar } from 'react-icons/fa6';
import { FiChevronDown, FiRotateCcw } from 'react-icons/fi';

const ProductFilterBar = ({ filters, setFilters, onReset }) => {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mb-5">
      <div className="flex flex-wrap items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        
        {/* Icon & Label Section */}
        <div className="flex items-center px-6 py-4 border-r border-gray-200 bg-gray-50/50">
          <FaFilterCircleDollar size={18} className="text-gray-700 mr-3" />
          <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Filter By</span>
        </div>

        {/* Category Filter */}
        <div className="flex-1 relative border-r border-gray-200 px-4 group">
          <select 
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="w-full bg-transparent appearance-none py-4 pr-8 text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
          >
            <option value="" className='rounded-xl'>All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home Decor</option>
          </select>
          <FaChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Price Filter (Sort Order) */}
        <div className="flex-1 relative border-r border-gray-200 px-4">
          <select 
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="w-full bg-transparent appearance-none py-4 pr-8 text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
          >
            <option value="desc">Price: High to Low</option>
            <option value="asc">Price: Low to High</option>
          </select>
          <FiChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Rating Filter */}
        <div className="flex-1  relative border-r border-gray-200 px-4">
          <select 
            name="rating"
            value={filters.rating}
            onChange={handleChange}
            className="w-full bg-transparent appearance-none py-4 pr-8 text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
          <FiChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Reset Button */}
        <button 
          onClick={onReset}
          className="flex items-center px-8 py-4 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <FiRotateCcw size={16} className="mr-2" />
          Reset Filter
        </button>

      </div>
    </div>
  );
};

export default ProductFilterBar;