import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  FiCamera,
  FiCheck,
  FiEdit2,
  FiMail,
  FiUser,
  FiShield,
} from "react-icons/fi";
import api from "../utils/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  const fetchUser = async () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) {
        toast.error("Please login to view profile");
        navigate("/login");
        return;
      }
      const parsed = JSON.parse(stored);
      const res = await api.get(`/users/profile/${parsed.id}`);
      setUser(res.data);
      setFormData({ name: res.data?.name || "" });
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("id", user.id);
    uploadData.append("file", file);

    setIsUploading(true);
    try {
      const res = await api.post("/users/profile/upload", uploadData);
      console.log(res);
      if (res.data.success) {
        toast.success("Photo updated!");
        fetchUser();
        // Update localStorage so navbar reflects new photo
        const updated = await res.json();
        const stored = JSON.parse(localStorage.getItem("user"));
        stored.profile = updated.url;
        localStorage.setItem("user", JSON.stringify(stored));
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      const res = await api.patch("/users/profile/update", {
        id: user.id,
        updatedCredentials: { name: formData.name },
      });
      if (res.data.success) {
        toast.success("Profile updated!");
        setIsEditing(false);
        fetchUser();
        // Update localStorage
        const stored = JSON.parse(localStorage.getItem("user"));
        stored.name = formData.name;
        localStorage.setItem("user", JSON.stringify(stored));
      } else {
        console.log(data);
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === "admin") return "bg-[#FFF0E6] text-[#F58A07]";
    if (role === "member") return "bg-[#EDE7FB] text-[#6226EF]";
    if (role === "guest") return "bg-[#E0F7F4] text-[#00B69B]";
    return "bg-[#F1F4F9] text-[#202224]";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#4379EE] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="font-sans">
      <h1 className="text-xl sm:text-2xl font-bold text-[#202224] mb-6 sm:mb-8">
        My Profile
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
        {/* Cover + Avatar */}
        <div className="relative h-28 sm:h-40 bg-gradient-to-r from-[#4379EE] to-[#6C9CFF]">
          <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden bg-[#F5F6FA] shadow-lg flex items-center justify-center">
                {user.profile ? (
                  <img
                    src={user.profile}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-4xl font-bold text-[#4379EE]">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 bg-[#4379EE] text-white p-2 sm:p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-110 hover:bg-[#3768D1] transition-all">
                <FiCamera size={14} className="sm:hidden" />
                <FiCamera size={16} className="hidden sm:block" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            {isUploading && (
              <p className="text-xs text-[#4379EE] font-bold mt-2 animate-pulse text-center">
                Uploading...
              </p>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="pt-16 sm:pt-20 px-4 sm:px-8 pb-6 sm:pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#202224]">
                {user.name}
              </h2>
              <p className="text-gray-400 font-medium mt-1 text-sm sm:text-base break-all">
                {user.email}
              </p>
              <span
                className={`inline-block mt-3 px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${getRoleBadge(user.role)}`}
              >
                {user.role}
              </span>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#4379EE] text-white font-bold text-sm rounded-xl hover:bg-[#3768D1] shadow-lg shadow-blue-100 transition-all w-full sm:w-auto justify-center sm:justify-start"
              >
                <FiEdit2 size={14} /> Edit Profile
              </button>
            )}
          </div>

          {/* Edit Form / Info Display */}
          {isEditing ? (
            <div className="bg-[#F8F9FC] rounded-2xl p-8 border border-gray-100">
              <h3 className="text-lg font-bold text-[#202224] mb-6">
                Edit Profile
              </h3>

              {/* Photo upload area */}
              <div className="flex flex-col items-center mb-8">
                <label className="cursor-pointer group">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-[#4379EE] transition-colors">
                    {user.profile ? (
                      <img
                        src={user.profile}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FiCamera
                        className="text-gray-400 group-hover:text-[#4379EE] transition-colors"
                        size={24}
                      />
                    )}
                  </div>
                  <p className="text-sm text-[#4379EE] font-medium mt-2">
                    {isUploading ? "Uploading..." : "Upload Photo"}
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your name"
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm font-medium text-[#202224] outline-none focus:ring-2 focus:ring-[#4379EE]/20 focus:border-[#4379EE]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium text-gray-400 cursor-not-allowed capitalize"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Account ID
                  </label>
                  <input
                    type="text"
                    value={`#${String(user.id).padStart(5, "0")}`}
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-mono font-medium text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 sm:justify-center">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 px-8 sm:px-10 py-3 sm:py-3.5 bg-[#4379EE] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-200 hover:bg-[#3768D1] transition-all disabled:opacity-50"
                >
                  <FiCheck size={16} />{" "}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: user.name });
                  }}
                  className="px-8 sm:px-10 py-3 sm:py-3.5 bg-white border border-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Full Name
                </label>
                <div className="flex items-center gap-3 bg-[#F8F9FC] p-4 rounded-xl">
                  <FiUser className="text-gray-400" />
                  <span className="text-sm font-semibold text-[#202224]">
                    {user.name}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-3 bg-[#F8F9FC] p-4 rounded-xl">
                  <FiMail className="text-gray-400" />
                  <span className="text-sm font-semibold text-[#202224]">
                    {user.email}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Role
                </label>
                <div className="flex items-center gap-3 bg-[#F8F9FC] p-4 rounded-xl">
                  <FiShield className="text-gray-400" />
                  <span className="text-sm font-semibold text-[#202224] capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Account ID
                </label>
                <div className="p-4 rounded-xl border border-dashed border-gray-200 text-gray-500 font-mono font-medium text-sm">
                  #{String(user.id).padStart(5, "0")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
