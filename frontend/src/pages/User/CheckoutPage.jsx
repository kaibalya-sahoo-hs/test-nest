import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import { CiCreditCard2, CiMapPin } from 'react-icons/ci';
import { FiShoppingBag } from 'react-icons/fi';

function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'))

  const fetchAddress = async () => {
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data);
      const defaultAdd = data.find((i) => i.isDefault);
      setDefaultAddress(defaultAdd || data[0]); // Fallback to first address if no default
    } catch (err) {
      toast.error("Failed to load addresses");
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  // Calculate Total
  const totalAmount = cart.items?.reduce((acc, item) => acc + item.product.price * item.quantity, 0) || 0;

  const handlePayment = async () => {
    try {
      if (user) {
        const response = await api.post('/payment/create-order', {
          amount: cart.total,
          cartItems: cart.items
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
            console.log("Response by Razor pay", response)
            const { data } = await api.post('/payment/verify', response)
            fetchCart()
            navigate('/orders')
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

        rzp.on('payment.failed', function (response) {
          toast.error("Payment Failed: " + response.error.description);
        });

        rzp.open();
      } else {
        toast.error("Login to checkout")
        navigate('/login')
      }

    } catch (error) {
      console.error("Payment Initiation Error:", error);
      toast.error("Could not initiate payment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Address & Items */}
        <div className="lg:col-span-2 space-y-6">

          {/* Address Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CiMapPin className="text-[#4379EE]" size={20} /> Shipping Address
              </h3>
              <button onClick={() => navigate('/address')} className="text-sm text-[#4379EE] font-medium">Change</button>
            </div>
            {defaultAddress ? (
              <div className="p-4 border border-[#4379EE]/20 bg-[#4379EE]/5 rounded-xl">
                <p className="font-bold text-gray-800">{defaultAddress.fullName}</p>
                <p className="text-sm text-gray-600">{defaultAddress.addressLine1}, {defaultAddress.city}</p>
                <p className="text-sm text-gray-600">{defaultAddress.state} - {defaultAddress.postalCode}</p>
                <p className="text-sm text-gray-600 mt-2">Phone: {defaultAddress.phoneNumber}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No address found. Please add one.</p>
            )}
          </div>

          {/* Items Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiShoppingBag className="text-[#4379EE]" size={20} /> Order Summary
            </h3>
            <div className="divide-y divide-gray-100">
              {cart.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={item.product.image} className="w-16 h-16 rounded-lg object-cover" alt="" />
                    <div>
                      <p className="font-bold text-gray-800">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Vendor: {item.product.vendor?.storeName || 'Marketplace'}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-800">₹{item.product.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Payment Details */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-lg font-bold mb-6">Price Details</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Price ({cart.items?.length} items)</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total Amount</span>
                <span className="text-xl font-bold text-[#4379EE]">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !cart.items?.length}
              className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${loading ? 'bg-gray-400' : 'bg-[#4379EE] hover:bg-[#3262cc] shadow-lg shadow-blue-200'
                }`}
            >
              <CiCreditCard2 size={20} />
              {loading ? 'Processing...' : 'Pay with Razorpay'}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-4 uppercase tracking-widest font-bold">100% Secure Payments</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CheckoutPage;