import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'react-hot-toast';

function CompleteRegistration() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const token = searchParams.get("token");

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid or missing registration token.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/completeRegistration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Password set successfully!");
        // Redirect to login after success
        navigate('/login');
      } else {
        toast.error(data.message || "Failed to complete registration.");
      }
    } catch (error) {
      console.log("Error while submitting the form", error);
      toast.error("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-black">
      <div className="max-w-md w-full bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Header */}
        <div className="text-center mb-10 border-b-4 border-black pb-6">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Final Step</h2>
          <p className="font-bold text-gray-600 mt-2 uppercase text-xs tracking-widest">Secure your account access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase mb-2 ml-1">Setup New Password</label>
            <input 
              type="password"
              required
              minLength="6"
              className="w-full px-4 py-4 bg-white border-2 border-black font-bold focus:outline-none focus:bg-gray-50 transition-all placeholder-gray-300"
              onChange={(e) => setPassword(e.target.value)} 
              value={password}
            />
            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase px-1">
              Token detected: <span className="text-black">{token ? "VERIFIED" : "MISSING"}</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(75,85,99,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "PROCESSSING..." : "FINALIZE ACCOUNT"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-black text-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-xs font-black uppercase hover:underline underline-offset-4"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompleteRegistration;