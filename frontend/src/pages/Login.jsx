import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { toast } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const admin = localStorage.getItem('admin')
  const token = localStorage.getItem('token')

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Logged in user: ", data);

      if (response.ok) {
        if (!data.success) {
          toast.error("Invalid password, or user does not exist");
          return;
        }

        if (data.admin) {
          toast.success(data.message);
          localStorage.setItem("admin", JSON.stringify(data.admin));
          navigate("/admin/dashboard");
        } else {
          toast.success(data.mesage || "Login successful");
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/profile');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Server connection failed. Is your backend running?');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    localStorage.clear()
  }, [])
  


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-black">
      <div className="max-w-md w-full bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Header */}
        <div className="text-center mb-10 border-b-4 border-black pb-6">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Welcome Back</h2>
          <p className="font-bold text-gray-600 mt-2 uppercase text-sm">Access your secure terminal</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-white border-2 border-black font-bold text-red-600 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase mb-1 ml-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-white border-2 border-black font-bold focus:outline-none focus:bg-gray-50 transition-all placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-xs font-black uppercase ml-1">Password</label>
            </div>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-white border-2 border-black font-bold focus:outline-none focus:bg-gray-50 transition-all placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-5 py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(75,85,99,1)] disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-black flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-gray-500 uppercase">New Personnel?</p>
          <button 
            onClick={() => navigate('/register')} 
            className="font-black text-black hover:underline underline-offset-4 uppercase"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;