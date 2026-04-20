import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiCamera, FiX, FiMail, FiEdit2, FiCheck } from "react-icons/fi";

const UserModal = ({
  isOpen,
  onClose,
  name,
  email,
  role,
  id,
  password,
  registartionToken,
  onUpdate,
  profile,
  onUploadSuccess,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", id: "", role: "" });
  const [isSending, setIsSending] = useState(false);

  // Sync internal form data when props change or edit mode opens
  useEffect(() => {
    setFormData({ name: name || "", id: id || "", role: role || "" });
  }, [name, id, isOpen]);

  if (!isOpen) return null;

  // 1. Upload Profile Feature
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("id", id);
    uploadData.append("file", file); // Field name as 'file' per requirements

    setIsUploading(true);
    try {
      const response = await fetch("/admin/uploadProfile", {
        method: "POST",
        body: uploadData,
      });

      if (response.ok) {
        toast.success("Profile photo updated!");
        if (onUploadSuccess) onUploadSuccess();
      } else {
        const data = await response.json();
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Server error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Edit User Feature (Patch Request)
  const handleSave = async () => {
    console.log("called");
    if (!formData.name) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      const response = await fetch("/admin/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id, // Original ID to identify user
          updatedCredentials: {
            name: formData.name,
            role: formData.role, // Updated ID if changed
          },
        }),
      });

      if (response.ok) {
        toast.success("User updated successfully");
        setIsEditMode(false);
        if (onUploadSuccess) onUploadSuccess(); // Refresh parent list
      } else {
        toast.error("Failed to update user");
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  const handleSendMail = async () => {
    setIsSending(true);
    try {
      const response = await fetch("/admin/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, registartionToken }),
      });
      if (response.ok) toast.success("Invite sent!");
      else toast.error("Failed to send mail");
    } catch (err) {
      toast.error("Server error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Soft Blur Backdrop */}
      <div
        className="absolute inset-0 bg-[#202224]/40 backdrop-blur-[2px]"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-white rounded-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#F93C65] transition-colors"
        >
          <FiX size={24} />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-4 border-[#F1F4F9] overflow-hidden bg-[#F5F6FA] flex items-center justify-center shadow-inner">
              {profile ? (
                <img
                  src={profile}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-[#4379EE]">
                  {name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Camera Overlay */}
            <label className="absolute bottom-1 right-1 bg-[#4379EE] text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
              <FiCamera size={16} />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
          {isUploading && (
            <p className="text-[10px] text-[#4379EE] mt-2 font-bold animate-pulse">
              Uploading...
            </p>
          )}
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {isEditMode ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full bg-[#F5F6FA] border border-gray-100 rounded-xl p-3 text-sm font-semibold text-[#202224] focus:ring-2 focus:ring-[#4379EE]/20 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">
                  Role
                </label>
                <select
                  className="w-full bg-[#F5F6FA] border border-gray-100 rounded-xl p-3 text-sm font-semibold text-[#202224] focus:ring-2 focus:ring-[#4379EE]/20 outline-none transition-all appearance-none cursor-pointer"
                  value={formData.role} // Changed to .role to match logic
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="member">Member</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-[#4379EE] text-white font-bold py-3 rounded-md shadow-lg shadow-blue-200 hover:bg-[#3768D1] transition-all flex items-center justify-center gap-2"
                >
                  <FiCheck /> Save Changes
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#202224] mb-1">{name}</h2>
              <p className="text-sm text-gray-400 mb-6 font-medium">{email}</p>
              <p className="text-sm text-gray-400 mb-6 font-medium">
                Role - <span>{role}</span>
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="bg-[#F5F6FA] text-[#202224] font-bold py-3 rounded-sm hover:bg-[#E5E7EB] transition-all flex items-center justify-center gap-2"
                >
                  <FiEdit2 size={16} /> Edit Profile
                </button>

                {!password && (
                  <button
                    onClick={handleSendMail}
                    disabled={isSending}
                    className="bg-[#FFF3D6] text-[#FEC53D] font-bold py-3 rounded-xl hover:bg-[#FFE8B3] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FiMail size={16} /> {isSending ? "Sending..." : "Invite"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal;
