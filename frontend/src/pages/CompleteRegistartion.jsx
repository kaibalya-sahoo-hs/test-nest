import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

function CompleteRegistration() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const token = searchParams.get("token");

  const validate = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing registration token.");
      return;
    }

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/completeRegistration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Password set successfully!");
        navigate("/login");
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
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #4379EE 0%, #6C9CFF 50%, #4379EE 100%)",
      }}
    >
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#202224] mb-2">
              Complete Registration
            </h1>
            <p className="text-gray-400 text-sm">
              Set your password to finalize your account
            </p>
          </div>

          {/* Token status */}
          <div
            className={`mb-6 p-3 rounded-xl text-sm font-medium text-center ${
              token
                ? "bg-green-50 border border-green-100 text-green-600"
                : "bg-red-50 border border-red-100 text-red-500"
            }`}
          >
            {token
              ? "✓ Registration token verified"
              : "✕ Missing or invalid token"}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-semibold text-[#202224] mb-2">
                New Password:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
              disabled={isLoading || !token}
              className="w-full py-3.5 bg-[#4379EE] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#3768D1] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? "Setting up..." : "Finalize Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompleteRegistration;
