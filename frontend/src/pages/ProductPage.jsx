import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FaAngleLeft, FaStar, FaShoppingCart, FaArrowLeft, FaRupeeSign } from 'react-icons/fa';
import { CiHeart } from "react-icons/ci";
import api from "../utils/api";
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart()
  const user = localStorage.getItem('user')

  const handleAddtoCart = async (product) => {
    const data = await addToCart(product)
    console.log("Added product ", product)
    toast.success("Item added to the cart")
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`http://localhost:8000/products/${id}`);
        console.log(response)
        if (response.data.success) {
          setProduct(response.data.product);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  return (
    <div className="bg-[#F5F6FA] min-h-fit font-sans p-4 sm:p-8">
      {/* Navigation Header */}
      <div className="flex items-center mb-8 ml-15">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-[#202224] font-bold hover:text-[#4379EE] transition-colors cursor-pointer"
        >
          <FaArrowLeft className='font-light rounded-lg' />
          <span className='flex items-center'>
            Back to Products
          </span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left Side: Sticky Image Container */}
        <div className="md:w-1/2 bg-[#F9FAFB] md:h-fit md:sticky md:top-0 flex items-center justify-center p-8 border-r border-gray-50">
          <img
            src={product.image || "https://rukminim2.flixcart.com/image/480/640/xif0q/smartwatch/c/y/h/-original-imagte6zvcbtz7z8.jpeg?q=90"}
            alt={product.name}
            className="w-full max-w-[400px] rounded-2xl h-auto object-contain mix-blend-multiply"
          />
        </div>

        {/* Right Side: Scrollable Details */}
        <div className="md:w-1/2 p-8 sm:p-12 flex flex-col">
          <div className="max-w-xl mx-auto md:mx-0">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[#4379EE] text-sm font-bold uppercase tracking-wider">New Arrival</span>
                <h1 className="text-4xl font-bold text-[#202224] mt-1">{product.name}</h1>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={18}
                    className={star <= Math.round(product.rating || 0) ? "text-[#FFAD33]" : "text-gray-200"}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400 font-medium">({product.rating || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <p className="text-4xl font-bold text-[#4379EE] flex items-center">
                <FaRupeeSign className="text-2xl" />{Number(product.price).toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-green-500 font-semibold mt-1">In Stock - Ready to ship</p>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-[#202224] uppercase mb-2">Description</h3>
              <p className="text-gray-500 leading-relaxed text-lg">
                {product.description || "No description provided for this product. Here is some filler text to ensure the content is long enough to demonstrate the scrolling effect on the right side while the image stays fixed."}
              </p>
            </div>

            <div className="sticky bottom-8 md:static">
              <button
                className='w-full md:w-auto bg-blue-500 px-8 py-4 rounded-lg text-base font-bold text-white cursor-pointer hover:bg-blue-600 transition-colors shadow-lg'
                onClick={() => handleAddtoCart(product)}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;