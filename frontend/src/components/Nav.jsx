import React from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router';
import { IoMdNotifications } from "react-icons/io";
import { CiSearch, CiCircleChevDown } from "react-icons/ci";
import { LuLogOut } from "react-icons/lu";
import { useEffect } from 'react';

function Nav({ children }) {
  const navigate = useNavigate();
  const adminData = localStorage.getItem("admin");
  const admin = adminData ? JSON.parse(adminData) : null;
  const location = useLocation();

  const user = localStorage.getItem("user")

  const isActive = (path) => location.pathname === path;

  const navItemStyle = (path) => `
  relative mx-6 mt-2 flex items-center gap-3 px-6 py-3 rounded-lg text-sm transition-all
  ${isActive(path)
      ? 'bg-[#4379EE] text-white font-semibold'
      : 'text-[#202224] hover:bg-gray-100 font-light'}
  `;

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logout Successful');
    navigate('/login');
  };


  useEffect(() => {
    if(!admin){
      toast.error('YOu are not the admin')
      navigate('/profile')
    }
  }, [])


  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* --- TOP NAVBAR --- */}
      <nav className="flex items-center justify-between bg-white px-8 py-3 border-b border-gray-100 fixed top-0 right-0 left-0 z-[100]">
        <div className="flex items-center">
          <span className="text-2xl font-bold">
            <span className="text-[#4379EE]">Dash</span>Stack
          </span>
        </div>

        <div className="flex items-center gap-8">
          <div className="relative">
            <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm w-80 focus:outline-none focus:ring-1 focus:ring-[#4379EE]/40 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer p-2 rounded-full hover:bg-gray-50">
              <IoMdNotifications className="w-6 h-6 text-[#4379EE]" />
              <span className="absolute top-1.5 right-1.5 bg-[#F93C65] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                6
              </span>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer">
               {admin?.profile ? (
                <img src={admin.profile} alt={admin.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className='bg-[#4379EE] text-white rounded-full h-10 w-10 flex justify-center items-center font-bold'>
                    {admin?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-sm font-bold text-[#202224] leading-tight">{admin?.name}</p>
                <p className="text-xs font-semibold text-gray-400">Admin</p>
              </div>
              <CiCircleChevDown className="text-gray-400" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* --- SIDEBAR --- */}
        <aside className="w-64 flex flex-col fixed top-16 bottom-0 bg-white border-r border-gray-100 z-20">
          
          {/* Main Navigation (Scrollable if content is long) */}
          <nav className="flex-grow overflow-y-auto pt-4">
            {admin && (
              <>
                <div className="relative">
                  {isActive("/admin/dashboard") && <div className="absolute left-0 w-1.5 h-10 bg-[#4379EE] rounded-r-md" />}
                  <Link to="/admin/dashboard" className={navItemStyle('/admin/dashboard')}>
                    <span>Dashboard</span>
                  </Link>
                </div>
                <div className="relative">
                  {isActive("/admin/products") && <div className="absolute left-0 w-1.5 h-10 bg-[#4379EE] rounded-r-md" />}
                  <Link to="/admin/products" className={navItemStyle('/admin/products')}>
                    <span>Products</span>
                  </Link>
                </div>
                <div className="relative">
                  {isActive("/admin/users") && <div className="absolute left-0 w-1.5 h-10 bg-[#4379EE] rounded-r-md" />}
                  <Link to="/admin/users" className={navItemStyle('/admin/users')}>
                    <span>Users</span>
                  </Link>
                </div>
                <div className="relative">
                  {isActive("/admin/favourites") && <div className="absolute left-0 w-1.5 h-10 bg-[#4379EE] rounded-r-md" />}
                  <Link to="/admin/favourites" className={navItemStyle('/admin/favourites')}>
                    <span>Favourites</span>
                  </Link>
                </div>
              </>
            )}
          </nav>

          {/* --- SIDEBAR FOOTER (Sticks to bottom) --- */}
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

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 ml-64 min-h-[calc(100vh-64px)] p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Nav;