import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiFilter, FiPlus, FiX, FiChevronDown } from 'react-icons/fi';
import { LuRotateCcw } from 'react-icons/lu';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';
import api from '../utils/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Default');
  const navigate = useNavigate();

  // Dropdown open states
  const [roleDropOpen, setRoleDropOpen] = useState(false);
  const [sortDropOpen, setSortDropOpen] = useState(false);

  // Add member states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for click-outside
  const roleRef = useRef(null);
  const sortRef = useRef(null);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
  });

  const fetchUsers = async () => {
    try {
      const usersData = await api.get('http://localhost:8000/admin/users')
      console.log(usersData);
      
      const res = await api.get('http://localhost:8000/admin/users', getAuthHeaders());
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters & sort whenever users, roleFilter, or sortOrder changes
  useEffect(() => {
    let result = [...users];

    // Role filter
    if (roleFilter !== 'All') {
      result = result.filter(u => u.role.toLowerCase() === roleFilter.toLowerCase());
    }

    // Sort
    if (sortOrder === 'A-Z') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOrder === 'Z-A') {
      result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (sortOrder === 'Newest') {
      result.sort((a, b) => b.id - a.id);
    } else if (sortOrder === 'Oldest') {
      result.sort((a, b) => a.id - b.id);
    }

    setFilteredUsers(result);
  }, [users, roleFilter, sortOrder]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleDropOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortDropOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const resetFilter = () => {
    setRoleFilter('All');
    setSortOrder('Default');
    setShowAddForm(false);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('http://localhost:8000/admin/member', newMember, getAuthHeaders());
      toast.success("Member added successfully!");
      setNewMember({ name: '', email: '', password: '' });
      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    const base = "px-3 sm:px-4 py-1 sm:py-1.5 rounded-md font-bold text-[10px] sm:text-[11px] uppercase tracking-wide inline-block text-center min-w-[60px] sm:min-w-[80px] ";
    if (role === 'guest') return base + "bg-[#E0F7F4] text-[#00B69B]";
    if (role === 'member') return base + "bg-[#EDE7FB] text-[#6226EF]";
    if (role === 'admin') return base + "bg-[#FFF0E6] text-[#F58A07]";
    return base + "bg-[#F1F4F9] text-[#202224]";
  };

  const handleUserClick = (user) => {
    navigate(`/admin/users/${user.id}`);
  };

  const formatId = (id) => String(id).padStart(5, '0');

  const roleOptions = ['All', 'guest', 'member', 'admin'];
  const sortOptions = ['Default', 'A-Z', 'Z-A', 'Newest', 'Oldest'];

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#202224]">Users List</h1>

        {roleFilter === 'member' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#4379EE] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-[#3768D1] transition-all"
          >
            {showAddForm ? <FiX /> : <FiPlus className='text-white' />} {showAddForm ? "Cancel" : "Add Member"}
          </button>
        )}
      </div>

      {/* Add member form */}
      {showAddForm && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#202224] mb-4">Create New Member</h2>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Full Name</label>
              <input required type="text" placeholder="John Doe"
                className="w-full bg-[#F5F6FA] border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#4379EE]/20"
                value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Email</label>
              <input required type="email" placeholder="member@gmail.com"
                className="w-full bg-[#F5F6FA] border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#4379EE]/20"
                value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Password</label>
              <input required type="password" placeholder="••••••••"
                className="w-full bg-[#F5F6FA] border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#4379EE]/20"
                value={newMember.password} onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} />
            </div>
            <button disabled={isSubmitting}
              className="bg-[#00B69B] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#00947e] transition-all disabled:opacity-50">
              {isSubmitting ? "Creating..." : "Save Member"}
            </button>
          </form>
        </div>
      )}

      {/* ── FILTER BAR ── responsive: stack on mobile, row on desktop */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-wrap items-center">
          {/* Filter icon */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 text-gray-400 border-r border-gray-100">
            <FiFilter size={18} />
          </div>

          {/* Filter By label */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-r border-gray-100">
            <span className="text-sm font-semibold text-gray-500">Filter By</span>
          </div>

          {/* Role Dropdown */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => { setRoleDropOpen(!roleDropOpen); setSortDropOpen(false); }}
              className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 text-sm font-semibold text-[#202224] hover:bg-gray-50 transition-colors border-r border-gray-100"
            >
              <span className="truncate">Role{roleFilter !== 'All' && `: ${roleFilter}`}</span>
              <FiChevronDown className={`text-gray-400 transition-transform flex-shrink-0 ${roleDropOpen ? 'rotate-180' : ''}`} />
            </button>
            {roleDropOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 min-w-[160px] overflow-hidden">
                {roleOptions.map(opt => (
                  <button key={opt}
                    onClick={() => { setRoleFilter(opt); setRoleDropOpen(false); }}
                    className={`block w-full text-left px-5 py-3 text-sm transition-colors ${
                      roleFilter === opt
                        ? 'bg-[#4379EE] text-white font-bold'
                        : 'text-[#202224] hover:bg-gray-50 font-medium'
                    }`}>
                    {opt === 'All' ? 'All Roles' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => { setSortDropOpen(!sortDropOpen); setRoleDropOpen(false); }}
              className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 text-sm font-semibold text-[#202224] hover:bg-gray-50 transition-colors border-r border-gray-100"
            >
              <span className="truncate">Sort{sortOrder !== 'Default' && `: ${sortOrder}`}</span>
              <FiChevronDown className={`text-gray-400 transition-transform flex-shrink-0 ${sortDropOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortDropOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 min-w-[160px] overflow-hidden">
                {sortOptions.map(opt => (
                  <button key={opt}
                    onClick={() => { setSortOrder(opt); setSortDropOpen(false); }}
                    className={`block w-full text-left px-5 py-3 text-sm transition-colors ${
                      sortOrder === opt
                        ? 'bg-[#4379EE] text-white font-bold'
                        : 'text-[#202224] hover:bg-gray-50 font-medium'
                    }`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Filter */}
          <button
            onClick={resetFilter}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 text-sm font-bold text-[#F93C65] transition-colors ml-auto"
          >
            <LuRotateCcw size={14} /> <span className="hidden sm:inline">Reset Filter</span><span className="sm:hidden">Reset</span>
          </button>
        </div>
      </div>

      {/* ── TABLE ── responsive with horizontal scroll */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[12px] sm:text-[13px] font-extrabold text-[#202224] uppercase tracking-wider">ID</th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[12px] sm:text-[13px] font-extrabold text-[#202224] uppercase tracking-wider">Name</th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[12px] sm:text-[13px] font-extrabold text-[#202224] uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[12px] sm:text-[13px] font-extrabold text-[#202224] uppercase tracking-wider text-center">Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-[#F8F9FC] transition-colors cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <td className="px-4 sm:px-6 py-4 sm:py-5 text-sm text-gray-500 font-medium">{formatId(user.id)}</td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F1F4F9] flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                        {user.profile ? (
                          <img src={user.profile} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-[#4379EE]">{user.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-[#202224] block truncate">{user.name}</span>
                        {/* Show email below name on mobile */}
                        <span className="text-xs text-gray-400 sm:hidden block truncate">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 text-sm text-gray-500 hidden sm:table-cell">
                    <span className="truncate block max-w-[200px] lg:max-w-none">{user.email}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                    <span className={getRoleBadge(user.role)}>{user.role}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-gray-400 font-medium">
                    No users found{roleFilter !== 'All' ? ` for role "${roleFilter}"` : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;