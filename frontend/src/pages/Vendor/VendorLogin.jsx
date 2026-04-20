import React, { useState } from 'react';
import { CiMail } from 'react-icons/ci';
import { FaArrowRight, FaEye, FaEyeSlash, FaKey, FaStore } from 'react-icons/fa6';
import { LuLoader } from 'react-icons/lu';
import { useNavigate } from 'react-router';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function VendorLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hidePass, setHidePass] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return toast.error("Please fill in all fields");
    }
    setLoading(true);
    try {
      const response = await api.post('/vendor/login', formData);
      
      if (response.data.success && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        toast.success("Welcome to your dashboard!");
        navigate('/vendor/dashboard');
      }else{
        toast.error(response.data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-[450px] rounded-[2rem] shadow-sm border border-gray-100 p-10">
        
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4 text-[#4379EE]">
            <FaStore size={32} />
          </div>
          <h1 className="text-3xl font-black text-[#202224] tracking-tight">Vendor Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em] ml-1">
              Store Email
            </label>
            <div className="relative group">
              <CiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4379EE] transition-colors" size={20} />
              <input
                type="email"
                name="email"
                placeholder="name@store.com"
                className="w-full pl-12 pr-4 py-4 bg-[#F1F4F9] border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#4379EE] outline-none transition-all text-[#202224] font-semibold"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em]">
                Password
              </label>
            </div>
            <div className="relative group">
              <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4379EE] transition-colors" size={18} />
              <input
                type={hidePass ? "password" : "text"}
                name="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-[#F1F4F9] border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#4379EE] outline-none transition-all text-[#202224] font-semibold"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setHidePass(!hidePass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#202224] transition-colors"
              >
                {hidePass ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4379EE] hover:bg-[#3768D1] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 disabled:opacity-70 mt-4 active:scale-[0.98]"
            aria-label='vendor-signin'
          >
            {loading ? (
              <LuLoader className="animate-spin" size={24} />
            ) : (
              <>
                Sign In to Dashboard <FaArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-400 font-medium">
            New to the platform?{' '}
            <button 
              onClick={() => navigate('/vendor/register')} 
              className="text-[#4379EE] font-extrabold hover:text-[#3768D1] transition-colors"
            >
              Create a Store
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default VendorLogin;