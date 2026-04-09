import React, { useState, useEffect } from 'react';
import { api } from "../utils/api";
import { FaRupeeSign, FaCheckCircle, FaClock, FaTruck, FaCog, FaBox, FaTag } from 'react-icons/fa';
import { FiPackage, FiX, FiChevronRight, FiMapPin, FiCreditCard } from 'react-icons/fi';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/users/my-orders');
      console.log(data);
      
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/users/my-orders/${orderId}`);
      if (data.success) {
        setOrderDetail(data.order);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order.id);
    fetchOrderDetail(order.id);
  };

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

  const statusTimeline = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

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
    <div className="min-h-screen">
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
          <p className="text-gray-400">When you place an order, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-50 shadow-sm overflow-hidden hover:border-blue-100 transition-all"
            >
              {/* Order Card Header */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Order info */}
                  <div className="flex items-start gap-4">
                    {/* Product thumbnails */}
                    <div className="flex -space-x-3 flex-shrink-0">
                      {order.items.slice(0, 3).map((item, index) => (
                        <img
                          key={index}
                          className="w-14 h-14 rounded-xl border-2 border-white object-cover shadow-sm bg-gray-100"
                          src={item.productImage}
                          alt={item.productName}
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-14 h-14 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-300 font-mono mt-0.5">
                        #{order.id.slice(0, 12).toUpperCase()}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                            {item.productName}
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-xs text-gray-400 px-2 py-0.5">
                            +{order.items.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price, Status, Action */}
                  <div className="flex items-center gap-4 md:gap-6">
                    {/* Price */}
                    <div className="text-right">
                      <span className="text-xl font-black text-[#202224] flex items-center">
                        <FaRupeeSign className="text-sm" />
                        {parseFloat(order.totalAmount).toLocaleString('en-IN')}
                      </span>
                      {order.discount > 0 && (
                        <p className="text-xs text-emerald-500 font-bold flex items-center gap-1 justify-end mt-0.5">
                          <FaTag size={10} /> Saved ₹{Number(order.discount).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wide ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>

                    {/* View Details */}
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex items-center gap-1 px-4 py-2 bg-[#F5F6FA] text-[#202224] rounded-xl text-sm font-bold hover:bg-[#4379EE] hover:text-white transition-all"
                    >
                      Details <FiChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setSelectedOrder(null); setOrderDetail(null); }}>
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-black text-[#202224]">Order Details</h2>
                <p className="text-xs text-gray-400 font-mono">#{selectedOrder.slice(0, 12).toUpperCase()}</p>
              </div>
              <button
                onClick={() => { setSelectedOrder(null); setOrderDetail(null); }}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <FiX size={20} className="text-gray-400" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-16 text-center">
                <div className="w-8 h-8 border-2 border-[#4379EE] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading order details...</p>
              </div>
            ) : orderDetail ? (
              <div className="p-6 space-y-6">
                {/* Status Timeline */}
                <div className="bg-[#F9FBFF] rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Order Status</h3>
                  <div className="flex items-center justify-between relative">
                    {/* Progress bar background */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
                    <div
                      className="absolute top-4 left-0 h-0.5 bg-[#4379EE] transition-all"
                      style={{ width: `${(statusTimeline.indexOf(orderDetail.status) / (statusTimeline.length - 1)) * 100}%` }}
                    ></div>
                    {statusTimeline.map((step, idx) => {
                      const currentIdx = statusTimeline.indexOf(orderDetail.status);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={step} className="flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-[#4379EE] text-white'
                              : 'bg-white text-gray-300 border-2 border-gray-200'
                          } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}>
                            {isCompleted ? <FaCheckCircle size={14} /> : idx + 1}
                          </div>
                          <span className={`text-[10px] font-bold uppercase mt-2 ${isCompleted ? 'text-[#4379EE]' : 'text-gray-300'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FiPackage size={14} /> Items ({orderDetail.items?.length})
                  </h3>
                  <div className="space-y-3">
                    {orderDetail.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-[#F9FBFF] p-4 rounded-xl border border-gray-50">
                        <img src={item.productImage} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-100" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#202224]">{item.productName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Vendor: {item.vendorName}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-lg font-black text-[#202224] flex items-center">
                          <FaRupeeSign className="text-sm" />{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Delivery Address */}
                  {orderDetail.deliveryAddress && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiMapPin size={14} /> Delivery Address
                      </h3>
                      <div className="bg-[#F9FBFF] p-4 rounded-xl border border-gray-50">
                        <p className="font-bold text-[#202224] text-sm">{orderDetail.deliveryAddress.fullName}</p>
                        <p className="text-xs text-gray-500 mt-1">{orderDetail.deliveryAddress.addressLine1}</p>
                        <p className="text-xs text-gray-500">{orderDetail.deliveryAddress.city}, {orderDetail.deliveryAddress.state} - {orderDetail.deliveryAddress.postalCode}</p>
                        {orderDetail.deliveryAddress.phoneNumber && (
                          <p className="text-xs text-gray-500 mt-1">📞 {orderDetail.deliveryAddress.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Info */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FiCreditCard size={14} /> Payment Summary
                    </h3>
                    <div className="bg-[#F9FBFF] p-4 rounded-xl border border-gray-50 space-y-3">
                      {orderDetail.couponCode && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1"><FaTag size={10} /> Coupon</span>
                          <span className="font-bold text-emerald-600">{orderDetail.couponCode}</span>
                        </div>
                      )}
                      {orderDetail.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Discount</span>
                          <span className="font-bold text-emerald-600">- ₹{Number(orderDetail.discount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span className="font-bold text-emerald-600 text-xs uppercase">Free</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                        <span className="font-bold text-[#202224]">Total Paid</span>
                        <span className="text-xl font-black text-[#4379EE] flex items-center">
                          <FaRupeeSign className="text-sm" />{Number(orderDetail.totalAmount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Payment Status</span>
                        <span className={`font-bold uppercase ${orderDetail.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {orderDetail.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;