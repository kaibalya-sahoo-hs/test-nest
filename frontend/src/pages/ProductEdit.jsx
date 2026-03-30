import React, { useState, useEffect } from 'react';

const ProductEdit = ({ initialData, onSubmit, isSubmitting, title }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Sync state if initialData changes (for Edit mode)
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
    setSelectedFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    if (selectedFile) data.append('file', selectedFile);
    
    onSubmit(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-[#202224]">{title}</h2>
      </div>

      <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
        {/* Preview Area */}
        {preview && (
          <div className="flex justify-center mb-4">
            <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
          <input
            type="text" required
            value={formData.name}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379EE]"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
          <input
            type="number" step="0.01" required
            value={formData.price}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379EE]"
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image</label>
          <label className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 text-sm">
            <span className="truncate">{selectedFile ? selectedFile.name : "Choose File"}</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            rows="3"
            value={formData.description}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379EE]"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-[#4379EE] text-white font-bold rounded-lg hover:bg-[#3662c1] transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? "Processing..." : (initialData ? "Update Product" : "Create Product")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;