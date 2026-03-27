import React from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useLocation } from 'react-router';
import { CiSearch, CiCircleChevDown } from "react-icons/ci";
import { IoMdNotifications } from "react-icons/io";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi"; // Added for better visual consistency
import { LuLogOut } from 'react-icons/lu';
import { useEffect } from 'react';

function UserNav({ children, userData }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse user data safely
  const user = userData ? JSON.parse(userData) : null;


  const isActive = (path) => location.pathname === path;

  // Exact DashStack nav item style
  const navItemStyle = (path) => `
    relative mx-6 mt-2 flex items-center gap-3 px-6 py-3 rounded-lg text-sm transition-all
    ${isActive(path)
      ? 'bg-[#4379EE] text-white font-bold shadow-md shadow-blue-100'
      : 'text-[#202224] font-medium hover:bg-gray-100'}
  `;


  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logout Successful');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* --- TOP NAVBAR --- */}
      <nav className="flex items-center justify-between bg-white px-8 py-3 border-b border-gray-100 fixed top-0 right-0 left-0 z-[100]">
        <div className="flex items-center">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-[#4379EE]">Dash</span>Stack
          </span>
        </div>

        <div className="flex items-center gap-8">
          {/* Search Bar */}
          <div className="relative hidden lg:block">
            <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 bg-[#F5F6FA] border border-gray-100 rounded-full text-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#4379EE]/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            {/* Notifications */}
            <div className="relative cursor-pointer p-2 rounded-full hover:bg-gray-50">
              <IoMdNotifications className="w-6 h-6 text-[#4379EE]" />
              <span className="absolute top-1.5 right-1.5 bg-[#F93C65] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                3
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer group">
              {user?.profile ? (
                <img src={user.profile} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
              ) : (
                <div className='bg-[#4379EE] text-white rounded-full h-10 w-10 flex justify-center items-center font-bold'>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-sm font-bold text-[#202224] leading-tight">{user?.name || "User"}</p>
                <p className="text-xs font-semibold text-gray-400">Member</p>
              </div>
              <CiCircleChevDown className="text-gray-400 group-hover:text-[#202224] transition-colors" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* --- SIDEBAR --- */}
        <aside className="w-64 flex flex-col fixed h-[calc(100vh-64px)] bg-white border-r border-gray-100 z-20">
          <nav className="flex-grow pt-6">
            
            {/* PROFILE NAV ITEM */}
            <div className="relative flex items-center">
              {isActive("/profile") && (
                <div className="absolute left-0 w-1.5 h-10 bg-[#4379EE] rounded-r-md z-30" />
              )}
              <Link to="/profile" className={navItemStyle('/profile') + " w-full"}>
                <FiUser className="text-lg" />
                <span>My Profile</span>
              </Link>
            </div>

          </nav>

          {/* SIDEBAR FOOTER */}
          <div className="mt-auto pb-6 border-t border-gray-50 pt-4 px-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-3 text-[#202224] hover:bg-red-50 hover:text-[#F93C65] transition-all rounded-lg group font-medium"
            >
              <LuLogOut className="text-lg group-hover:text-[#F93C65]" />
              <span className="text-[14px]">Logout</span>
            </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 ml-64 min-h-screen bg-[#F5F6FA] p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserNav;