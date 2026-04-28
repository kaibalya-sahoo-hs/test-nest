import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  FaStar,
  FaShoppingCart,
  FaArrowLeft,
  FaRupeeSign,
  FaChevronLeft,
  FaChevronRight,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaTag,
} from "react-icons/fa";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { FaMinus, FaPlus } from "react-icons/fa6";

function ProductPage() {
  const { title } = useParams();
  const [searchParams] = useSearchParams();

  // Get specific param (?name=John)
  const vendor = searchParams.get('vendor');
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const suggestRef = useRef(null);

  const { cart, addToCart, updateQuantity, removeItem } = useCart();
  const user = localStorage.getItem("user");

  // Get all images (use images array if available, fallback to single image)
  const getImages = () => {
    if (product?.images && product.images.length > 0) return product.images;
    if (product?.image) return [product.image];
    return ["https://rukminim2.flixcart.com/image/480/640/xif0q/smartwatch/c/y/h/-original-imagte6zvcbtz7z8.jpeg?q=90"];
  };

  const cartItem =
    cart?.items &&
    product &&
    cart.items.find((itm) => itm?.product.id === product.id);

  const handleAddtoCart = async (product) => {
    if (product.stock < 1) {
      toast.error("Sorry, this product is out of stock.");
      return;
    }
    const data = await addToCart(product);
    toast.success("Item added to the cart");
  };

  const handleQuantityChange = async (newQty) => {
    if (newQty < 1) {
      await removeItem(cartItem.product.id);
      toast.success("Removed from cart");
    } else {
      await updateQuantity(cartItem.product.id, newQty, null, product.stock, cartItem.quantity);
    }
  };

  const fetchRecomendedProducts = async () => {
    try {
      const { data } = await api.get(`/products/suggest/${title}`);
      if (data && data.success) {
        setSuggestedProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const scrollSuggestions = (direction) => {
    if (suggestRef.current) {
      const scrollAmount = 300;
      suggestRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${title}?vendor=${vendor}`);
        console.log(response)
        if (response.data.success) {
          setProduct(response.data.product);
          setSelectedImageIndex(0);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    fetchRecomendedProducts();
  }, [title, vendor]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#4379EE] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading product...</p>
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg font-medium mb-4">Product not found.</p>
          <button onClick={() => navigate('/products')} className="text-[#4379EE] font-bold hover:underline">Browse Products</button>
        </div>
      </div>
    );

  const images = getImages();

  return (
    <div className="bg-[#F5F6FA] min-h-fit overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 flex flex-col items-center">
        <div className="w-full text-start mb-4 font-semibold text-lg flex justify-start">
          <span className="flex justify-center items-center"><FaArrowLeft/> Back to poducts</span>
        </div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left column: Image + thumbnails */}
          <div className="flex flex-col items-center w-full">
            <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm w-full flex items-center justify-center p-4">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full max-w-[560px] h-auto object-contain mix-blend-multiply transition-all duration-300"
              />
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg text-gray-600 hover:text-[#4379EE] transition-all cursor-pointer"
                  >
                    <FaChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg text-gray-600 hover:text-[#4379EE] transition-all cursor-pointer"
                  >
                    <FaChevronRight size={14} />
                  </button>
                </>
              )}
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto w-full pb-2 justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${selectedImageIndex === idx
                      ? 'border-[#4379EE] shadow-md shadow-blue-100'
                      : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right column: Details */}
          <div className="flex flex-col w-full">
            <div className="w-full">
              {/* Title */}
              <h1 className="text-2xl sm:text-6xl text-[#202224] mb-2">
                {product.name}
              </h1>

              {/* Vendor Section */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0">
                  {product.vendor?.profile ? (
                    <img
                      src={product.vendor.profile}
                      alt="vendor"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-50 shadow-inner"
                    />
                  ) : (
                    <div className="w-10 h-10 flex justify-center items-center bg-gradient-to-br from-blue-400 to-blue-600 font-bold rounded-full border-2 border-gray-50 text-white">
                      {product.vendor?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">{product.vendor?.name}</div>
                  <div className="text-xs font-medium text-gray-500 truncate">{product.vendor?.storeName}</div>
                </div>
              </div>
              {/* Price & Stock */}
              <div className="mb-6">
                <p className="text-3xl sm:text-4xl  flex items-center">
                  <span className="text-3xl font-light text-gray-400">Price: </span>

                  <FaRupeeSign className="text-2xl" />
                  {Number(product.price).toLocaleString("en-IN")}
                </p>
                {product.stock > 0 ? (
                  <p className="text-sm text-green-600 font-semibold mt-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-600 rounded-full inline-block"></span>
                    In Stock · Ready to ship
                  </p>
                ) : (
                  <p className="text-sm text-red-500 font-semibold mt-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                    Out of Stock
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-500 leading-relaxed text-base">
                  {product.description || "No description provided for this product."}
                </p>
              </div>

              {/* Thumbnail Strip */}




              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                      <FaTag size={8} /> {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Add to Cart / Quantity Controls */}
              {product && product.stock > 0 ? cartItem ? (
                <div className="flex flex-col gap-3 w-fit">
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm justify-center">
                    <button
                      onClick={() => handleQuantityChange(cartItem.quantity - 1)}
                      className="p-3 text-[#202224] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <FaMinus size={14} />
                    </button>
                    <span className="px-6 font-bold text-xl text-[#202224] min-w-[60px] text-center">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(cartItem.quantity + 1)}
                      className="p-3 text-[#202224] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <FaPlus size={14} />
                    </button>
                  </div>
                  <button
                    className="bg-[#4379EE] px-8 py-4 rounded-xl text-base font-bold text-white cursor-pointer hover:bg-[#3768D1] transition-all shadow-lg flex items-center justify-center gap-2"
                    onClick={() => navigate("/cart")}
                  >
                    <FaShoppingCart /> View Cart
                  </button>
                </div>
              ) : (
                <button
                  aria-label="add to cart"
                  className="w-full sm:w-auto bg-[#4379EE] px-10 py-4 rounded-xl text-base font-bold text-white cursor-pointer hover:bg-[#3768D1] transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  onClick={() => handleAddtoCart(product)}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              ) : null}

            </div>
          </div>
        </div>

        <div className="mt-8 w-full" >
          <h2 className="text-lg font-bold text-[#202224] mb-2">Description</h2>
          <p className="text-gray-500 leading-relaxed">
            {product.description || "No description provided for this product."}
          </p>
        </div>
        {/* Recommended Products */}
        <div className="mt-12 pb-8 w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#202224]">You May Also Like</h2>
            {suggestedProducts.length > 4 && (
              <div className="flex gap-2">
                <button onClick={() => scrollSuggestions('left')} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
                  <FaChevronLeft size={12} className="text-gray-600" />
                </button>
                <button onClick={() => scrollSuggestions('right')} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
                  <FaChevronRight size={12} className="text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {loadingProducts ? (
            <div className="flex gap-5 overflow-hidden">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex-shrink-0 w-[240px] bg-white rounded-2xl p-4 animate-pulse">
                  <div className="h-40 bg-gray-100 rounded-xl mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : suggestedProducts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No recommendations available</p>
          ) : (
            <div ref={suggestRef} className="flex gap-5 overflow-x-auto pb-4 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {suggestedProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/products/${item.name}?vendor=${item.vendor.name}`)}
                  className="flex-shrink-0 w-[220px] sm:w-[240px] bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all duration-300 cursor-pointer group"
                >
                  <div className="h-40 w-full overflow-hidden bg-gray-50">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-[#202224] line-clamp-1 mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-[#4379EE] flex items-center">
                        <FaRupeeSign className="text-sm" />{Number(item.price).toLocaleString('en-IN')}
                      </span>
                      {item.stock > 0 ? (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">In Stock</span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
