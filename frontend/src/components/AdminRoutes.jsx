import React from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { FaFileAlt } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { IoStatsChart } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";

function AdminRoutes({ children }) {
  const navigate = useNavigate();
  const adminData = localStorage.getItem("admin");

  // Safely parse the admin data
  const admin = adminData ? JSON.parse(adminData) : null;

  if (!admin) {
    toast.error('Access Denied: Admin privileges required');
    return <Navigate to={'/profile'} />;
  }
  const location = useLocation();

  // Helper to define active styles
  const isActive = (path) => location.pathname === path;

  const navItemStyle = (path) => `
    mx-6 mt-2 flex items-center gap-3 px-4 py-3 rounded-md font-bold text-sm transition-all duration-200
    ${isActive(path)
      ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20'
      : 'text-[#94a3b8] hover:bg-slate-800 hover:text-white'}
  `;

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logout Successful');
    navigate('/login');
  };

  // --- Theme Colors ---
  const colors = {
    sidebar: '#1e293b', // Deep Slate
    bg: 'white',      // Soft background
    accent: '#6366f1',  // Indigo
    textLight: '#f1f5f9',
    textMuted: '#94a3b8'
  };

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: colors.bg }}>

      {/* --- Sidebar (The Control Panel) --- */}
      <aside
        className="w-64 flex flex-col fixed h-full shadow-2xl z-20"
        style={{ backgroundColor: 'whitesmoke' }}
      >

        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[50%] overflow-hidden border border-slate-600 bg-slate-700">
            {admin.profile ? (
              <img src={admin.profile} alt="admin" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black font-bold text-xs">
                {admin.name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className='font-semibold text-md font-mono'>{admin.name}</h1>
            <p className='text-sm font-extralight'>{admin.email}</p>
          </div>
        </div>
        <Link to="/admin" className={navItemStyle('/admin')}>
          <span className="tracking-wide uppercase flex justify-center items-center gap-2"><MdSpaceDashboard />Dashboard</span>
        </Link>

        {/* API Logs Link */}
        <Link to="/admin/apilogs" className={navItemStyle('/admin/apilogs')}>
          <span className="tracking-wide uppercase flex gap-2 items-center justify-center"><FaFileAlt /> System Logs</span>
        </Link>

        <Link to="/admin/charts" className={navItemStyle('/admin/charts')}>
          <span className="tracking-wide uppercase flex justify-center items-center gap-2"><IoStatsChart /> Stats</span>
        </Link>

        <Link to="/admin/products" className={navItemStyle('/admin/products')}>
          <span className="tracking-wide uppercase flex justify-center items-center gap-2"><IoStatsChart /> Products</span>
        </Link>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Sidebar Footer / Logout */}
        <div className="p-6 border-t border-slate-800">

          <button
            onClick={handleLogout}
            className="w-full group flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-xs transition-all border bg-[#6366f1] text-black"
          >
            <LuLogOut />
            LOGOUT
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 ml-64 p-8 bg-gray-200">
        <div className="max-w-7xl mx-auto">
          {/* This renders the Admin.jsx content */}
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminRoutes;