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
  const tabs = ["Description", "Specifications", "Reviews"]
  const [currentTab, setCurrentTab] = useState(tabs[0])

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
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 items-center">

        <div className="w-full text-start mb-4 font-semibold text-lg flex justify-start">
          <span className="flex justify-center items-center gap-2 cursor-pointer" onClick={() => navigate('/products')}><FaArrowLeft size={16} /> Back to poducts</span>
        </div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left column: Image + thumbnails */}
          <div className="flex w-full gap-2">
            <div className="">
              {images.length > 1 && (
                <div className="flex flex-col gap-1 overflow-x-auto w-full pb-2 justify-center">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 w-15 h-15 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${selectedImageIndex === idx
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
            <div className="w-80 h-80 md:w-[560px] md:h-125 relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm w-full flex items-center justify-center">

              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="h-full w-full object-cover mix-blend-multiply transition-all duration-300"
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


          </div>

          {/* Right column: Details */}
          <div className="flex flex-col w-full">
            <div className="w-full flex flex-col justify-between h-full">
              {/* Rating + Title */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm text-gray-400">{product.rating || 'New'}</div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202224] leading-tight mb-2">
                {product.name}
              </h1>

              <div className="text-sm mb-4">
                <span className="text-gray-500">by </span>
                <button className="text-blue-600 font-medium hover:underline">{product.vendor?.name}</button>
              </div>

              {/* Prices */}
              <div className="mb-4 text-xl text-gray-500">
                <div>List Price: <span className="line-through text-gray-400">{product.listPrice ? `${product.listPrice}` : 90}</span></div>
              </div>

              <div className="flex items-end gap-4 mb-6">
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-gray-500">Price:</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#1E40AF]">{Number(product.price).toLocaleString('en-IN')}</div>
                </div>
                <div className="text-sm text-gray-500">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</div>
              </div>

              {/* Feature bullets (compact) */}
              <ul className="list-none space-y-2 mb-6 text-sm text-gray-600">
                {(product.features && product.features.length > 0 ? product.features : [
                  'Active noise cancellation for immersive sound',
                  'Transparency mode for hearing and connecting',
                  'Three sizes of soft, tapered silicone tips',
                  'Sweat and water resistant',
                ]).map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 w-2 h-2 bg-gray-900 rounded-full inline-block flex-shrink-0"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

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
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(cartItem.quantity - 1)}
                      className="p-2 text-[#202224] bg-gray-200 rounded-full  transition-colors cursor-pointer"
                    >
                      <FaMinus size={16} />
                    </button>
                    <span className="px-6 font-bold text-xl text-[#202224] min-w-[60px] text-center bg-white border border-black">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(cartItem.quantity + 1)}
                      className="p-2 text-[#202224] bg-gray-200 rounded-full  transition-colors cursor-pointer"
                    >
                      <FaPlus size={16} />
                    </button>
                  </div>
                  <button
                    className="bg-[#473BF0] px-8 py-4 rounded-md text-base font-bold text-white cursor-pointer hover:bg-[#3768D1] transition-all shadow-lg flex items-center justify-center gap-2"
                    onClick={() => navigate("/cart")}
                  >
                    <FaShoppingCart /> View Cart
                  </button>
                </div>
              ) : (
                <button
                  aria-label="add to cart"
                  className="w-full sm:w-auto bg-[#473BF0] px-6 py-4 rounded-md text-base font-bold text-white cursor-pointer hover:bg-[#3768D1] transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  onClick={() => handleAddtoCart(product)}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="md:mt-20 mt-8 w-full ">
          <div role="tablist" aria-label="Product tabs" className="flex gap-6 mb-4 border-b-1 border-b-gray-300 w-full">
            {tabs.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={currentTab === tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-3 py-2 font-extrabold text-lg ${currentTab === tab ? 'text-[#0501ff] border-b-1 border-[#0501ff]' : 'text-gray-500'} transition-colors`}
              >
                {tab}
              </button>
            ))}
          </div>


          <div className="tab-panel mt-10">
            {currentTab === 'Description' && (
              <>
                <p className="text-gray-500 leading-relaxed">
                  {product.description || "No description provided for this product."}
                </p>
              </>
            )}

            {currentTab === 'Specifications' && (
              <>
                <p className="text-gray-500 leading-relaxed">
                  {product.specifications || 'No specifications available.'}
                </p>
              </>
            )}

            {currentTab === 'Reviews' && (
              <>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((r, i) => (
                      <div key={i} className="bg-white p-4 rounded-lg border border-gray-100">
                        <div className="text-sm font-bold">{r.user || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500">{r.comment}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet.</p>
                )}
              </>
            )}
          </div>
        </div>
        {/* Recommended Products */}
        <div className="mt-30 pb-8 w-full ">
          <div className="flex items-center justify-center mb-18">
            <h2 className="text-xl sm:text-2xl font-bold text-[#202224] ">Related Products</h2>
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
            <div className="w-full">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center w-full">
                {suggestedProducts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/products/${item.name}?vendor=${item.vendor?.name}`)}
                    className="w-[180px] sm:w-[230px] rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className=" overflow-hidden rounded-xl bg-gray-50 mb-3">
                      <img src={item.image || 'https://via.placeholder.com/300'} alt={item.name} className="w-full h-[180px] sm:h-70 object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>

                    <div className="flex flex-col justify-center items-center gap-3">
                      <div className="flex items-center text-center mb-2">
                        <div className="text-base font-bold flex items-center gap-1">
                          <FaRupeeSign className="text-sm" />{Number(item.price).toLocaleString('en-IN')}
                        </div>
                        {item.listPrice ? (
                          <div className="text-xs text-gray-400 line-through">{Number(item.listPrice).toLocaleString('en-IN')}</div>
                        ) : null}
                      </div>

                      <h3 className="text-sm font-bold text-[#202224] mb-2 line-clamp-1 font-extrabold">{item.name}</h3>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar key={i} className={`text-yellow-400 ${i < Math.round(item.rating || 4) ? '' : 'opacity-40'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
