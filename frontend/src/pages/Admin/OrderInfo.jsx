import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    FaArrowLeft, FaBox, FaRegClock, FaTruck,
    FaCheckCircle, FaUser, FaCreditCard, FaMapMarkerAlt
} from 'react-icons/fa';
import api from '../../utils/api';

function OrderInfo() {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = React.useState(null);
    const [subOrders, setSubOrders] = React.useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    async function fetchOrderDetails() {
        try {
            const response = await api.get(`/admin/orders/${orderId}`);
            console.log(response.data.subOrders)
            setOrderDetails(response.data.order);
            setSubOrders(response.data.subOrders);
            setLoading(false)
        } catch (error) {
            console.error("Error fetching order details:", error);
        }
    }


    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    if (loading) return <div className="p-8 text-center font-medium">Loading secure order data...</div>;
    if (!orderDetails) return <div className="p-8 text-center text-red-500">Order not found.</div>;
    return (
        <div className="bg-[#F5F6FA] min-h-screen">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        <FaArrowLeft className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#202224]">Order #{orderDetails.id.slice(-8).toUpperCase()}</h1>
                        <p className="text-sm text-gray-500">Placed on {new Date(orderDetails.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${getStatusColor(orderDetails.status)}`}>
                    <FaRegClock /> {orderDetails.status.toUpperCase()}
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Side: Order Items and Sub-orders */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Items Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <FaBox className="text-blue-500" /> Order Items
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Qty</th>
                                        <th className="px-6 py-4">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orderDetails.items?.map((item) => (
                                        <tr key={item.id} className="text-sm">
                                            <td className="px-6 py-4 font-medium text-gray-800">{item.product.name}</td>
                                            <td className="px-6 py-4 text-gray-500">${item.product.price}</td>
                                            <td className="px-6 py-4 text-gray-500">x{item.quantity}</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-800">${(item.quantity * item.product.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {subOrders.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="font-bold text-lg px-2">Sub-Orders</h2>
                            {subOrders.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    {/* Left Section: Icon & Order ID */}
                                    <div className="flex items-center gap-4 min-w-fit">
                                        <div className="p-3.5 bg-blue-50 text-[#4379EE] rounded-xl flex-shrink-0">
                                            <FaTruck size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Sub-Order ID</p>
                                            <p className="text-sm font-mono font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                #{sub.id.slice(-6).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Middle Section: Vendor Info (Separated & Aligned) */}
                                    <div className="flex flex-1 grid grid-cols-2 gap-4 border-l-0 md:border-l border-gray-100 md:pl-6">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Vendor</p>
                                            <p className="text-sm font-bold text-gray-800 truncate">{sub.vendor?.name || "N/A"}</p>
                                            <p className="text-xs text-gray-500 italic">{sub.vendor?.storeName || "Private Store"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status</p>
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase border ${sub.status === 'pending'
                                                    ? 'bg-orange-50 text-orange-600 border-orange-100'
                                                    : 'bg-green-50 text-green-600 border-green-100'
                                                }`}>
                                                {sub.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Section: Price & Actions */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                                        <p className="text-xl font-black text-[#4379EE]">
                                            ${sub.totalAmount.toLocaleString()}
                                        </p>
                                        <button className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Customer & Payment Info */}
                <div className="space-y-8">
                    {/* Customer Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FaUser className="text-blue-500" /> Customer
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                {orderDetails.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{orderDetails.user?.name || 'Guest User'}</p>
                                <p className="text-xs text-gray-500">{orderDetails.user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderInfo