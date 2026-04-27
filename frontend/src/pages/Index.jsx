import React, { useEffect, useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast';
import { FaRupeeSign, FaShoppingCart, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaStar, FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { LuCreditCard, LuHeadphones, LuRotateCcw, LuTruck, LuShieldCheck, LuPackage } from 'react-icons/lu';
import { FiMail, FiMapPin, FiPhone, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

function Index() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [email, setEmail] = useState('');
  const trendingRef = useRef(null);
  const newRef = useRef(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Banner carousel data
  const banners = [
    {
      title: "Summer Sale is Here",
      subtitle: "Up to 50% off on electronics",
      cta: "Shop Now",
      bg: "from-[#4379EE] to-[#6C63FF]",
      accent: "#FF8743",
    },
    {
      title: "New Arrivals Daily",
      subtitle: "Discover the latest trends & gadgets",
      cta: "Explore",
      bg: "from-[#1a1a2e] to-[#16213e]",
      accent: "#00D2FF",
    },
    {
      title: "Free Shipping Worldwide",
      subtitle: "No minimum order required this weekend",
      cta: "Start Shopping",
      bg: "from-[#0f3443] to-[#34e89e]",
      accent: "#FBBF24",
    }
  ];

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        if (data) {
          const products = data.products || data.data || data;
          if (Array.isArray(products)) {
            setTrendingProducts(products.slice(0, 8));
            const sorted = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNewArrivals(sorted.slice(0, 8));
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoadingTrending(false);
        setLoadingNew(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    if (product.stock < 1) {
      toast.error("Sorry, this product is out of stock.");
      return;
    }
    await addToCart(product);
    toast.success("Added to cart!");
  };

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const features = [
    { icon: <LuTruck size={28} />, title: "Fast Delivery", desc: "Within 24 hours" },
    { icon: <LuRotateCcw size={28} />, title: "Easy Returns", desc: "24-hour return policy" },
    { icon: <LuCreditCard size={28} />, title: "Secure Payment", desc: "100% protected" },
    { icon: <LuHeadphones size={28} />, title: "24/7 Support", desc: "Always available" },
  ];

  const categories = [
    { name: "Electronics", emoji: "💻", color: "from-blue-500 to-indigo-600" },
    { name: "Fashion", emoji: "👕", color: "from-pink-500 to-rose-600" },
    { name: "Home", emoji: "🏠", color: "from-amber-500 to-orange-600" },
    { name: "Beauty", emoji: "✨", color: "from-purple-500 to-fuchsia-600" },
    { name: "Sports", emoji: "⚽", color: "from-green-500 to-emerald-600" },
    { name: "Books", emoji: "📚", color: "from-cyan-500 to-teal-600" },
  ];

  const ProductCard = ({ item }) => (
    <div
      className="flex-shrink-0 w-[200px] sm:w-[230px] bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300 cursor-pointer group"
    >
      <div className="h-40 w-full overflow-hidden bg-gray-50 relative" onClick={() => navigate(`/products/${item.id}`)}>
        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {item.stock < 1 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-red-500 px-3 py-1 rounded-full">Sold Out</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-[#202224] line-clamp-1 mb-1 cursor-pointer" onClick={() => navigate(`/products/${item.id}`)}>{item.name}</h3>
        <p className="text-xs text-gray-400 line-clamp-1 mb-3">{item.vendor?.storeName || 'Marketplace'}</p>
        <div className="flex justify-between items-center">
          <span className="text-base font-black text-[#4379EE] flex items-center">
            <FaRupeeSign className="text-xs" />{Number(item.price).toLocaleString('en-IN')}
          </span>
          {item.stock > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
              className="p-2 bg-[#4379EE] text-white rounded-lg hover:bg-[#3662c1] transition-all active:scale-90 cursor-pointer"
              title="Add to Cart"
            >
              <FaShoppingCart size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ title, subtitle, onViewAll }) => (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#202224]">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={onViewAll} className="flex items-center gap-1.5 text-sm font-bold text-[#4379EE] hover:text-[#3662c1] transition-colors cursor-pointer">
        View All <FiArrowRight size={16} />
      </button>
    </div>
  );

  return (
    <div className="bg-[#F5F6FA] min-h-screen font-sans">

      {/* ==================== BANNER CAROUSEL ==================== */}
      <div className="relative w-full h-[220px] sm:h-[320px] rounded-2xl overflow-hidden mb-8 shadow-lg">
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-gradient-to-r ${banner.bg} flex items-center px-6 sm:px-14 transition-all duration-700 ease-in-out ${idx === currentBanner ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
          >
            {/* Decorative SVG */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <circle cx="80%" cy="20%" r="200" fill="white" opacity="0.1" />
                <circle cx="90%" cy="80%" r="150" fill="white" opacity="0.08" />
                <path d="M0 100 Q 250 50 400 200 T 800 150 T 1200 250" stroke="white" fill="transparent" strokeWidth="2" />
              </svg>
            </div>
            <div className="relative z-10 text-white max-w-lg">
              <p className="text-xs sm:text-sm font-medium mb-2 opacity-80 tracking-wide uppercase">Limited Time Offer</p>
              <h2 className="text-2xl sm:text-4xl font-black mb-3 leading-tight">{banner.title}</h2>
              <p className="text-sm sm:text-base mb-6 opacity-80">{banner.subtitle}</p>
              <button
                onClick={() => navigate('/products')}
                className="text-white px-6 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-95 flex items-center gap-2"
                style={{ backgroundColor: banner.accent }}
              >
                {banner.cta} <FaArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${idx === currentBanner ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <button onClick={() => setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white backdrop-blur-sm transition-all z-20 cursor-pointer">
          <FaAngleLeft size={18} />
        </button>
        <button onClick={() => setCurrentBanner(prev => (prev + 1) % banners.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white backdrop-blur-sm transition-all z-20 cursor-pointer">
          <FaAngleRight size={18} />
        </button>
      </div>

      {/* ==================== PROMOTIONAL GRID ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-10">
        <div className="md:col-span-2 relative rounded-2xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] overflow-hidden group min-h-[280px] flex items-center">
          <div className="relative z-10 p-8 sm:p-12">
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2 inline-block">Trending Now</span>
            <h2 className="text-white text-2xl sm:text-3xl font-black mb-3 leading-tight">Premium Electronics<br />Collection</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-[300px]">Explore the latest gadgets from top brands.</p>
            <button onClick={() => navigate('/products')} className="bg-[#4379EE] hover:bg-[#3662c1] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer">
              Shop Now <FaArrowRight size={12} />
            </button>
          </div>
          <img src="https://webandcrafts.com/_next/image?url=https%3A%2F%2Fadmin.wac.co%2Fuploads%2FWhat_is_E_commerce_and_What_are_its_Applications_2_d2eb0d4402.jpg&w=4500&q=90" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
        </div>

        <div className="grid grid-rows-2 gap-4 lg:gap-6">
          <div className="relative bg-gradient-to-br from-black to-gray-900 rounded-2xl p-6 overflow-hidden flex flex-col justify-center">
            <div className="relative z-10">
              <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">Hot Deal</span>
              <h3 className="text-white text-xl font-black mt-1 mb-3 leading-tight">Summer<br />Essentials</h3>
              <button onClick={() => navigate('/products')} className="bg-[#4379EE] hover:bg-[#3662c1] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer">
                Shop Now <FaArrowRight size={10} />
              </button>
            </div>
            <div className="absolute top-3 right-3 bg-yellow-400 text-black font-black px-2.5 py-0.5 text-xs rounded-lg">29% OFF</div>
          </div>

          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 overflow-hidden flex items-center">
            <div className="relative z-10 flex-1">
              <h3 className="text-white text-xl font-black mb-1 leading-tight">Accessories<br />& More</h3>
              <p className="text-blue-400 font-bold text-sm mb-3">Starting ₹299</p>
              <button onClick={() => navigate('/products')} className="bg-[#4379EE] hover:bg-[#3662c1] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer">
                Shop Now <FaArrowRight size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== TRENDING PRODUCTS ==================== */}
      <div className="mb-10">
        <SectionHeader title="Trending Products" subtitle="Most popular picks this week" onViewAll={() => navigate('/products')} />
        {loadingTrending ? (
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-shrink-0 w-[230px] bg-white rounded-2xl p-4 animate-pulse">
                <div className="h-40 bg-gray-100 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : trendingProducts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No products available yet.</p>
        ) : (
          <div className="relative">
            <div ref={trendingRef} className="flex gap-4 overflow-x-auto pb-4 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
              {trendingProducts.map(item => <ProductCard key={item.id} item={item} />)}
            </div>
            {trendingProducts.length > 4 && (
              <>
                <button onClick={() => scrollContainer(trendingRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 bg-white p-2.5 rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-[#4379EE] transition-all z-10 hidden sm:block cursor-pointer"><FaChevronLeft size={12} /></button>
                <button onClick={() => scrollContainer(trendingRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 bg-white p-2.5 rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-[#4379EE] transition-all z-10 hidden sm:block cursor-pointer"><FaChevronRight size={12} /></button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ==================== FEATURES ==================== */}
      <div className="mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-5 flex flex-col sm:flex-row items-center sm:items-start gap-3 border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all text-center sm:text-left">
              <div className="text-[#4379EE] flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="text-sm font-black text-gray-900 leading-tight mb-0.5">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  )
}

export default Index