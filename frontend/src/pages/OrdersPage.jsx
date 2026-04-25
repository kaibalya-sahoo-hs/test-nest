import React, { useState, useEffect } from 'react';
import { api } from "../utils/api";
import { useNavigate, useParams } from 'react-router';
import { FaRupeeSign, FaCheckCircle, FaClock, FaTruck, FaCog, FaBox, FaTag, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import { FiPackage, FiX, FiChevronRight, FiMapPin, FiCreditCard } from 'react-icons/fi';

// ===================== ORDER DETAIL PAGE (/orders/:id) =====================
export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = async () => {
    try {
      const { data } = await api.get(`/users/my-orders/${id}`);
      if (data.success) setOrderDetail(data.order);
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrderDetail(); }, [id]);

  const statusTimeline = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'shipped': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[#4379EE] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-400 font-medium">Loading order details...</span>
      </div>
    </div>
  );

  if (!orderDetail) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <FiPackage className="mx-auto text-gray-300 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Order not found</h2>
        <button onClick={() => navigate('/orders')} className="text-[#4379EE] font-bold hover:underline">Back to Orders</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/orders')} className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all">
          <FaArrowLeft className="text-gray-600" size={14} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-[#202224]">Order Details</h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">#{orderDetail.id.slice(0, 12).toUpperCase()}</p>
        </div>
        <div className={`px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-tight ${getStatusColor(orderDetail.status)}`}>
          {orderDetail.status}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Order Progress</h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
          <div className="absolute top-4 left-0 h-0.5 bg-[#4379EE] transition-all" style={{ width: `${(statusTimeline.indexOf(orderDetail.status) / (statusTimeline.length - 1)) * 100}%` }}></div>
          {statusTimeline.map((step, idx) => {
            const currentIdx = statusTimeline.indexOf(orderDetail.status);
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCompleted ? 'bg-[#4379EE] text-white' : 'bg-white text-gray-300 border-2 border-gray-200'} ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}>
                  {isCompleted ? <FaCheckCircle size={14} /> : idx + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase mt-2 hidden sm:block ${isCompleted ? 'text-[#4379EE]' : 'text-gray-300'}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Products */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-[#202224] flex items-center gap-2"><FiPackage size={16} className="text-[#4379EE]" /> Items ({orderDetail.items?.length})</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {orderDetail.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <img src={item.productImage} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#202224] text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Sold by: {item.vendorName}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-base font-black text-[#202224] flex items-center flex-shrink-0">
                    <FaRupeeSign className="text-xs" />{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Orders */}
          {orderDetail.subOrders && orderDetail.subOrders.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="font-bold text-[#202224] flex items-center gap-2"><FaTruck size={14} className="text-[#4379EE]" /> Vendor Shipments ({orderDetail.subOrders.length})</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {orderDetail.subOrders.map(sub => (
                  <div key={sub.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{sub.vendorName}</p>
                        <p className="text-xs text-gray-400 font-mono">#{sub.id.slice(0, 8)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(sub.status)}`}>{sub.status}</span>
                        <span className="font-black text-[#4379EE] flex items-center"><FaRupeeSign className="text-xs" />{Number(sub.totalAmount).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {sub.items.map((item, i) => (
                        <img key={i} src={item.productImage} alt="" className="w-10 h-10 rounded-lg border border-gray-100 object-cover" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FiCreditCard size={14} /> Payment Summary</h3>
            <div className="space-y-3">
              {orderDetail.couponCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5"><FaTag size={10} className="text-emerald-500" /> Coupon</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs">{orderDetail.couponCode}</span>
                </div>
              )}
              {Number(orderDetail.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-bold text-emerald-600">- ₹{Number(orderDetail.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-bold text-emerald-600 text-xs uppercase">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-[#202224]">Total Paid</span>
                <span className="text-xl font-black text-[#4379EE] flex items-center"><FaRupeeSign className="text-sm" />{Number(orderDetail.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Payment</span>
                <span className={`font-bold uppercase ${orderDetail.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>{orderDetail.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {orderDetail.deliveryAddress && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FiMapPin size={14} /> Delivery Address</h3>
              <p className="font-bold text-[#202224] text-sm">{orderDetail.deliveryAddress.fullName}</p>
              <p className="text-xs text-gray-500 mt-1">{orderDetail.deliveryAddress.addressLine1}</p>
              <p className="text-xs text-gray-500">{orderDetail.deliveryAddress.city}, {orderDetail.deliveryAddress.state} - {orderDetail.deliveryAddress.postalCode}</p>
              {orderDetail.deliveryAddress.phoneNumber && (
                <p className="text-xs text-gray-500 mt-2">📞 {orderDetail.deliveryAddress.phoneNumber}</p>
              )}
            </div>
          )}

          {/* Order Date */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Order Date</h3>
            <p className="font-bold text-[#202224]">{new Date(orderDetail.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(orderDetail.createdAt).toLocaleTimeString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


// ===================== ORDERS LIST PAGE (/orders) =====================
function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/users/my-orders');
      if (data.success) setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'shipped': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <FaClock size={12} />;
      case 'paid': case 'completed': return <FaCheckCircle size={12} />;
      case 'processing': return <FaCog size={12} />;
      case 'shipped': return <FaTruck size={12} />;
      case 'delivered': return <FaCheckCircle size={12} />;
      default: return <FaBox size={12} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#4379EE] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400 font-medium">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#202224]">My Orders</h1>
          <p className="text-gray-400 text-sm mt-1">Track all your purchases</p>
        </div>
        {orders.length > 0 && (
          <span className="bg-blue-50 text-[#4379EE] px-4 py-2 rounded-full text-sm font-bold">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-50 shadow-sm">
          <FiPackage className="mx-auto text-gray-200 mb-4" size={64} />
          <h2 className="text-xl font-bold text-[#202224] mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">When you place an order, it will appear here.</p>
          <button onClick={() => navigate('/products')} className="bg-[#4379EE] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#3662c1] transition-all">
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Products</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Coupon</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="group hover:bg-blue-50/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono font-bold text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <p className="text-sm font-semibold text-gray-900 mt-1 truncate max-w-[160px]">
                          {order.items[0]?.productName}
                          {order.items.length > 1 && <span className="text-gray-400 font-normal"> +{order.items.length - 1}</span>}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <img key={index} className="w-10 h-10 rounded-lg border-2 border-white object-cover shadow-sm bg-gray-50" src={item.productImage} alt={item.productName} />
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">+{order.items.length - 3}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-gray-600 font-medium">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {order.couponCode ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-100 w-fit">
                              <FaTag size={8} /> {order.couponCode}
                            </span>
                            {Number(order.discount) > 0 && (
                              <span className="text-[10px] text-emerald-600 font-bold">-₹{Number(order.discount).toLocaleString('en-IN')} saved</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-base font-black text-gray-900 flex items-center">
                          <FaRupeeSign className="text-xs mr-0.5" />{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tight ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <FaChevronRight size={12} className="text-gray-300 group-hover:text-[#4379EE] transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 2).map((item, i) => (
                      <img key={i} className="w-10 h-10 rounded-lg border-2 border-white object-cover bg-gray-50" src={item.productImage} alt="" />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{order.items[0]?.productName}</p>
                    <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-gray-900 flex items-center"><FaRupeeSign className="text-xs" />{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
                    {order.couponCode && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold border border-emerald-100">
                        <FaTag size={7} /> {order.couponCode}
                      </span>
                    )}
                  </div>
                  <FaChevronRight size={12} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default OrdersPage;