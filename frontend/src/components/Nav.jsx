import React, { useState, useRef, useEffect, use } from "react";
import toast from "react-hot-toast";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router";
import { IoMdNotifications } from "react-icons/io";
import { CiSearch, CiCircleChevDown } from "react-icons/ci";
import { LuLogOut } from "react-icons/lu";
import { FiUser, FiMenu, FiX } from "react-icons/fi";
import { FaRupeeSign, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const { cart, setCart } = useCart();
  const { balance, setBalance, getBalance } = useUser();
  const [user, setUser] = useState(null)

  // Determine role from localStorage

  const cartPath = location.pathname !== "/cart";
  const productPaths = location.pathname.startsWith("/products");
  const otherPaths = location.pathname === "/";
  const checkoutPath = location.pathname === "/checkout";

  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor";

  const roleBadge = isAdmin ? "Admin" : isVendor ? "Vendor" : "User";

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest("[data-hamburger]")
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    setUser(user);
    if(user){
      getBalance();
    }
  }, []);

  useEffect(() => {
    const publicAuthPaths = ["/login", "/register", "/auth/register/complete"];
    if (!user && !publicAuthPaths.includes(location.pathname) && !location.pathname.startsWith("/vendor") && location.pathname.startsWith('/admin')) {
      sessionStorage.setItem("redirectTo", location.pathname);
      console.log("Path saved to session storage", location.pathname);
    }
  }, [location.pathname, user]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logout Successful");
    setUser(null);
    navigate("/products");
    const emptyCart = {
      items: [],
      subTotal: 0,
      discount: 0,
      total: 0,
      appliedCoupon: null,
    };
    setCart(emptyCart);
  };

  const handleLoginPress = () => {
    if (!user) {
      navigate("/login");
    }
  };

  // Define nav links based on role
  const adminLinks = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/users", label: "Users" },
    { path: "/admin/vendors", label: "Vendors" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/profile", label: "Profile" },
  ];

  const publicLinks = [
    { path: "/products", label: "Products" }, // Change icon as needed
  ];
  const userLinks = [
    { path: "/profile", label: "My Profile" },
    { path: "/orders", label: "Orders" },
    { path: "/address", label: "Address" },
  ];

  const vendorLinks = [
    { path: "/vendor/dashboard", label: "Dashboard" },
    { path: "/vendor/products", label: "Products" },
    { path: "/vendor/profile", label: "Profile" },
    { path: "/vendor/orders", label: "Orders" },
  ];

  let navLinks = [];
  if (user) {
    navLinks = isAdmin ? adminLinks : isVendor ? vendorLinks : userLinks;
  }
  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* --- TOP NAVBAR --- */}
      <nav className="flex items-center justify-between bg-white px-4 sm:px-8 py-3 border-b border-gray-100 fixed top-0 right-0 left-0 z-50">
        <div className="flex items-center gap-3">
          {/* Hamburger Button — visible on mobile/tablet only */}
          <button
            data-hamburger
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <FiX className="w-6 h-6 text-[#202224]" />
            ) : (
              <FiMenu className="w-6 h-6 text-[#202224]" />
            )}
          </button>

          <span
            className="text-2xl font-bold tracking-tight cursor-pointer"
            onClick={() => {
              navigate(user?.role === "admin" ? "/admin/dashboard" : "/");
            }}
          >
            <span className="text-[#4379EE]">Dash</span>Stack
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          {/* Search Bar */}
          <div className="relative hidden lg:block">
            <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 bg-[#F5F6FA] border border-gray-100 rounded-full text-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#4379EE]/20 transition-all"
            />
            <span className="relative right-15 text-sm text-slate-300">
              Enter
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Notifications */}
            {user?.role !== "admin" && user?.role !== "vendor" && (
              <div
                className="relative cursor-pointer p-2 rounded-full hover:bg-gray-50"
                aria-label="cart"
                onClick={() => navigate("/cart")}
              >
                <FaShoppingCart className="w-6 h-6 sm:w-6 sm:h-6 text-[#4379EE]" />
                {cart.items && cart.items.length > 0 && (
                  <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 bg-[#F93C65] text-white text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full border-2 border-white">
                    {cart.items.length}
                  </span>
                )}
              </div>
            )}

            {/* Profile Info + Dropdown */}
            {user ? (
              <div className="relative flex items-center gap-2 sm:gap-3 sm:pl-4 sm:border-l border-gray-100">
                {
                  <div
                    className="text-sm flex items-center bg-gray-100 hover:bg-gray-200 rounded-2xl border border-gray-300 px-3 py-1.5 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `${user.role == "vendor" ? "vendor/profile/wallet" : "/profile/wallet"}`,
                      );
                    }}
                  >
                    <FaRupeeSign className="mr-1 text-xs" />
                    <span className="font-bold">
                      {balance?.toLocaleString("en-IN")}
                    </span>
                  </div>
                }

                <div
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="relative">
                    {user?.profile ? (
                      <img
                        src={user.profile}
                        alt={"profile"}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="bg-[#4379EE] text-white rounded-full h-8 w-8 sm:h-10 sm:w-10 flex justify-center items-center font-bold text-sm sm:text-base">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-[#202224] leading-tight">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs font-semibold text-gray-400">
                      {roleBadge}
                    </p>
                  </div>

                  <CiCircleChevDown
                    className={`hidden sm:block text-gray-400 group-hover:text-[#202224] transition-all duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(isVendor ? "/vendor/profile" : "/profile");
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-[#202224] hover:bg-[#F5F6FA] transition-colors"
                    >
                      <FiUser className="text-[#4379EE]" size={18} />
                      <span>Profile</span>
                    </button>
                    <div className="mx-4 border-t border-gray-100"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-[#F93C65] hover:bg-red-50 transition-colors"
                    >
                      <LuLogOut size={18} />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoginPress()}
                  className="bg-[#4379EE] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#3662c1] transition-all"
                  aria-label="login btn"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/vendor/login")}
                  className="bg-white text-[#4379EE] border border-[#4379EE] px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all"
                >
                  Seller Login
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* --- MOBILE OVERLAY --- */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* --- SIDEBAR --- */}
        {user && !productPaths && cartPath && !otherPaths && !checkoutPath && (
          <aside
            ref={sidebarRef}
            className={`
            w-64 flex flex-col fixed top-16 bottom-0 bg-white border-r border-gray-100 z-40
            transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:z-20
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
            {/* Mobile Search — inside sidebar for smaller screens */}
            <div className="lg:hidden px-4 pt-4 pb-2">
              <div className="relative">
                <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5F6FA] border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4379EE]/20 transition-all"
                />
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-grow overflow-y-auto pt-4">
              {navLinks.map((link) => (
                <div key={link.path} className="relative flex items-center">
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `relative mx-6 mt-2 flex items-center gap-3 px-6 py-3 rounded-lg text-sm transition-all w-full ${
                        isActive
                          ? "bg-[#4379EE] text-white font-semibold shadow-md shadow-blue-100"
                          : "text-[#202224] hover:bg-gray-100 font-light"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-[-24px] w-1.5 h-10 bg-[#4379EE] rounded-r-md z-30" />
                        )}
                        {link.icon && link.icon}
                        <span>{link.label}</span>
                      </>
                    )}
                  </NavLink>
                </div>
              ))}
            </nav>

            {/* --- SIDEBAR FOOTER --- */}
            {user && (
              <div className="mt-auto pb-6 border-t border-gray-50 pt-4 px-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-6 py-3 text-[#202224] hover:bg-red-50 hover:text-[#F93C65] transition-all rounded-lg group font-medium"
                >
                  <LuLogOut className="text-lg group-hover:text-[#F93C65]" />
                  <span className="text-[14px]">Logout</span>
                </button>
              </div>
            )}
          </aside>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <main
          className={`flex-1 ${user && !productPaths && cartPath && !otherPaths && !checkoutPath && "lg:ml-64"} min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 transition-all duration-300`}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Nav;
