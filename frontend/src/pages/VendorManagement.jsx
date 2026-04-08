import React, { useState, useEffect } from 'react';
import { FiSearch, FiCheck, FiX, FiPause, FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi';
import { LuUsers, LuShieldCheck, LuShieldAlert, LuClock } from 'react-icons/lu';
import { FaStore } from 'react-icons/fa6';
import api from '../utils/api';
import toast from 'react-hot-toast';

function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [editingCommission, setEditingCommission] = useState(null);
  const [commissionInput, setCommissionInput] = useState('');

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const url = filter ? `/admin/vendors?status=${filter}` : '/admin/vendors';
      const { data } = await api.get(url);
      if (data.success) {
        setVendors(data.vendors);
      }
    } catch (err) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/admin/vendors/${id}/status`, { status });
      if (data.success) {
        toast.success(data.message);
        fetchVendors();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const saveCommission = async (id) => {
    const rate = parseFloat(commissionInput) / 100;
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Enter a valid commission percentage (0-100)");
      return;
    }
    try {
      const { data } = await api.patch(`/admin/vendors/${id}/commission`, { rate });
      if (data.success) {
        toast.success(data.message);
        setEditingCommission(null);
        fetchVendors();
      }
    } catch (err) {
      toast.error("Failed to update commission");
    }
  };

  const filteredVendors = vendors.filter(v =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: vendors.length,
    pending: vendors.filter(v => v.vendorStatus === 'pending').length,
    approved: vendors.filter(v => v.vendorStatus === 'approved').length,
    suspended: vendors.filter(v => v.vendorStatus === 'suspended').length,
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      suspended: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return styles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getActionButtons = (vendor) => {
    const { vendorStatus, id } = vendor;
    const buttons = [];

    if (vendorStatus === 'pending') {
      buttons.push(
        <button key="approve" onClick={(e) => { e.stopPropagation(); updateStatus(id, 'approved'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all">
          <FiCheck size={14} /> Approve
        </button>,
        <button key="reject" onClick={(e) => { e.stopPropagation(); updateStatus(id, 'rejected'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all">
          <FiX size={14} /> Reject
        </button>
      );
    } else if (vendorStatus === 'approved') {
      buttons.push(
        <button key="suspend" onClick={(e) => { e.stopPropagation(); updateStatus(id, 'suspended'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-all">
          <FiPause size={14} /> Suspend
        </button>
      );
    } else if (vendorStatus === 'suspended' || vendorStatus === 'rejected') {
      buttons.push(
        <button key="reapprove" onClick={(e) => { e.stopPropagation(); updateStatus(id, 'approved'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all">
          <FiCheck size={14} /> Re-Approve
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="bg-[#F5F6FA] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#202224]">Vendor Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage vendor applications and settings</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">Total Vendors</span>
                <p className="text-2xl font-bold text-[#202224]">{stats.total}</p>
              </div>
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-600">
                <LuUsers size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">Pending</span>
                <p className="text-2xl font-bold text-[#202224]">{stats.pending}</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
                <LuClock size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">Active</span>
                <p className="text-2xl font-bold text-[#202224]">{stats.approved}</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
                <LuShieldCheck size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">Suspended</span>
                <p className="text-2xl font-bold text-[#202224]">{stats.suspended}</p>
              </div>
              <div className="p-3 rounded-2xl bg-orange-100 text-orange-600">
                <LuShieldAlert size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F6FA] border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4379EE]/20"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['', 'pending', 'approved', 'rejected', 'suspended'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    filter === status
                      ? 'bg-[#4379EE] text-white shadow-md'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {status || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FBFF] text-gray-400 uppercase text-[11px] tracking-widest font-bold">
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="7" className="p-20 text-center text-gray-400">Loading vendors...</td></tr>
                ) : filteredVendors.length === 0 ? (
                  <tr><td colSpan="7" className="p-20 text-center text-gray-400">
                    <FaStore className="mx-auto text-gray-200 mb-4" size={48} />
                    <p>No vendors found</p>
                  </td></tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <React.Fragment key={vendor.id}>
                      <tr
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === vendor.id ? null : vendor.id)}
                      >
                        {/* Vendor Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {vendor.profile ? (
                              <img src={vendor.profile} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#4379EE] text-white flex items-center justify-center font-bold text-sm">
                                {vendor.name?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-[#202224] text-sm">{vendor.name}</p>
                              <p className="text-xs text-gray-400">{vendor.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Store Name */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#202224]">{vendor.storeName || '—'}</p>
                        </td>
                        {/* Products */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-[#202224]">{vendor.productCount}</span>
                        </td>
                        {/* Orders */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-[#202224]">{vendor.orderCount}</span>
                        </td>
                        {/* Commission */}
                        <td className="px-6 py-4">
                          {editingCommission === vendor.id ? (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="number"
                                value={commissionInput}
                                onChange={(e) => setCommissionInput(e.target.value)}
                                className="w-16 px-2 py-1 border rounded-lg text-sm text-center"
                                placeholder="%"
                                min="0" max="100"
                              />
                              <button onClick={() => saveCommission(vendor.id)} className="text-emerald-500 hover:text-emerald-700">
                                <FiCheck size={16} />
                              </button>
                              <button onClick={() => setEditingCommission(null)} className="text-red-400 hover:text-red-600">
                                <FiX size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#202224]">
                                {((vendor.commisionRate || 0.10) * 100).toFixed(0)}%
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCommission(vendor.id);
                                  setCommissionInput(((vendor.commisionRate || 0.10) * 100).toFixed(0));
                                }}
                                className="text-gray-300 hover:text-[#4379EE] transition-colors"
                              >
                                <FiEdit2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wide ${getStatusBadge(vendor.vendorStatus)}`}>
                            {vendor.vendorStatus}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {getActionButtons(vendor)}
                            <button className="text-gray-300 hover:text-[#202224] transition-colors ml-2">
                              {expandedId === vendor.id ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded details row */}
                      {expandedId === vendor.id && (
                        <tr>
                          <td colSpan="7" className="bg-[#F9FBFF] px-8 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Store Info</h4>
                                <p className="text-sm text-[#202224] font-medium">{vendor.storeName || 'N/A'}</p>
                                <p className="text-xs text-gray-500 mt-1">{vendor.storeDescription || 'No description provided'}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Performance</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Products Listed</span>
                                    <span className="font-bold text-[#202224]">{vendor.productCount}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Orders</span>
                                    <span className="font-bold text-[#202224]">{vendor.orderCount}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Balance</span>
                                    <span className="font-bold text-emerald-600">₹{(vendor.balance || 0).toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact</h4>
                                <p className="text-sm text-[#202224]">{vendor.email}</p>
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
}

export default VendorManagement;
