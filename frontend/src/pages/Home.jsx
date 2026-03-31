import React, { useEffect, useState } from 'react'
import { FaAngleRight, FaPlus } from 'react-icons/fa';
import { FaAngleLeft } from "react-icons/fa6";
import { CiHeart } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import api from "../utils/api"
import { useNavigate } from 'react-router';


function Products() {
  // const products = [1, 2, 3];
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    rating: 0
  });
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null);

  const handleCreateProduct = async (e) => {
    setIsSubmitting(true)
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('description', formData.description);
    if (selectedFile) {
      formDataToSend.append('file', selectedFile); // Matches NestJS FileInterceptor('file')
    }

    console.log(formDataToSend)
    try {
      const res = await api.post('http://localhost:8000/admin/products', formDataToSend);
      console.log(res)
      setIsModalOpen(false)
      setProducts([...products, res.data])
      setSelectedFile(null)
    } catch (err) {
      console.error("Upload failed", err);
    }
    setIsSubmitting(false)
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('http://localhost:8000/admin/products');

        // 2. Access the 'data' array from your NestJS response structure
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-[#F5F6FA] min-h-screen font-sans">
      <div className='flex justify-between items-center'>
        <h1 className="text-xl sm:text-2xl font-bold text-[#202224] mb-6">Products</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#4379EE] hover:bg-[#3662c1] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95"
        >
          <FaPlus size={14} />
          Add New Product
        </button>
      </div>
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#202224]">Create New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379EE]"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number" step="0.01" required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379EE]"
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image</label>
                <label className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 text-sm">
                  <span className="truncate">{selectedFile ? selectedFile.name : "Choose File"}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379EE]"
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#4379EE] text-white font-bold rounded-lg hover:bg-[#3662c1] transition-colors"
                >
                  {isSubmitting ? "Uploading..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-200">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#202224]">No Products Found</h3>
          <p className="text-gray-500 mb-6 text-sm text-center px-4">
            It seems your inventory is empty. Start by adding your first product.
          </p>
          <button className="bg-[#4379EE] hover:bg-[#3662c1] text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors">
            Add New Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {products.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 relative group cursor-pointer" onClick={() => navigate(`/products/${item.id}`)}>
              {/* Product Image & Inner Arrows */}
              <div className="relative flex justify-center items-center mb-6">
                <button className="absolute left-0 p-1 bg-gray-100 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaAngleLeft size={16} />
                </button>

                {/* Dynamic Image from response */}
                <img
                  src={item.image || "https://rukminim2.flixcart.com/image/480/640/xif0q/smartwatch/c/y/h/-original-imagte6zvcbtz7z8.jpeg?q=90"}
                  alt={item.name}
                  className="w-48 h-48 object-contain"
                />

                <button className="absolute right-0 p-1 bg-gray-100 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaAngleRight size={16} />
                </button>
              </div>

              {/* Product Details */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  {/* Dynamic Name and Price */}
                  <h3 className="text-lg font-bold text-[#202224] truncate max-w-[150px]">
                    {item.name}
                  </h3>
                  <p className="text-[#4379EE] font-bold">
                    ${Number(item.price).toFixed(2)}
                  </p>
                </div>
                <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                  <CiHeart size={18} />
                </button>
              </div>

              {/* Rating - Dynamic based on item.rating */}
              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={14}
                    className={star <= Math.round(item.rating) ? "fill-[#FFAD33] text-[#FFAD33]" : "text-gray-300"}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">
                  ({item.rating})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products