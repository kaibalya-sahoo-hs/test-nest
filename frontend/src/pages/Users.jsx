import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiFilter, FiPlus, FiX } from 'react-icons/fi';
import { LuRotateCcw } from 'react-icons/lu';
import { toast } from 'react-hot-toast';
import UserModal from '../components/UserModal';
import Filter from '../components/Filter';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // New states for adding a member
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/admin/users');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFilterChange = (role) => {
    setRoleFilter(role);
    setShowAddForm(false); // Close form when switching filters
    if (role === 'All') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(u => u.role.toLowerCase() === role.toLowerCase()));
    }
  };

  const resetFilter = () => {
    setRoleFilter('All');
    setFilteredUsers(users);
    setShowAddForm(false);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:8000/admin/member', newMember);
      toast.success("Member added successfully!");
      setNewMember({ name: '', email: '', password: '' });
      setShowAddForm(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    const base = "px-4 py-1.5 rounded-sm font-bold text-[12px] uppercase w-24 inline-block text-center ";
    if (role === 'guest') return base + "bg-[#95fced] text-[#009c82]";
    if (role === 'member') return base + "bg-[#d9cafa] text-[#6226EF]";
    return base + "bg-[#F1F4F9] text-[#202224]";
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="bg-[#F5F6FA] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#202224]">Users List</h1>

        {/* Conditional "Add Member" Button - Only shows when Member filter is active */}
        {roleFilter === 'member' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#4379EE] text-white px-6 py-3 rounded-md font-bold text-sm flex items-center gap-2 shadow-lg transition-all"
          >
            {showAddForm ? <FiX /> : <FiPlus className='text-white' />} {showAddForm ? "Cancel" : "Add New Member"}
          </button>
        )}
      </div>

      {/* Add Member Form Section */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-[#202224] mb-4">Create New Member</h2>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Full Name</label>
              <input
                required
                type="text"
                placeholder="John Doe"
                className="w-full bg-[#F5F6FA] border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#4379EE]/20"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Email Address</label>
              <input
                required
                type="email"
                placeholder="member@gmail.com"
                className="w-full bg-[#F5F6FA] border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#4379EE]/20"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#F5F6FA] border border-gray-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#4379EE]/20"
                value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
              />
            </div>
            <button
              disabled={isSubmitting}
              className="bg-[#00B69B] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#00947e] transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Save Member"}
            </button>
          </form>
        </div>
      )}

      {/* Filter Header Section */}
      <div className="bg-white border border-gray-100 rounded-lg p-2 flex items-center mb-8 shadow-sm max-w-fit">
        <div className="px-4 border-r border-gray-100 text-gray-400">
          <FiFilter size={20} />
        </div>

        {/* IMPORTANT: Added relative class here */}
        <div className="px-6 flex items-center gap-3 relative">
          <span
            className="text-sm font-semibold text-gray-500 cursor-pointer hover:text-[#4379EE] transition-colors"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            Filter By
          </span>

          {/* Display active filter label for UX */}
          {roleFilter !== 'All' && (
            <span className="text-xs bg-blue-50 text-[#4379EE] px-2 py-1 rounded font-bold uppercase">
              {roleFilter}
            </span>
          )}

          {isFilterOpen && (
            <Filter
              title="Choose Role"
              filterOptions={['member', 'guest']} // Fixed: matched your actual roles
              onClose={() => setIsFilterOpen(false)}
              onChange={handleFilterChange} // Corrected prop name
            />
          )}
        </div>

        <button
          onClick={resetFilter}
          className="flex items-center gap-2 px-6 py-3 font-bold text-sm text-[#F93C65] hover:bg-red-50 transition-colors rounded-r-xl border-l border-gray-100"
        >
          <LuRotateCcw /> Reset Filter
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/30">
              <th className="p-5 text-sm font-extrabold text-[#202224] uppercase tracking-wider">ID</th>
              <th className="p-5 text-sm font-extrabold text-[#202224] uppercase tracking-wider">Name</th>
              <th className="p-5 text-sm font-extrabold text-[#202224] uppercase tracking-wider">Email</th>
              <th className="p-5 text-sm font-extrabold text-[#202224] uppercase tracking-wider text-center">Role Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="p-5 text-sm text-gray-600">0000{user.id}</td>
                <td className="p-5 cursor-pointer" onClick={() => handleUserClick(user)} >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F1F4F9] flex items-center justify-center overflow-hidden border border-gray-100" >
                      {user.profile ? (
                        <img src={user.profile} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[#4379EE]">{user.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-[#202224]">{user.name}</span>
                  </div>
                </td>
                <td className="p-5 text-sm text-gray-600">{user.email}</td>
                <td className="p-5 text-center">
                  <span className={getRoleBadge(user.role)}>{user.role}</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-400 font-medium">No users found for this role.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUploadSuccess={fetchUsers}
          {...selectedUser}
        />
      )}
    </div>
  );
};

export default Users;