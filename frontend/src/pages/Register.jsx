import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name.trim(), email: formData.email.trim() }),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok && data.success) {
        setStatus({ type: 'success', message: 'Registration link sent! Please check your email.' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Registration failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Connection error. Is the server online?' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #4379EE 0%, #6C9CFF 50%, #4379EE 100%)' }}>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-md p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#202224] mb-2">Create Account</h1>
            <p className="text-gray-400 text-sm">Enter your details to get started</p>
          </div>

          {/* Status */}
          {status.message && (
            <div className={`mb-6 p-3 rounded-xl text-sm font-medium ${
              status.type === 'success'
                ? 'bg-green-50 border border-green-100 text-green-600'
                : 'bg-red-50 border border-red-100 text-red-500'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-semibold text-[#202224] mb-2">Full Name:</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className={`w-full px-4 py-3.5 bg-[#F5F6FA] border rounded-xl text-sm text-[#202224] font-medium outline-none focus:ring-2 focus:ring-[#4379EE]/20 transition-all placeholder-gray-400 ${errors.name ? 'border-red-400' : 'border-gray-100 focus:border-[#4379EE]/30'}`}
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }); }}
              />
              {errors.name && <p className="text-red-500 text-xs font-medium mt-1.5 ml-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#202224] mb-2">Email address:</label>
              <input
                type="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-3.5 bg-[#F5F6FA] border rounded-xl text-sm text-[#202224] font-medium outline-none focus:ring-2 focus:ring-[#4379EE]/20 transition-all placeholder-gray-400 ${errors.email ? 'border-red-400' : 'border-gray-100 focus:border-[#4379EE]/30'}`}
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: '' }); }}
              />
              {errors.email && <p className="text-red-500 text-xs font-medium mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#4379EE] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#3768D1] transition-all disabled:opacity-50 text-sm cursor-pointer"
            >
              {isLoading ? "Processing..." : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')}
              className="text-[#4379EE] font-bold hover:underline cursor-pointer">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;