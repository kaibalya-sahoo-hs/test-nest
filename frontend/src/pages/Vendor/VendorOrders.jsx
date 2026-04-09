import React, { useEffect, useState } from 'react';
import { FaBox, FaRupeeSign, FaTruck, FaCheckCircle, FaClock, FaCog } from 'react-icons/fa';
import { FiChevronDown, FiChevronUp, FiPackage, FiMapPin, FiUser } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'shipped': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'paid': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getNextStatus = (currentStatus) => {
    const transitions = {
      'completed': 'processing',
      'processing': 'shipped',
      'shipped': 'delivered',
    };
    return transitions[currentStatus] || null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock />;
      case 'completed': return <FaCheckCircle />;
      case 'processing': return <FaCog className="animate-spin" />;
      case 'shipped': return <FaTruck />;
      case 'delivered': return <FaCheckCircle />;
      default: return <FaBox />;
    }
  };

  const getOrders = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        api.get('/vendor/orders'),
        api.get('/vendor/orders/stats')
      ]);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.log(error);
      toast.error("Error while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const { data } = await api.patch(`/vendor/orders/${orderId}/status`, { status: newStatus });
      if (data.success) {
        toast.success(data.message);
        getOrders();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => { getOrders(); }, []);

  const filteredOrders = statusFilter
    ? orders.filter(o => o.status === statusFilter)
    : orders;

  const statusTimeline = ['pending', 'completed', 'processing', 'shipped', 'delivered'];

  return (
    <div className="bg-[#F5F6FA] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#202224]">Order Management</h1>
          <p className="text-gray-400 text-sm mt-1">Track and manage your store orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.totalOrders || 0, color: 'bg-purple-100 text-purple-600' },
            { label: 'Pending', value: stats.pendingOrders || 0, color: 'bg-amber-100 text-amber-600' },
            { label: 'Completed', value: stats.completedOrders || 0, color: 'bg-blue-100 text-blue-600' },
            { label: 'Processing', value: stats.processingOrders || 0, color: 'bg-indigo-100 text-indigo-600' },
            { label: 'Shipped', value: stats.shippedOrders || 0, color: 'bg-cyan-100 text-cyan-600' },
            { label: 'Delivered', value: stats.deliveredOrders || 0, color: 'bg-emerald-100 text-emerald-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-50">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-[#202224] mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['', 'pending', 'completed', 'processing', 'shipped', 'delivered'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-[#4379EE] text-white shadow-md'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {status || 'All Orders'}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FBFF] text-gray-400 uppercase text-[11px] tracking-widest font-bold">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="7" className="p-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#4379EE] border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading orders...</span>
                    </div>
                  </td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="7" className="p-20 text-center">
                    <FaBox className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 font-medium">No orders found</p>
                  </td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-[#202224] text-sm">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#202224]">{order.user?.name || 'Customer'}</p>
                          <p className="text-xs text-gray-400">{order.user?.email || ''}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.product?.image}
                                alt=""
                                className="w-8 h-8 rounded-lg object-cover border-2 border-white bg-gray-100"
                              />
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-[#202224] flex items-center text-sm">
                            <FaRupeeSign className="text-xs" />{Number(order.totalAmount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wide ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            {getNextStatus(order.status) && (
                              <button
                                onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status))}
                                disabled={updatingStatus === order.id}
                                className="px-3 py-1.5 bg-[#4379EE] text-white rounded-lg text-xs font-bold hover:bg-[#3768D1] transition-all disabled:opacity-50"
                              >
                                {updatingStatus === order.id ? '...' : `Mark ${getNextStatus(order.status)}`}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Order Details */}
                      {expandedId === order.id && (
                        <tr>
                          <td colSpan="7" className="bg-[#F9FBFF] px-8 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Products */}
                              <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <FiPackage size={14} /> Products
                                </h4>
                                <div className="space-y-3">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                                      <img src={item.product?.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#202224] truncate">{item.product?.name}</p>
                                        <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{Number(item.product?.price).toLocaleString('en-IN')}</p>
                                      </div>
                                      <p className="text-sm font-bold text-[#202224]">₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Customer & Address */}
                              <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <FiUser size={14} /> Customer
                                </h4>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 mb-4">
                                  <p className="font-bold text-[#202224]">{order.user?.name}</p>
                                  <p className="text-xs text-gray-400">{order.user?.email}</p>
                                </div>
                                {order.deliveryAddress && (
                                  <>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <FiMapPin size={14} /> Delivery Address
                                    </h4>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                                      <p className="text-sm font-medium text-[#202224]">{order.deliveryAddress.fullName}</p>
                                      <p className="text-xs text-gray-500 mt-1">{order.deliveryAddress.addressLine1}</p>
                                      <p className="text-xs text-gray-500">{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}</p>
                                      {order.deliveryAddress.phoneNumber && (
                                        <p className="text-xs text-gray-500 mt-1">Phone: {order.deliveryAddress.phoneNumber}</p>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Status Timeline */}
                              <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order Progress</h4>
                                <div className="space-y-3">
                                  {statusTimeline.map((step, idx) => {
                                    const currentIdx = statusTimeline.indexOf(order.status);
                                    const isCompleted = idx <= currentIdx;
                                    const isCurrent = idx === currentIdx;
                                    return (
                                      <div key={step} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                          isCompleted
                                            ? 'bg-[#4379EE] text-white'
                                            : 'bg-gray-100 text-gray-300'
                                        } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                                          {isCompleted ? <FaCheckCircle size={14} /> : idx + 1}
                                        </div>
                                        <span className={`text-sm font-medium capitalize ${isCompleted ? 'text-[#202224]' : 'text-gray-300'}`}>
                                          {step}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Coupon Info */}
                                {order.couponCode && (
                                  <div className="mt-4 bg-white p-3 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Coupon Applied</p>
                                    <p className="text-sm font-bold text-[#202224] mt-1">{order.couponCode}</p>
                                    <p className="text-xs text-gray-400">Discount: ₹{Number(order.discount || 0).toLocaleString('en-IN')}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOrders;