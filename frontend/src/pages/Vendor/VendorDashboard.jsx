import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FaRupeeSign, FaBox, FaShoppingCart, FaClock, FaTruck, FaCheckCircle, FaPlus, FaArrowRight } from 'react-icons/fa';
import { LuPackage, LuTrendingUp, LuShieldAlert } from 'react-icons/lu';
import { IoMdTrendingUp } from 'react-icons/io';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function VendorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        api.get('/vendor/orders/stats'),
        api.get('/vendor/orders'),
        api.get('/vendor/products'),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data.slice(0, 5)); // Last 5 orders
      if (productsRes.data.success) {
        setProducts(productsRes.data.data.slice(0, 5)); // Last 5 products
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.vendorStatus === 'approved') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-blue-50 text-blue-700';
      case 'processing': return 'bg-indigo-50 text-indigo-700';
      case 'shipped': return 'bg-cyan-50 text-cyan-700';
      case 'delivered': return 'bg-emerald-50 text-emerald-700';
      case 'pending': return 'bg-amber-50 text-amber-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  // Status banner for non-approved vendors
  if (user?.vendorStatus !== 'approved') {
    const statusMessages = {
      'pending': {
        icon: <FaClock className="text-amber-500" size={24} />,
        bg: 'bg-amber-50 border-amber-200',
        title: 'Application Under Review',
        message: 'Your vendor application is being reviewed by our team. You will be notified once approved.',
        color: 'text-amber-700',
      },
      'rejected': {
        icon: <LuShieldAlert className="text-red-500" size={24} />,
        bg: 'bg-red-50 border-red-200',
        title: 'Application Rejected',
        message: 'Your vendor application was rejected. You can re-apply by registering again with updated information.',
        color: 'text-red-700',
      },
      'suspended': {
        icon: <LuShieldAlert className="text-orange-500" size={24} />,
        bg: 'bg-orange-50 border-orange-200',
        title: 'Account Suspended',
        message: 'Your vendor account has been suspended. Please contact support for more information.',
        color: 'text-orange-700',
      },
    };

    const statusInfo = statusMessages[user?.vendorStatus] || statusMessages['pending'];

    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className={`max-w-lg w-full ${statusInfo.bg} border rounded-2xl p-8 text-center`}>
          <div className="flex justify-center mb-4">{statusInfo.icon}</div>
          <h2 className={`text-xl font-black ${statusInfo.color} mb-2`}>{statusInfo.title}</h2>
          <p className={`text-sm ${statusInfo.color} opacity-80`}>{statusInfo.message}</p>
          {user?.vendorStatus === 'rejected' && (
            <button
              onClick={() => { localStorage.clear(); navigate('/vendor/register'); }}
              className="mt-6 px-6 py-3 bg-[#4379EE] text-white font-bold rounded-xl hover:bg-[#3768D1] transition-all"
            >
              Re-Apply
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#4379EE] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400 font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F6FA] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#202224]">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Here's what's happening with your store today</p>
          </div>
          <button
            onClick={() => navigate('/vendor/products')}
            className="flex items-center gap-2 px-5 py-3 bg-[#4379EE] text-white rounded-xl font-bold hover:bg-[#3768D1] transition-all shadow-lg shadow-blue-100"
          >
            <FaPlus size={14} /> Add Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Balance */}
          <div className="rounded-xl p-6 bg-white border border-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">Total Earnings</span>
                <p className="text-2xl font-black text-[#202224] flex items-center mt-1">
                  <FaRupeeSign className="text-lg" />{(user?.balance || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
                <LuTrendingUp size={20} />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="rounded-xl p-6 bg-white border border-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">Total Orders</span>
                <p className="text-2xl font-black text-[#202224] mt-1">{stats.totalOrders || 0}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#FFF3D6] text-[#FEC53D]">
                <FaShoppingCart size={20} />
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="rounded-xl p-6 bg-white border border-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">Products</span>
                <p className="text-2xl font-black text-[#202224] mt-1">{products.length}</p>
              </div>
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-600">
                <LuPackage size={20} />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="rounded-xl p-6 bg-white border border-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">Pending</span>
                <p className="text-2xl font-black text-[#202224] mt-1">{(stats.pendingOrders || 0) + (stats.completedOrders || 0)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#FFDED1] text-[#FF9066]">
                <FaClock size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#202224]">Recent Orders</h2>
              <button
                onClick={() => navigate('/vendor/orders')}
                className="text-sm text-[#4379EE] font-bold hover:underline flex items-center gap-1"
              >
                View All <FaArrowRight size={12} />
              </button>
            </div>
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <FaBox className="mx-auto text-gray-200 mb-3" size={36} />
                <p className="text-gray-400 text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <img key={idx} src={item.product?.image} alt="" className="w-9 h-9 rounded-lg object-cover border-2 border-white bg-gray-100" />
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#202224]">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#202224] flex items-center">
                        <FaRupeeSign className="text-xs" />{Number(order.totalAmount).toLocaleString('en-IN')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#202224]">Your Products</h2>
              <button
                onClick={() => navigate('/vendor/products')}
                className="text-sm text-[#4379EE] font-bold hover:underline flex items-center gap-1"
              >
                Manage <FaArrowRight size={12} />
              </button>
            </div>
            {products.length === 0 ? (
              <div className="p-12 text-center">
                <LuPackage className="mx-auto text-gray-200 mb-3" size={36} />
                <p className="text-gray-400 text-sm mb-3">No products yet</p>
                <button
                  onClick={() => navigate('/vendor/products')}
                  className="px-4 py-2 bg-[#4379EE] text-white rounded-lg text-sm font-bold hover:bg-[#3768D1] transition-all"
                >
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {products.map((product) => (
                  <div key={product.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={product.image || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-100" />
                      <div>
                        <p className="text-sm font-bold text-[#202224] truncate max-w-[180px]">{product.name}</p>
                        <p className="text-xs text-gray-400">Stock: {product.stock || 0}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#202224] flex items-center">
                      <FaRupeeSign className="text-xs" />{Number(product.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button
            onClick={() => navigate('/vendor/products')}
            className="bg-white rounded-2xl p-6 border border-gray-50 hover:border-[#4379EE] hover:shadow-lg hover:shadow-blue-50 transition-all group text-left"
          >
            <div className="p-3 rounded-xl bg-blue-50 text-[#4379EE] w-fit mb-3 group-hover:bg-[#4379EE] group-hover:text-white transition-all">
              <FaPlus size={16} />
            </div>
            <h3 className="font-bold text-[#202224]">Add Product</h3>
            <p className="text-xs text-gray-400 mt-1">List a new product in your store</p>
          </button>
          <button
            onClick={() => navigate('/vendor/orders')}
            className="bg-white rounded-2xl p-6 border border-gray-50 hover:border-[#4379EE] hover:shadow-lg hover:shadow-blue-50 transition-all group text-left"
          >
            <div className="p-3 rounded-xl bg-blue-50 text-[#4379EE] w-fit mb-3 group-hover:bg-[#4379EE] group-hover:text-white transition-all">
              <FaTruck size={16} />
            </div>
            <h3 className="font-bold text-[#202224]">Manage Orders</h3>
            <p className="text-xs text-gray-400 mt-1">Update order statuses and track shipments</p>
          </button>
          <button
            onClick={() => navigate('/vendor/profile')}
            className="bg-white rounded-2xl p-6 border border-gray-50 hover:border-[#4379EE] hover:shadow-lg hover:shadow-blue-50 transition-all group text-left"
          >
            <div className="p-3 rounded-xl bg-blue-50 text-[#4379EE] w-fit mb-3 group-hover:bg-[#4379EE] group-hover:text-white transition-all">
              <FaCheckCircle size={16} />
            </div>
            <h3 className="font-bold text-[#202224]">Store Profile</h3>
            <p className="text-xs text-gray-400 mt-1">Update your store details and branding</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VendorDashboard;