import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiPackage, FiDollarSign, FiFileText, FiUploadCloud, FiCheck } from 'react-icons/fi';

const ProductEdit = ({ initialData, onSubmit, isSubmitting, title }) => {
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price || '',
        description: initialData.description || '',
      });
      setPreview(initialData.image);
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Name is required"); return; }
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    if (selectedFile) data.append('file', selectedFile);
    onSubmit(data);
  };

  return (
    // Max-w-3xl makes it a wider rectangle
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100">
      
      {/* Horizontal Header */}
      <div className="px-8 py-5 border-b border-gray-100 bg-[#F8FAFC] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#4379EE] rounded-lg text-white shadow-md shadow-blue-100">
            <FiPackage size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#202224] leading-none">{title}</h2>
            <p className="text-xs text-gray-400 mt-1">Update your product inventory details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="p-8">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Left Column: Image Upload (Compact) */}
          <div className="w-full md:w-1/3 space-y-4">
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Product Image</label>
             <div className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center transition-all hover:border-[#4379EE]">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FiUploadCloud size={30} className="text-gray-300" />
                )}
             </div>
                <div className="group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <label className="cursor-pointer bg-[#4379EE]  text-white px-4 py-2 rounded-md font-bold text-md shadow-xl">
                      Change Photo
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                   </label>
                </div>
             {selectedFile && (
               <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg text-[11px] font-bold">
                 <FiCheck /> New image ready to upload
               </div>
             )}
          </div>

          {/* Right Column: Information (Clearer spacing) */}
          <div className="flex-1 space-y-5">
             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Name</label>
                  <input
                    type="text" required
                    value={formData.name}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4379EE]/20 focus:border-[#4379EE] outline-none transition-all font-medium text-gray-700"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number" step="0.01" required
                      value={formData.price}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4379EE]/20 focus:border-[#4379EE] outline-none transition-all font-bold text-gray-700"
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Internal Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4379EE]/20 outline-none transition-all text-gray-700 resize-none text-sm"
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
             </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-4 bg-[#4379EE] text-white font-extrabold rounded-lg hover:bg-[#3662c1] shadow-lg shadow-blue-100 disabled:bg-gray-300 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? "Processing..." : "Save Product Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;