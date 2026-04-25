import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    FaArrowLeft, FaBox, FaRegClock, FaTruck, FaRupeeSign,
    FaCheckCircle, FaUser, FaCreditCard, FaMapMarkerAlt, FaTag, FaStore
} from 'react-icons/fa';
import { FiPackage, FiCreditCard, FiMapPin } from 'react-icons/fi';
import api from '../../utils/api';

function OrderInfo() {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [subOrders, setSubOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    async function fetchOrderDetails() {
        try {
            const response = await api.get(`/admin/orders/${orderId}`);
            setOrderDetails(response.data.order);
            setSubOrders(response.data.subOrders || []);
            setPayments(response.data.payments || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching order details:", error);
            setLoading(false);
        }
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'processing': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'shipped': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const statusTimeline = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

    useEffect(() => { fetchOrderDetails(); }, [orderId]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-[#4379EE] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 font-medium">Loading order data...</span>
            </div>
        </div>
    );

    if (!orderDetails) return (
        <div className="min-h-[60vh] flex items-center justify-center text-center">
            <div>
                <FiPackage className="mx-auto text-gray-300 mb-4" size={48} />
                <h2 className="text-lg font-bold text-gray-700 mb-2">Order not found</h2>
                <button onClick={() => navigate(-1)} className="text-[#4379EE] font-bold hover:underline">Go back</button>
            </div>
        </div>
    );

    const currentStatusIdx = statusTimeline.indexOf(orderDetails.status);

    return (
        <div className="min-h-screen max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all">
                        <FaArrowLeft className="text-gray-600" size={14} />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-[#202224]">Order #{orderDetails.id.slice(-8).toUpperCase()}</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Placed on {new Date(orderDetails.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-tight flex items-center gap-2 w-fit ${getStatusColor(orderDetails.status)}`}>
                    <FaRegClock size={12} /> {orderDetails.status}
                </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Order Progress</h3>
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
                    <div className="absolute top-4 left-0 h-0.5 bg-[#4379EE] transition-all duration-500" style={{ width: `${Math.max(0, (currentStatusIdx / (statusTimeline.length - 1)) * 100)}%` }}></div>
                    {statusTimeline.map((step, idx) => {
                        const isCompleted = idx <= currentStatusIdx;
                        const isCurrent = idx === currentStatusIdx;
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
                {/* Left Column: Items + Sub-orders */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Order Items */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="font-bold text-[#202224] flex items-center gap-2"><FaBox className="text-[#4379EE]" size={14} /> Order Items</h2>
                            <span className="text-xs text-gray-400 font-bold">{orderDetails.items?.length} item{orderDetails.items?.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/80 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">Product</th>
                                        <th className="px-6 py-3 text-right">Price</th>
                                        <th className="px-6 py-3 text-center">Qty</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orderDetails.items?.map((item) => (
                                        <tr key={item.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.product?.image} alt="" className="w-10 h-10 rounded-lg border border-gray-100 object-cover flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-800 text-sm truncate max-w-[200px]">{item.product?.name}</p>
                                                        <p className="text-[10px] text-gray-400">by {item.product?.vendor?.storeName || item.product?.vendor?.name || 'Unknown'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-600 font-medium">₹{Number(item.product?.price).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-600">×{item.quantity}</td>
                                            <td className="px-6 py-4 text-right font-black text-gray-900">₹{(item.quantity * Number(item.product?.price)).toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sub-Orders by Vendor */}
                    {subOrders.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50">
                                <h2 className="font-bold text-[#202224] flex items-center gap-2"><FaStore className="text-[#4379EE]" size={14} /> Vendor Sub-Orders ({subOrders.length})</h2>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {subOrders.map((sub) => (
                                    <div key={sub.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            {/* Vendor Info */}
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 text-[#4379EE] rounded-xl flex-shrink-0">
                                                    <FaTruck size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Sub-Order</p>
                                                    <p className="text-xs font-mono font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 inline-block">#{sub.id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>

                                            {/* Vendor Details */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 sm:pl-6 sm:border-l border-gray-100">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Vendor</p>
                                                    <p className="text-sm font-bold text-gray-800 truncate">{sub.vendor?.name || "N/A"}</p>
                                                    <p className="text-xs text-gray-500">{sub.vendor?.storeName || "Private Store"}</p>
                                                    {sub.vendor?.email && <p className="text-[10px] text-gray-400 mt-0.5">{sub.vendor.email}</p>}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status</p>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(sub.status)}`}>
                                                        {sub.status}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Amount</p>
                                                    <p className="text-lg font-black text-[#4379EE] flex items-center"><FaRupeeSign className="text-sm" />{Number(sub.totalAmount).toLocaleString('en-IN')}</p>
                                                    {Number(sub.discount) > 0 && (
                                                        <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5"><FaTag size={8} /> -₹{Number(sub.discount).toLocaleString('en-IN')}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sub-order items thumbnails */}
                                        {sub.items && sub.items.length > 0 && (
                                            <div className="flex gap-2 mt-4 pl-16">
                                                {sub.items.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100">
                                                        <img src={item.product?.image} alt="" className="w-7 h-7 rounded object-cover" />
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-gray-700 truncate max-w-[100px]">{item.product?.name}</p>
                                                            <p className="text-[9px] text-gray-400">×{item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Customer, Payment, Order Info */}
                <div className="space-y-6">

                    {/* Customer Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FaUser className="text-[#4379EE]" size={12} /> Customer</h3>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-sm flex-shrink-0">
                                {orderDetails.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-gray-800">{orderDetails.user?.name || 'Guest'}</p>
                                <p className="text-xs text-gray-500 truncate">{orderDetails.user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FiCreditCard size={14} /> Payment Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-bold text-gray-800">₹{Number(orderDetails.totalAmount + (orderDetails.discount || 0)).toLocaleString('en-IN')}</span>
                            </div>
                            {orderDetails.couponCode && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-1.5"><FaTag size={10} className="text-emerald-500" /> Coupon</span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs">{orderDetails.couponCode}</span>
                                </div>
                            )}
                            {Number(orderDetails.discount) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Discount</span>
                                    <span className="font-bold text-emerald-600">- ₹{Number(orderDetails.discount).toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                <span className="font-bold text-[#202224]">Total</span>
                                <span className="text-xl font-black text-[#4379EE] flex items-center"><FaRupeeSign className="text-sm" />{Number(orderDetails.totalAmount).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payments List */}
                    {payments.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FaCreditCard className="text-[#4379EE]" size={12} /> Payments ({payments.length})</h3>
                            <div className="space-y-3">
                                {payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="text-xs font-mono font-bold text-gray-600">#{payment.id?.slice(0, 8)}</p>
                                            <p className={`text-[10px] font-bold uppercase mt-0.5 ${payment.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>{payment.status}</p>
                                        </div>
                                        <p className="font-bold text-gray-800 text-sm flex items-center"><FaRupeeSign className="text-[10px]" />{Number(payment.amount).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Delivery Address */}
                    {orderDetails.deliveryAddress && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FiMapPin size={14} /> Delivery Address</h3>
                            <p className="font-bold text-[#202224] text-sm">{orderDetails.deliveryAddress?.fullName}</p>
                            <p className="text-xs text-gray-500 mt-1">{orderDetails.deliveryAddress?.addressLine1}</p>
                            <p className="text-xs text-gray-500">{orderDetails.deliveryAddress?.city}, {orderDetails.deliveryAddress?.state} - {orderDetails.deliveryAddress?.postalCode}</p>
                            {orderDetails.deliveryAddress?.phoneNumber && (
                                <p className="text-xs text-gray-500 mt-2">📞 {orderDetails.deliveryAddress.phoneNumber}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OrderInfo;