import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router";
import { FaRupeeSign, FaCheckCircle, FaClock, FaTruck, FaBox, FaTag, FaSearch, FaChevronRight } from "react-icons/fa";
import { FiPackage, FiFilter } from "react-icons/fi";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/admin/orders");
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders", error);
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
      case 'pending': return <FaClock size={10} />;
      case 'paid': case 'completed': return <FaCheckCircle size={10} />;
      case 'shipped': return <FaTruck size={10} />;
      default: return <FaBox size={10} />;
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some(i => i.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = [...new Set(orders.map(o => o.status))];

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#202224]">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4379EE] shadow-sm"
            />
          </div>
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#4379EE] shadow-sm cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
          <FiPackage className="mx-auto text-gray-200 mb-4" size={56} />
          <h2 className="text-lg font-bold text-gray-700 mb-1">No orders found</h2>
          <p className="text-gray-400 text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Items</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Coupon</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Payment</th>
                    <th className="px-3 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/orders/view/${order.id}`)}>
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono font-bold text-[#4379EE]">#{order.id.slice(0, 8)}</span>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[10px] text-gray-300">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1.5 max-w-[280px]">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center gap-2.5">
                              <img src={item.product?.image} alt="" className="w-9 h-9 rounded-lg border border-gray-100 object-cover flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{item.product?.name}</p>
                                <p className="text-[10px] text-gray-400">Qty: {item.quantity} × ₹{Number(item.product?.price).toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-[10px] text-gray-400 font-bold">+{order.items.length - 2} more items</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-black text-gray-900 flex items-center"><FaRupeeSign className="text-[10px] mr-0.5" />{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                        {Number(order.discount) > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5"><FaTag size={8} /> -₹{Number(order.discount).toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {order.couponCode ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-100">
                            <FaTag size={7} /> {order.couponCode}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-tight ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)} {order.status}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/payments/${order.id}`); }}
                          className="text-[10px] bg-blue-50 text-[#4379EE] px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        >
                          View Logs
                        </button>
                      </td>
                      <td className="px-3 py-4">
                        <FaChevronRight size={10} className="text-gray-300 group-hover:text-[#4379EE] transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet Cards */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} onClick={() => navigate(`/admin/orders/view/${order.id}`)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer active:scale-[0.98] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#4379EE]">#{order.id.slice(0, 8)}</span>
                    <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-1.5">
                    {order.items.slice(0, 3).map((item, i) => (
                      <img key={i} src={item.product?.image} alt="" className="w-9 h-9 rounded-lg border-2 border-white object-cover" />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{order.items[0]?.product?.name}</p>
                    <p className="text-[10px] text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 flex items-center text-sm"><FaRupeeSign className="text-[10px]" />{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                    {order.couponCode && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold border border-emerald-100"><FaTag size={7} /> {order.couponCode}</span>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/payments/${order.id}`); }} className="text-[10px] text-[#4379EE] font-bold">
                    Payment Logs →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminOrdersPage;
