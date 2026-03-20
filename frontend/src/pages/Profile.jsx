import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user found, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('admin'); // Clean up everything
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-black">
      <div className="max-w-md w-full border-4 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Header */}
        <div className="border-b-4 border-black pb-4 mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            User Profile
          </h1>
        </div>

        {/* Profile Picture Section */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 border-4 border-black shadow-[6px_6px_0px_0px_black] overflow-hidden bg-gray-100">
            {user.profile ? (
              <img 
                src={user.profile} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-black">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-6 mb-10">
          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">User ID</label>
            <p className="text-xl font-bold border-2 border-black p-2 bg-gray-100">
              #{user.id}
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Full Name</label>
            <p className="text-2xl font-black uppercase">
              {user.name}
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Email Address</label>
            <p className="text-lg font-bold underline decoration-2 underline-offset-4">
              {user.email}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-black text-white font-black py-4 uppercase tracking-widest hover:bg-gray-800 transition-colors active:translate-y-1"
        >
          Logout Session
        </button>

        <p className="mt-6 text-center text-xs font-bold uppercase text-gray-400">
          Secure Session Active
        </p>
      </div>
    </div>
  );
};

export default Profile;