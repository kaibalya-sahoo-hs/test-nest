import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import api from "../utils/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { syncCartWithServer, fetchCart } = useCart();

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const { data } = await api.post("/login", {
        email: email.trim(),
        password,
      });

      if (data.success) {
        if (!data.success) {
          toast.error(
            data.message || "Invalid password, or user does not exist",
          );
          return;
        }

        toast.success(data.message || "Login successful");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log(data);
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (data.user.role === "vendor") {
          navigate("/vendor/dashboard");
        } else {
          const redirectPath = sessionStorage.getItem("redirectTo");
          sessionStorage.removeItem("redirectTo");
          navigate(redirectPath || "/profile");
          syncCartWithServer();
          fetchCart();
        }
      } else {
        toast.error(
          data.message || "Login failed. Please check your credentials.",
        );
      }
    } catch (err) {
      toast.error("Server connection failed. Is your backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #4379EE 0%, #6C9CFF 50%, #4379EE 100%)",
      }}
    >
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-md p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#202224] mb-2">
              Login to Account
            </h1>
            <p className="text-gray-400 text-sm">
              Please enter your email and password to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-semibold text-[#202224] mb-2">
                Email address:
              </label>
              <input
                type="email"
                placeholder="esteban_schiller@gmail.com"
                className={`w-full px-4 py-3.5 bg-[#F5F6FA] border rounded-xl text-sm text-[#202224] font-medium outline-none focus:ring-2 focus:ring-[#4379EE]/20 transition-all placeholder-gray-400 ${errors.email ? "border-red-400" : "border-gray-100 focus:border-[#4379EE]/30"}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-medium mt-1.5 ml-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-[#202224]">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  className={`w-full px-4 py-3.5 pr-12 bg-[#F5F6FA] border rounded-xl text-sm text-[#202224] font-medium outline-none focus:ring-2 focus:ring-[#4379EE]/20 transition-all placeholder-gray-400 ${errors.password ? "border-red-400" : "border-gray-100 focus:border-[#4379EE]/30"}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#202224] transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs font-medium mt-1.5 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#4379EE] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#3768D1] transition-all disabled:opacity-50 text-sm cursor-pointer  "
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-[#4379EE] font-bold hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
