import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const UserModal = ({ isOpen, onClose, name, id, email, profile, onUpdate, onUploadSuccess }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', id: '' });

  // Reset edit data when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      setEditData({ name: name || '', id: id || '' });
      setIsEditMode(false);
    }
  }, [isOpen, name, id]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate(id, editData.name, editData.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-sm bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_black]">
        
        <button onClick={onClose} className="absolute -top-4 -right-4 bg-white border-4 border-black w-10 h-10 font-black hover:bg-black hover:text-white transition-all">✕</button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 border-4 border-black shadow-[4px_4px_0px_0px_black] overflow-hidden bg-gray-100 mb-4">
            {profile ? (
              <img src={profile} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black">{name?.charAt(0)}</div>
            )}
          </div>
        </div>

        <div className="space-y-4 border-t-2 border-black pt-6">
          {isEditMode ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase">Internal ID</label>
                <input 
                  className="w-full border-2 border-black p-2 font-bold focus:bg-gray-50 outline-none"
                  value={editData.id}
                  onChange={(e) => setEditData({...editData, id: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase">Full Name</label>
                <input 
                  className="w-full border-2 border-black p-2 font-bold focus:bg-gray-50 outline-none"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                />
              </div>
              <button 
                onClick={handleSave}
                className="w-full bg-green-500 text-black border-2 border-black font-black py-2 uppercase shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:shadow-none"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase">#{id}</p>
              <p className="text-2xl font-black uppercase tracking-tighter">{name}</p>
              <p className="text-sm font-bold text-gray-600 mb-4">{email}</p>
              
              <button 
                onClick={() => setIsEditMode(true)}
                className="border-2 border-black px-4 py-1 text-xs font-black uppercase hover:bg-black hover:text-white transition-all"
              >
                Edit Details
              </button>
            </div>
          )}
        </div>

        {!isEditMode && (
          <button onClick={onClose} className="w-full mt-8 bg-black text-white font-black py-3 uppercase tracking-widest hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(75,85,99,1)]">
            Close Record
          </button>
        )}
      </div>
    </div>
  );
};

export default UserModal;