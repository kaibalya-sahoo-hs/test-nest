import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { CiCreditCard2, CiMapPin } from "react-icons/ci";
import { FiShoppingBag } from "react-icons/fi";

function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [billing, setBilling] = useState({
    name: "",
    email: "",
    country: "United States of America",
    city: "",
    state: "",
    streetAddress: "",
    postalCode: null,
    phoneNumber: "",
    addressType: "home",
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isCartEmpty = !cart?.items || cart.items.length === 0;
  const fetchAddress = async () => {
    // Only attempt to fetch addresses when a user is logged in
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) navigate('/login');
    try {
      const { data } = await api.get("/addresses");
      setAddresses(data);
      const defaultAdd = data.find((i) => i.isDefault);
      setDefaultAddress(defaultAdd);
    } catch (err) {
      toast.error("Failed to load addresses");
    }
  };

  useEffect(() => {
    // Only fetch addresses when there are items in the cart. Avoids
    // unnecessary auth calls for empty carts which may trigger redirects.
    if (cart.items && cart.items.length > 0) {
      fetchAddress();
    }
    // Re-run when number of items changes
  }, [cart.items?.length]);

  // Ensure top of page is visible when this page mounts
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (err) {

    }
  }, []);

  // Prefill billing when default address is available
  useEffect(() => {
    if (defaultAddress) {
      setBilling((b) => ({
        ...b,
        name: defaultAddress.fullName || b.name,
        email: (JSON.parse(localStorage.getItem('user'))?.email) || b.email,
        country: defaultAddress.country || b.country,
        city: defaultAddress.city || b.city,
        state: defaultAddress.state || b.state,
        streetAddress: defaultAddress.streetAddress || b.streetAddress,
        postalCode: defaultAddress.postalCode || b.postalCode,
        phoneNumber: defaultAddress.phoneNumber || b.phoneNumber,
        addressType: defaultAddress.addressType || b.addressType,
      }));
    }
  }, [defaultAddress]);

  const handleSaveAddress = async () => {
    // Validate minimal fields
    if (!billing.name || !billing.phoneNumber || !billing.streetAddress || !billing.postalCode) {
      toast.error('Please fill name, phone, street and postal code');
      return;
    }

    if (billing.name.trim() === "" || billing.streetAddress.trim() === "" || billing.email.trim() === "" || billing.country.trim() === "" || billing.city.trim() === "" || billing.state.trim() === "") {
      toast.error("fields cannot be empty")
      return
    }

    if (billing.postalCode.length != 6) {
      toast.error('Postal code must be exactly 6 digits')
      return
    }
    try {
      setSavingAddress(true);
      const payload = {
        fullName: billing.name,
        phoneNumber: billing.phoneNumber,
        streetAddress: billing.streetAddress,
        postalCode: billing.postalCode,
        city: billing.city,
        state: billing.state,
        country: billing.country,
        addressType: billing.addressType,
        isDefault: true,
      };
      await api.post('/addresses', payload);
      toast.success('Address saved and set as default');
      await fetchAddress();
    } catch (err) {
      console.error(err);
      toast.error('Could not save address');
    } finally {
      setSavingAddress(false);
    }
  };

  // Calculate Total
  const totalAmount =
    cart.items?.reduce(
      (acc, item) => acc + (item.variant?.price || item.product.price) * item.quantity,
      0,
    ) || 0;

  const handlePayment = async () => {
    try {
      if (!defaultAddress) {
        toast.error("No deafult address selected");
        return;
      }

      if (!billing.name || !billing.phoneNumber || !billing.streetAddress || !billing.postalCode) {
        toast.error('Please fill name, phone, street and postal code');
        return;
      }

      if (billing.name.trim() === "" || billing.streetAddress.trim() === "" || billing.email.trim() === "" || billing.country.trim() === "" || billing.city.trim() === "" || billing.state.trim() === "") {
        toast.error("fields cannot be empty")
        return
      }

      if (billing.postalCode.length != 6) {
        toast.error('Postal code must be exactly 6 digits')
        return
      }
      setLoading(true)

      if (user) {
        if (!defaultAddress) {
          toast.error("Please add a default shipping address to proceed");
          return;
        }
        console.log(cart.discountedAmount)
        const response = await api.post('/payment/create-order', {
          coupon: cart.coupon ? cart.coupon.code : null,
          amount: cart.discountedAmount,
          cartItems: cart.items,
          cartId: cart.id
        });
        const order = response.data;
        const options = {
          key: import.meta.env.VITE_RAZORPAY_TEST_KEY, // Your Public Key ID
          amount: order.amount,
          currency: order.currency,
          name: "DashStack Store",
          description: "Random Description",
          order_id: order.id,
          handler: async function (response) {
            const { data } = await api.post("/payment/verify", response);
            console.log("Payment verification");
            navigate("/orders");
            fetchCart();
          },
          modal: {
            onDismiss: async function () {
              await api.post('/payment/dismiss')
              navigate('/orders')
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#4379EE", // Matches your brand color
          },
        };

        const rzp = new window.Razorpay(options);
        await api.post('/users/clearcart')


        rzp.on("payment.failed", function (response) {
          toast.error("Payment Failed: " + response.error.description);
        });

        rzp.open();
        fetchCart();
      } else {
        toast.error("Login to checkout");
        sessionStorage.setItem("redirectTo", "/checkout");
        navigate("/login");
      }
    } catch (error) {
      console.log(error.response)
      console.error("Payment Initiation Error:", error);
      toast.error(error.response.data.message || "Could not initiate payment");
    }
    setLoading(false)
  };

  if (isCartEmpty) {
    return (
      <div className="flex items-center justify-center">
        <div className="max-w-xl w-full text-center p-8 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to proceed to checkout.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/products')} className="px-6 py-3 bg-[#4379EE] text-white rounded-xl font-bold">Browse Products</button>
            <button onClick={() => navigate('/cart')} className="px-6 py-3 border border-gray-200 rounded-xl">View Cart</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
        <div className="text-center lg:col-span-3 mb-4">
          <h1 className="text-3xl font-extrabold text-[#202224]">Checkout</h1>
          <p className="text-sm text-gray-500 mt-2">{cart.items && cart.items.length} items on your cart</p>
        </div>
        {/* Left Column: Billing Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6">Billing Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">First & Last Name</label>
                <input
                  value={billing.name}
                  onChange={(e) => setBilling({ ...billing, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f0f4ff]"
                  placeholder="i.e. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                <input
                  value={billing.email}
                  onChange={(e) => setBilling({ ...billing, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f0f4ff]"
                  placeholder="i.e. john@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Country</label>
                <input
                  value={billing.country}
                  onChange={(e) => setBilling({ ...billing, country: e.target.value })}
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none bg-white"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">City/State</label>
                <input
                  value={billing.city}
                  onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f0f4ff]"
                  placeholder="City"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Zip/Postal Code</label>
                <input
                  value={billing.postalCode}
                  type="number"
                  onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })}
                  className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f0f4ff]"
                  placeholder="Zip Code"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Street Address</label>
                <input value={billing.streetAddress} onChange={(e) => setBilling({ ...billing, streetAddress: e.target.value })} className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f0f4ff]" placeholder="Street address" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">State</label>
                <input value={billing.state} onChange={(e) => setBilling({ ...billing, state: e.target.value })} className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f0f4ff]" placeholder="State" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                <input value={billing.phoneNumber} type="number" onChange={(e) => setBilling({ ...billing, phoneNumber: e.target.value })} className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#f0f4ff]" placeholder="Phone number" />
              </div>
              <div className="md:col-span-2">
                {!defaultAddress ? (
                  <div className="flex gap-3 mt-3">
                    <button onClick={handleSaveAddress} disabled={savingAddress} className="px-5 py-3 bg-[#4379EE] text-white rounded-md font-bold">{savingAddress ? 'Saving...' : 'Save & set as default'}</button>
                    <button onClick={() => { setBilling({ name: '', email: '', country: 'United States of America', city: '', state: '', streetAddress: '', postalCode: '', phoneNumber: '', addressType: 'home' }); }} className="px-5 py-3 border rounded-md">Clear</button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mt-2">Using saved shipping address. <button onClick={() => navigate('/address')} className="text-[#4379EE] ml-2">Change</button></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Details Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-sm font-bold text-gray-700 mb-4">ORDER DETAILS</h3>

            <div className="space-y-3 mb-4">
              {cart.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                  <img src={item.variant.image} alt="" className="w-12 h-12 rounded-md object-cover" />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-800 line-clamp-1">{item.product.name}</div>
                    <div className="text-xs text-gray-500">{item.quantity} items</div>
                  </div>
                  <div className="text-sm font-bold">₹{(item.variant.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-gray-500 text-sm mb-6">
              <span>Delivery Fee</span>
              <span className="text-green-500 font-bold">FREE</span>
            </div>

            {cart.discount && Number(cart.discount) > 0 && <div className="flex justify-between text-gray-500 text-sm mb-6">
              <span>Discount</span>
              <span className="text-green-500 font-semibold">{"-" + cart?.discount.toLocaleString('en-IN')}</span>
            </div>}

            <div className="mb-6">
              <div className="text-xs text-gray-400 uppercase mb-1">Total Price</div>
              <div className="text-2xl font-extrabold text-[#202224]">₹{cart.discountedAmount && cart.discountedAmount.toLocaleString('en-IN')}</div>
            </div>

            <button onClick={handlePayment} disabled={loading} className={`w-full py-3 rounded-lg font-bold text-white ${loading ? 'bg-gray-300' : 'bg-[#4379EE] hover:bg-[#4379EE]'} transition-all`}>Pay With Razorpay</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
