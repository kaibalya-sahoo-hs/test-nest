import React from 'react';
import { useNavigate } from 'react-router';

const NotFound = () => {
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const isAdmin = user?.role === 'admin';

  const handleGoBack = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #4379EE 0%, #6C9CFF 50%, #4379EE 100%)' }}>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">

          {/* 404 Browser Illustration */}
          <div className="mx-auto mb-8 w-64">
            <div className="bg-[#4379EE] rounded-xl overflow-hidden shadow-lg">
              {/* Browser bar */}
              <div className="bg-[#E8EDFB] px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F93C65]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FEC53D]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00B69B]"></div>
                </div>
                <div className="flex-1 bg-white rounded-md h-4 ml-2"></div>
              </div>
              {/* 404 content */}
              <div className="py-8 px-6">
                <p className="text-7xl font-black text-[#FEC53D] tracking-wider" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>404</p>
              </div>
              {/* Browser footer */}
              <div className="px-4 pb-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-16 h-2 bg-white/30 rounded-full"></div>
                  <div className="w-10 h-2 bg-white/20 rounded-full"></div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/40"></div>
                  <div className="w-2 h-2 rounded-full bg-white/40"></div>
                  <div className="w-2 h-2 rounded-full bg-white/40"></div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#202224] mb-6">Looks like you've got lost....</h2>

          <button
            onClick={handleGoBack}
            className="w-full max-w-[260px] py-3.5 bg-[#4379EE] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#3768D1] transition-all text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
