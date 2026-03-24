import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const UserModal = ({ isOpen, onClose, name, email, id, password, registartionToken,onUpdate, profile, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [isSending, setIsSending] = useState(false);
  if (!isOpen) return null;
  console.log(registartionToken)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    const formData = new FormData();
    formData.append('id', id);       // Sending User ID
    formData.append('file', file);   // Sending File

    setIsUploading(true);
    try {
      const response = await fetch('http://localhost:8000/admin/uploadProfile', {
        method: 'POST',
        body: formData, // Do NOT set Content-Type header; browser does it for FormData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Photo uploaded successfully!");
        if (onUploadSuccess) onUploadSuccess(); // Refresh the list
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Server error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name) {
      toast.error("Fields cannot be empty");
      return;
    }

    // Call the update function passed from Admin.jsx
    await onUpdate(id, formData.name, formData.id);
    setIsEditMode(false);
  };

  const handleSendMail = async () => {
    setIsSending(true);
    try {
      const response = await fetch('http://localhost:8000/admin/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          registartionToken
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Registration mail sent!");
      } else {
        toast.error(data.message || "Failed to send mail");
      }
    } catch (err) {
      console.log(err)
      toast.error("Network error. Is the server running on port 8000?");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-sm bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">

        <button onClick={onClose} className="absolute -top-4 -right-4 bg-white border-4 border-black w-10 h-10 font-black hover:bg-black hover:text-white transition-all">✕</button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 border-4 border-black shadow-[4px_4px_0px_0px_black] overflow-hidden bg-gray-100 mb-4">
            {profile ? (
              <img src={profile} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black">{name?.charAt(0)}</div>
            )}
          </div>

          {/* Upload Button */}
          <label className={`cursor-pointer border-2 border-black px-4 py-1 text-xs font-black uppercase hover:bg-black hover:text-white transition-all ${isUploading ? 'opacity-50' : ''}`}>
            {isUploading ? 'Uploading...' : 'Change Photo'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>

        {!isEditMode && !password && (
          <div className="mt-4 pt-4">
            <button
              onClick={() => handleSendMail()}
              disabled={isSending}
              className="w-full bg-yellow-400 text-black border-2 border-black font-black py-2 uppercase text-xs tracking-tighter hover:bg-yellow-300 shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
            >
              {isSending ? "Dispatching..." : "✉️ Send Registration Link"}
            </button>
            <p className="text-[9px] font-bold text-gray-500 uppercase mt-2 text-center">
              User has no password set. Send invite?
            </p>
          </div>
        )}
        <div className="space-y-5 border-t-2 border-black pt-6">
          {isEditMode ? (
            /* --- EDITING VIEW --- */
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase mb-1 block">New Name</label>
                <input
                  type="text"
                  className="w-full border-2 border-black p-2 font-bold focus:bg-gray-50 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-black text-white border-2 border-black font-black py-2 uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-800 active:translate-y-1 active:shadow-none transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-4 border-2 border-black font-black py-2 uppercase hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* --- DISPLAY VIEW --- */
            <div className="text-center">
              <p className="text-3xl font-black uppercase tracking-tighter mb-1">{name}</p>
              <p className="font-bold text-gray-600 uppercase text-sm mb-6">ID: {id}</p>

              <button
                onClick={() => setIsEditMode(true)}
                className="w-full border-2 border-black px-6 py-3 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:shadow-none"
              >
                Edit Details
              </button>
            </div>
          )}
        </div>
        {!isEditMode && (
          <button
            onClick={onClose}
            className="w-full mt-6 text-xs font-black uppercase text-gray-400 hover:text-black transition-colors"
          >
            Close Record
          </button>
        )}
        <button onClick={onClose} className="w-full mt-8 bg-black text-white font-black py-3 uppercase tracking-widest hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(75,85,99,1)]">
          Close Record
        </button>
      </div>
    </div>
  );
};

export default UserModal;