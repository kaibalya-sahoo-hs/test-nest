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
  FaHashtag,
} from "react-icons/fa";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FiStar } from "react-icons/fi";

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
  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState('');
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const suggestRef = useRef(null);

  const { cart, addToCart, updateQuantity, removeItem } = useCart();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const tabs = ["Description", "Specifications", "Reviews"]
  const [currentTab, setCurrentTab] = useState(tabs[0])

  // Get all images (use images array if available, fallback to single image)
  const getImages = () => {
    if (product?.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      if (selectedVariant && selectedVariant.images && firstVariant.images.length > 0) {
        return selectedVariant.images;
      }
    }
    if (product?.image) return [product.image];
    return ["https://rukminim2.flixcart.com/image/480/640/xif0q/smartwatch/c/y/h/-original-imagte6zvcbtz7z8.jpeg?q=90"];
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
  }

  const cartItem =
    cart?.items &&
    product &&
    cart.items.find((itm) => itm?.product.id === product.id);

  const handleAddtoCart = async (product, variantId) => {
    if (product.stock < 1) {
      toast.error("Sorry, this product is out of stock.");
      return;
    }
    const data = await addToCart(product, variantId);
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

  const fetchProductReviews = async (productId) => {
    try {
      setLoadingReviews(true);
      const { data } = await api.get(`/reviews/product/${productId}`);
      if (data && data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to add a review");
      return;
    }

    if (user.role !== 'guest') {
      toast.error("Only guest users can add reviews");
      return;
    }

    if (!reviewInput.trim()) {
      toast.error("Please enter a review");
      return;
    }

    try {
      setSubmittingReview(true);
      const { data } = await api.post('/reviews', {
        content: reviewInput,
        productId: product.id
      });

      if (data && data.success) {
        toast.success("Review added successfully!");
        setReviewInput('');
        await fetchProductReviews(product.id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add review");
    } finally {
      setSubmittingReview(false);
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
        if (response.data.success) {
          setProduct(response.data.product);
          setSelectedImageIndex(0);
          // Set the first variant as selected by default
          if (response.data.product.variants && response.data.product.variants.length > 0) {
            console.log(response.data.product.variants[0])
            setSelectedVariant(response.data.product.variants[0]);
          }
          await fetchProductReviews(response.data.product.id);
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


  // Ensure top of page is visible when this page mounts
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (err) {
      // ignore in non-browser environments
    }
  }, [title]);

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
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Left column: Image + thumbnails */}
          <div className="flex w-full col-span-2">
            <div className="">
              {images.length > 1 && (
                <div className="flex flex-col gap-1 mr-4 overflow-x-auto w-full pb-2 justify-center">
                  {selectedVariant.images?.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 mb-2 w-15 h-15 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${selectedImageIndex === idx
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
            <div className="w-80 h-80 md:w-[560px] md:h-125 overflow-hidden relative bg-white rounded-2xl  border border-gray-100 shadow-sm w-full flex flex-wrap items-center justify-center">

              <img
                src={selectedVariant.images[selectedImageIndex]}
                alt={product.name}
                className="h-full w-full object-contain mix-blend-multiply transition-all duration-300"
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
            <div className="w-full flex flex-col gap-2 h-full">

              <h1 className="text-4xl sm:text-3xl font-extrabold text-[#202224] leading-tight mb-2">
                {product.name}
              </h1>
             
              <div className="text-sm">
                <span className="text-gray-500">by </span>
                <button className="text-blue-600 font-medium hover:underline">{product.vendor?.name}</button>
              </div>

               {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 ">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-1 py-1 text-gray-400 rounded-full text-xs font-bold">
                      <FaHashtag size={12} /> {tag.name}
                    </span>
                  ))}
                </div>
              )}


              {/* Prices */}

              <div className="flex justify-start items-center">
                <span className="text-gray-500">MRP: </span>
                <span className="text-gray-400 flex justify-center items-center"><FaRupeeSign size={14} className="font-extralight" />{selectedVariant ? (Number(selectedVariant.price) + Number(selectedVariant.price * 0.1)).toLocaleString('en-IN') : (Number(product.price) + Number(product.price * 0.1)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-end gap-4 mb-6">
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-gray-500">Price:</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-black flex justify-center items-center"><FaRupeeSign size={25} />{selectedVariant ? Number(selectedVariant.price).toLocaleString('en-IN') : Number(product.price).toLocaleString('en-IN')}</div>
                </div>
                <div className="text-sm text-gray-500">{selectedVariant && selectedVariant.stock > 0 ? 'In Stock' : product.stock > 0 ? 'In Stock' : 'Out of Stock'}</div>
              </div>

              {/* Feature bullets (compact) */}
              <ul className="list-none space-y-2 mb-6 text-sm text-gray-600">
                {(product.features && product.features.length > 0 ? product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 w-2 h-2 bg-gray-900 rounded-full inline-block flex-shrink-0"></span>
                    <span>{f}</span>
                  </li>
                )) : 'No features available')
                }
              </ul>

              {/* Add to Cart / Quantity Controls */}
              {selectedVariant && selectedVariant.stock > 0 ? cartItem ? (
                <div className="flex flex-col gap-3 w-fit">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl text-gray-500">Quantity</span>
                    <button
                      onClick={() => handleQuantityChange(cartItem.quantity - 1)}
                      className="p-2 text-[#202224] bg-gray-200 rounded-full  transition-colors cursor-pointer"
                    >
                      <FaMinus size={16} />
                    </button>
                    <span className="px-6 font-bold text-xl text-[#202224] min-w-[60px] text-center bg-white border border-gray-400">
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
                    className="bg-[#473BF0] w-fit px-8 py-4 rounded-md text-base font-bold text-white cursor-pointer hover:bg-[#3768D1] transition-all shadow-lg flex items-center justify-center gap-2"
                    onClick={() => navigate("/cart")}
                  >
                    <FaShoppingCart /> View Cart
                  </button>
                </div>
              ) : (
                <button
                  aria-label="add to cart"
                  className="w-fit sm:w-fit bg-[#473BF0] px-6 py-4 rounded-md text-base font-bold text-white cursor-pointer hover:bg-[#3768D1] transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  onClick={() => handleAddtoCart(product, selectedVariant.id)}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              ) : null}

              {/* Variant Selection */}
              
              
            </div>
          </div>
        </div>
        {product && product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#202224] mb-3">Select Variant</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {product.variants.map((variant, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                          selectedVariant?.id === variant.id
                            ? 'border-[#4379EE] bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-[#4379EE]'
                        }`}
                      >
                        {variant.image && (
                          <img
                            src={variant.image}
                            alt={`${variant.color}-${variant.size}`}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="text-xs text-center">
                          <p className="font-bold text-gray-700">{variant.color}</p>
                          <p className="text-gray-500">{variant.size}</p>
                          <p className="font-bold text-[#4379EE]">₹{Number(variant.price).toLocaleString('en-IN')}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

        {/* Tabs */}
        <div className="md:mt-20 mt-8 w-full ">
          <div role="tablist" aria-label="Product tabs" className="flex gap-6 md:gap-15 mb-4 border-b-1 border-b-gray-300 w-full">
            {tabs.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={currentTab === tab}
                onClick={() => setCurrentTab(tab)}
                className={`font-extrabold pb-4 text-lg cursor-pointer ${currentTab === tab ? 'text-[#0501ff] border-b-1 border-[#0501ff]' : 'text-gray-500'} transition-colors`}
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
              <div className="space-y-6">
                {/* Add Review Form - Only for guest users */}
                {user && user.role === 'guest' && (
                  <div className="flex">
                    <button
                      onClick={() => { setEditingReview(null); setReviewInput(''); setIsReviewModalOpen(true); }}
                      className="bg-[#4379EE] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#3768D1] transition-all"
                    >
                      Add Review
                    </button>
                  </div>
                )}

                {user && user.role !== 'guest' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600">Only guest users can add reviews</p>
                  </div>
                )}

                {/* Reviews List */}
                <div>

                  {loadingReviews ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-[#4379EE] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                              {getInitials(review.user?.name)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-semibold text-[#202224]">{review.user?.name || 'Anonymous'}</div>
                                  <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {user && review.user && user.id === review.user.id && (
                                    <>
                                      <button onClick={() => { setEditingReview(review); setReviewInput(review.content); setIsReviewModalOpen(true); }} className="text-sm text-blue-600 font-medium hover:underline">Edit</button>
                                      <button onClick={async () => {
                                        if (!window.confirm('Delete this review?')) return;
                                        try {
                                          await api.delete(`/reviews/${review.id}`);
                                          toast.success('Review deleted');
                                          await fetchProductReviews(product.id);
                                        } catch (err) {
                                          toast.error('Delete failed');
                                        }
                                      }} className="text-sm text-red-500 font-medium">Delete</button>
                                    </>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mt-3 whitespace-pre-line">{review.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        
        {isReviewModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-bold mb-4">{editingReview ? 'Edit Review' : 'Add Review'}</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!user) { toast.error('Please log in'); return; }
                if (user.role !== 'guest') { toast.error('Only guest users can add reviews'); return; }
                if (!reviewInput.trim()) { toast.error('Please enter a review'); return; }
                try {
                  setSubmittingReview(true);
                  if (editingReview) {
                    await api.put(`/reviews/${editingReview.id}`, { content: reviewInput });
                    toast.success('Review updated');
                  } else {
                    await api.post('/reviews', { content: reviewInput, productId: product.id });
                    toast.success('Review added');
                  }
                  setIsReviewModalOpen(false);
                  setEditingReview(null);
                  setReviewInput('');
                  await fetchProductReviews(product.id);
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Operation failed');
                } finally { setSubmittingReview(false); }
              }} className="space-y-4">
                <textarea value={reviewInput} onChange={(e) => setReviewInput(e.target.value)} className="w-full p-4 border border-gray-300 rounded-lg resize-none" rows={6} />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { setIsReviewModalOpen(false); setEditingReview(null); setReviewInput(''); }} className="px-4 py-2 rounded-lg border">Cancel</button>
                  <button type="submit" disabled={submittingReview || !reviewInput.trim()} className="px-4 py-2 rounded-lg bg-[#4379EE] text-white">{submittingReview ? 'Saving...' : (editingReview ? 'Update' : 'Submit')}</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Recommended Products */}
        <div className="mt-30 pb-8 w-full ">
          <div className="flex items-center justify-center mb-18">
            <h2 className="text-xl md:text-3xl font-bold text-[#202224] ">Related Products</h2>
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
                    className="w-[180px] sm:w-[230px] rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className=" overflow-hidden rounded-xl bg-gray-50 mb-3">
                      <img src={item.variants[0].image || 'https://via.placeholder.com/300'} alt={item.name} className="w-full h-[180px] sm:h-70 object-cover transition-transform duration-300" />
                    </div>

                    <div className="flex flex-col justify-between items-center gap-4">
                      <div className="flex items-center text-center gap-4">
                        <div className="text-base font-bold flex items-center gap-1">
                          <FaRupeeSign className="text-sm" />{Number(item.variants[0].price).toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-400 font-bold flex items-center gap-1"> <FaRupeeSign className="text-xs" /> {(Number(item.variants[0].price) + Number(item.variants[0].price) * 0.1).toLocaleString('en-IN')}</div>
                      </div>

                      <h3 className="text-md font-semibold text-[#202224] line-clamp-1">{item.name}</h3>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar key={i} className={`text-yellow-500 ${i < Math.round(item.rating || 4) ? '' : 'opacity-40'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
