import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: ''});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data)
      if (response.ok && data.success) {
        setStatus({ type: 'success', message: 'Please Check your email' });
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-black">
      <div className="max-w-md w-full bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Header */}
        <div className="text-center mb-8 border-b-4 border-black pb-6">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Join Us</h2>
          <p className="font-bold text-gray-600 mt-2 uppercase text-sm">Create your personnel file</p>
        </div>

        {/* Status Alerts */}
        {status.message && (
          <div className={`mb-6 p-4 border-2 border-black font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
            status.type === 'success' 
              ? 'bg-white text-green-600' 
              : 'bg-white text-red-600'
          }`}>
            {status.message.toUpperCase()}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-black uppercase mb-1.5 ml-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-white border-2 border-black font-bold focus:outline-none focus:bg-gray-50 transition-all placeholder-gray-300"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-black uppercase mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-white border-2 border-black font-bold focus:outline-none focus:bg-gray-50 transition-all placeholder-gray-300"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(75,85,99,1)] disabled:opacity-50 mt-4"
          >
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-black flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-gray-500 uppercase">Registered already?</p>
          <button 
            onClick={() => navigate('/login')} 
            className="font-black text-black hover:underline underline-offset-4 uppercase"
          >
            Log in here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;