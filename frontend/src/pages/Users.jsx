import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Papa from "papaparse";
import { FiFilter, FiPlus, FiX, FiChevronDown, FiUserPlus, FiUser, FiLock, FiShield, FiMail } from "react-icons/fi";
import { LuRotateCcw } from "react-icons/lu";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import api from "../utils/api";
import { FaTrash } from "react-icons/fa6";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Default");
  const navigate = useNavigate();

  // Dropdown open states
  const [roleDropOpen, setRoleDropOpen] = useState(false);
  const [sortDropOpen, setSortDropOpen] = useState(false);

  // Add member states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for click-outside
  const roleRef = useRef(null);
  const sortRef = useRef(null);

  const [isUplaoding, setIsUploading] = useState(false);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });

  const handleImport = async (e) => {
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      console.log(file);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {
          console.log("Sending post request");
          const { data } = await api.post("/admin/users", {
            users: result.data,
          });
          console.log(data);
          if (data.success) {
            toast.success(data.message);
          } else {
            toast.error(data.message);
          }
          setIsUploading(false);
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await api.get("/admin/users");
      console.log(usersData);

      const res = await api.get("/admin/users", getAuthHeaders());
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
    if (roleFilter !== "All") {
      result = result.filter(
        (u) => u.role.toLowerCase() === roleFilter.toLowerCase(),
      );
    }

    // Sort
    if (sortOrder === "A-Z") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortOrder === "Z-A") {
      result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    } else if (sortOrder === "Newest") {
      result.sort((a, b) => b.id - a.id);
    } else if (sortOrder === "Oldest") {
      result.sort((a, b) => a.id - b.id);
    }

    setFilteredUsers(result);
  }, [users, roleFilter, sortOrder]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target))
        setRoleDropOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortDropOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const resetFilter = () => {
    setRoleFilter("All");
    setSortOrder("Default");
    setShowAddForm(false);
  };

  const handleDelete = async (e, userId) => {
    e.stopPropagation();

    try {
      await api.delete(`/users/${userId}`);
      // Update state to remove user from UI
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/admin/member", newMember, getAuthHeaders());
      toast.success("Member added successfully!");
      setNewMember({ name: "", email: "", password: "" });
      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    const base =
      "px-3 sm:px-4 py-1 sm:py-1.5 rounded-md font-bold text-[10px] sm:text-[11px] uppercase tracking-wide inline-block text-center min-w-[60px] sm:min-w-[80px] ";
    if (role === "guest") return base + "bg-[#E0F7F4] text-[#00B69B]";
    if (role === "member") return base + "bg-[#EDE7FB] text-[#6226EF]";
    if (role === "admin") return base + "bg-[#FFF0E6] text-[#F58A07]";
    return base + "bg-[#F1F4F9] text-[#202224]";
  };

  const handleUserClick = (user) => {
    navigate(`/admin/users/${user.id}`);
  };

  const formatId = (id) => String(id).padStart(5, "0");

  const roleOptions = ["All", "guest", "member", "admin"];
  const sortOptions = ["Default", "A-Z", "Z-A", "Newest", "Oldest"];

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#202224]">
          Users List
        </h1>
      </div>

      {/* ── FILTER BAR ── responsive: stack on mobile, row on desktop */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-white w-fit rounded-xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center">
            {/* Filter icon */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 text-gray-400 border-r border-gray-100">
              <FiFilter size={18} />
            </div>

            {/* Filter By label */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-r border-gray-100">
              <span className="text-sm font-semibold text-gray-500">
                Filter By
              </span>
            </div>

            {/* Role Dropdown */}
            <div className="relative" ref={roleRef}>
              <button
                onClick={() => {
                  setRoleDropOpen(!roleDropOpen);
                  setSortDropOpen(false);
                }}
                className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 text-sm font-semibold text-[#202224] hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                <span className="truncate">
                  Role{roleFilter !== "All" && `: ${roleFilter}`}
                </span>
                <FiChevronDown
                  className={`text-gray-400 transition-transform flex-shrink-0 ${roleDropOpen ? "rotate-180" : ""}`}
                />
              </button>
              {roleDropOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 min-w-[160px] overflow-hidden">
                  {roleOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setRoleFilter(opt);
                        setRoleDropOpen(false);
                      }}
                      className={`block w-full text-left px-5 py-3 text-sm transition-colors ${roleFilter === opt
                        ? "bg-[#4379EE] text-white font-bold"
                        : "text-[#202224] hover:bg-gray-50 font-medium"
                        }`}
                    >
                      {opt === "All"
                        ? "All Roles"
                        : opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => {
                  setSortDropOpen(!sortDropOpen);
                  setRoleDropOpen(false);
                }}
                className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 text-sm font-semibold text-[#202224] hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                <span className="truncate">
                  Sort{sortOrder !== "Default" && `: ${sortOrder}`}
                </span>
                <FiChevronDown
                  className={`text-gray-400 transition-transform flex-shrink-0 ${sortDropOpen ? "rotate-180" : ""}`}
                />
              </button>
              {sortDropOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 min-w-[160px] overflow-hidden">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortOrder(opt);
                        setSortDropOpen(false);
                      }}
                      className={`block w-full text-left px-5 py-3 text-sm transition-colors ${sortOrder === opt
                        ? "bg-[#4379EE] text-white font-bold"
                        : "text-[#202224] hover:bg-gray-50 font-medium"
                        }`}
                    >
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
              <LuRotateCcw size={14} />{" "}
              <span className="hidden sm:inline">Reset Filter</span>
              <span className="sm:hidden">Reset</span>
            </button>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div>
            <button className="bg-[#4379EE] text-white px-4 py-4 text-sm font-bold rounded-lg cursor-pointer shadow-lg hover:scale-110 transition-transform mr-4" onClick={() => setShowAddForm(true)}>
              Add user
            </button>
          </div>
          <div>
            <label className="bg-[#4379EE] text-white px-4 py-4 text-sm font-bold rounded-lg cursor-pointer shadow-lg hover:scale-110 transition-transform">
              Import from a CSV
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleImport}
              />
            </label>
          </div>
        </div>
      </div>

      {/* ── TABLE ── responsive with horizontal scroll */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[12px] sm:text-[13px] font-extrabold text-[#202224] uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[12px] sm:text-[13px] font-extrabold text-[#202224] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[12px] sm:text-[13px] font-extrabold text-[#202224] uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[12px] sm:text-[13px] font-extrabold text-[#202224] uppercase tracking-wider text-center">
                  Role
                </th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-[12px] sm:text-[13px] font-extrabold text-[#202224] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-[#F8F9FC] transition-colors cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-sm text-gray-500 font-medium">
                      {formatId(user.id)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F1F4F9] flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                          {user.profile ? (
                            <img
                              src={user.profile}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-[#4379EE]">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-[#202224] block truncate">
                            {user.name}
                          </span>
                          <span className="text-xs text-gray-400 sm:hidden block truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-sm text-gray-500 hidden sm:table-cell">
                      <span className="truncate block max-w-[200px] lg:max-w-none">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                      <span className={getRoleBadge(user.role)}>
                        {user.role}
                      </span>
                    </td>
                    {/* DELETE BUTTON CELL */}
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                      <button
                        onClick={(e) => handleDelete(e, user.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete User"
                        aria-label="Delete User"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-16 text-center text-gray-400 font-medium"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showAddForm && (
        <div>
          <CreateUserForm setShowAddForm={setShowAddForm} setUsers={setUsers} />
        </div>
      )}
    </div>
  );
};

export default Users;



const CreateUserForm = ({ setShowAddForm, setUsers }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'guest'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if(formData.name.trim() === '' || formData.email.trim() === '' || formData.password.trim() === '') {
      toast.error("Fields cannot be empty");
      return;
    }
    const { data } = await api.post('/admin/user', formData);
    if (data.success) {
      toast.success(`User ${formData.name} created as ${formData.role}`);
      setShowAddForm(false);
      setUsers((prevUsers) => [...prevUsers, data.user]);
    } else {
      toast.error(data.message || "Failed to create user");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-20 ">

      <div className="max-w-md bg-white mx-auto rounded-2xl shadow-xl p-8 border border-gray-100 md:mt-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <FiUserPlus size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create New User</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="email"
                required
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Role Selection Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Role</label>
            <div className="relative">
              <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="admin">Admin</option>
                <option value="vendor">Vendor</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full bg-gray-200 hover:bg-gray-300 text-black font-bold py-4 rounded-xl transition-all transform active:scale-[0.98]"
              onClick={() => setShowAddForm(false)}
            >
              Close Form
            </button>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98]"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
