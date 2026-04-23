import React, { useState } from 'react'
import { CiMail, CiUser } from 'react-icons/ci';
import { FaStore } from 'react-icons/fa';
import { FaArrowRight, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa6';
import { FiFileText } from 'react-icons/fi';
import { LuLoader } from 'react-icons/lu';
import { useNavigate } from 'react-router';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function VendorRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    storeName: '',
    storeDescription: ''
  });
  const [hidePass, setHidePass] = useState(true)
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = "Full name is required";
    else if (formData.fullname.trim().length < 2) newErrors.fullname = "Name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) newErrors.password = "Password must contain letters and numbers";

    if (!formData.storeName.trim()) newErrors.storeName = "Store name is required";
    else if (formData.storeName.trim().length < 3) newErrors.storeName = "Store name must be at least 3 characters";

    if (!formData.storeDescription.trim()) newErrors.storeDescription = "Store description is required";
    else if (formData.storeDescription.trim().length < 20) newErrors.storeDescription = "Description must be at least 20 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post('/vendor/register', formData);
      if (response.data.id) {
        toast.success("Registration Successful! Your store is under review.");
        navigate('/vendor/login')
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Vendor registration error", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">

        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
            <FaStore className="text-[#4379EE]" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#202224]">Become a Vendor</h1>
          <p className="text-gray-500 mt-2 text-sm">Register your store and start selling today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <CiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="fullname"
                placeholder="Enter your name"
                className={`w-full pl-12 pr-4 py-3 bg-[#F1F4F9] border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-[#202224] ${errors.fullname ? 'ring-2 ring-red-400' : ''}`}
                value={formData.fullname}
                onChange={handleChange}
              />
            </div>
            {errors.fullname && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.fullname}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Work Email</label>
            <div className="relative">
              <CiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                placeholder="email@store.com"
                className={`w-full pl-12 pr-4 py-3 bg-[#F1F4F9] border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-[#202224] ${errors.email ? 'ring-2 ring-red-400' : ''}`}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative group">
              {/* Left Icon */}
              <FaKey
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
                size={18}
              />

              <input
                type={hidePass ? "password" : "text"}
                name="password"
                placeholder="••••••••"
                className={`w-full pl-12 pr-12 py-3 bg-[#F1F4F9] border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-[#202224] placeholder:text-gray-300 ${errors.password ? 'ring-2 ring-red-400' : ''}`}
                value={formData.password}
                onChange={handleChange}
              />

              {/* Right Toggle Button */}
              <button
                type="button" // Important: prevents form submission on click
                onClick={() => setHidePass(!hidePass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
              >
                {hidePass ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.password}</p>}
          </div>

          {/* Store Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Store Name</label>
            <div className="relative">
              <FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="storeName"
                placeholder="What is your store called?"
                className={`w-full pl-12 pr-4 py-3 bg-[#F1F4F9] border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-[#202224] ${errors.storeName ? 'ring-2 ring-red-400' : ''}`}
                value={formData.storeName}
                onChange={handleChange}
              />
            </div>
            {errors.storeName && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.storeName}</p>}
          </div>

          {/* Store Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Store Description</label>
            <div className="relative">
              <FiFileText className="absolute left-4 top-4 text-gray-400" size={18} />
              <textarea
                name="storeDescription"
                rows="3"
                placeholder="Briefly describe what you sell (min 20 chars)..."
                className={`w-full pl-12 pr-4 py-3 bg-[#F1F4F9] border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-[#202224] resize-none ${errors.storeDescription ? 'ring-2 ring-red-400' : ''}`}
                value={formData.storeDescription}
                onChange={handleChange}
              />
            </div>
            {errors.storeDescription && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.storeDescription}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4379EE] hover:bg-[#3768D1] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 disabled:opacity-70 mt-4"
          >
            {loading ? (
              <LuLoader className="animate-spin" size={20} />
            ) : (
              <>
                Create Vendor Account <FaArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Already have a store?{' '}
            <button onClick={() => navigate('/vendor/login')} className="text-[#4379EE] font-bold hover:underline">
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VendorRegistration