import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  FaAngleLeft,
  FaStar,
  FaShoppingCart,
  FaArrowLeft,
  FaRupeeSign,
} from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { FaMinus, FaPlus } from "react-icons/fa6";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestedProducts, setSuggestedProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const { cart, addToCart, updateQuantity, removeItem } = useCart();
  const user = localStorage.getItem("user");


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
    const { data } = await api.get(`/products/suggest/${id}`)
    if (!data && !data.success) {
      toast.error('error while fetching')
    }
    setSuggestedProducts(data.products)
    setLoadingProducts(false)
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        console.log(response.data);
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
    fetchRecomendedProducts()
  }, [id, cart]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found.
      </div>
    );

  return (
    <div className="bg-[#F5F6FA] min-h-fit font-sans p-4 sm:p-8">
      {/* Navigation Header */}
      <div className="flex items-center mb-8 ml-15">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-[#202224] font-bold hover:text-[#4379EE] transition-colors cursor-pointer"
        >
          <FaArrowLeft className="font-light rounded-lg" />
          <span className="flex items-center">Back to Products</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Left Side: Sticky Image Container */}
        <div className="md:w-1/2 bg-gray-200 md:h-fit md:top-0 flex items-center justify-center p-8 border-r border-gray-50">
          <img
            src={
              product.image ||
              "https://rukminim2.flixcart.com/image/480/640/xif0q/smartwatch/c/y/h/-original-imagte6zvcbtz7z8.jpeg?q=90"
            }
            alt={"Product image"}
            className="w-full max-w-[400px] rounded-2xl h-auto object-contain mix-blend-multiply"
          />
        </div>

        {/* Right Side: Scrollable Details */}
        <div className="md:w-1/2 h-fit pl-8">
          <div className="max-w-xl mx-auto md:mx-0">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-[#202224] mt-1">
                  {product.name}
                </h1>
              </div>
            </div>

            {/* Price */}
            <div className="mb-8">
              <p className="text-4xl font-bold text-[#4379EE] flex items-center">
                <FaRupeeSign className="text-2xl" />
                {Number(product.price).toLocaleString("en-IN")}
              </p>
              {product.stock > 0 ? (
                <p className="text-sm text-green-500 font-semibold mt-1">
                  In Stock - Ready to ship
                </p>
              ) : (
                <p className="text-sm text-red-500 font-semibold mt-1">
                  Out of Stock
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-[#202224] uppercase mb-2">
                Description
              </h3>
              <p className="text-gray-500 leading-relaxed text-lg">
                {product.description ||
                  "No description provided for this product. Here is some filler text to ensure the content is long enough to demonstrate the scrolling effect on the right side while the image stays fixed."}
              </p>
            </div>
            {product && product.stock > 0 ? cartItem ? (
              /* IF IT IS IN THE CART: Show Quantity Controls */
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
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
                  className="bg-[#4379EE] px-8 py-4 rounded-xl text-base font-bold text-white cursor-pointer hover:bg-[#3768D1] transition-all shadow-lg flex items-center gap-2"
                  onClick={() => navigate("/cart")}
                >
                  <FaShoppingCart />
                  View Cart
                </button>
              </div>
            ) : (
              /* IF NOT IN THE CART: Show "Add to Cart" */
              <button
                aria-label="add to cart"
                className="w-full md:w-auto bg-[#4379EE] px-10 py-4 rounded-xl text-base font-bold text-white cursor-pointer hover:bg-[#3768D1] transition-all shadow-lg flex items-center justify-center gap-2"
                onClick={() => handleAddtoCart(product)}
              >
                Add to cart
              </button>
            ) : null}
            <div className="sticky bottom-8 md:static"></div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h1 className="text-xl font-semibold mb-4">Recommended</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {suggestedProducts.length === 0 ? (
            <p className="col-span-full text-gray-500">Loading...</p>
          ) : (
            suggestedProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col justify-between bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
              >
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 space-y-2">
                  <h2 className="text-lg font-semibold line-clamp-1">
                    {product.name}
                  </h2>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-blue-600">
                      ₹{product.price}
                    </span>
                    <span className="text-xs text-gray-400">
                      Stock: {product.stock}
                    </span>
                  </div>

                  <button className="w-full mt-3 bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition" onClick={() => navigate(`/products/${product.id}`)}>
                    View Product
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
