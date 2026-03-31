import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus } from 'react-icons/fa';
import api from "../utils/api";
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import ProductEdit from './ProductEdit';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State for Creation
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  // --- API Actions ---

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      // Adjust based on your actual API response structure
      const data = response.data.success ? response.data.data : response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      toast.error("Fields cannot be empty");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    if (selectedFile) data.append('file', selectedFile);

    try {
      const res = await api.post('/admin/products', data);
      const newProduct = res.data.data || res.data;
      setProducts((prev) => [...prev, newProduct]);
      toast.success("Product created!");
      setIsModalOpen(false);
      setFormData({ name: '', price: '', description: '' });
      setSelectedFile(null);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (formDataToSend) => {
    setIsSubmitting(true);
    try {
      const res = await api.patch(`/admin/products/${editingProduct.id}`, formDataToSend);
      const updatedProduct = res.data.data || res.data;
      
      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      toast.success("Product updated successfully!");
      closeEditModal();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter(item => item.id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      toast.error("Could not delete product.");
    }
  };

  // --- Helper Functions ---

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsEditingModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditingModalOpen(false);
    setEditingProduct(null);
  };

  if (loading && products.length === 0) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-[#F5F6FA] min-h-screen font-sans p-4 sm:p-8">
      <div className='flex justify-between items-center mb-8'>
        <h1 className="text-xl sm:text-2xl font-bold text-[#202224]">Products</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#4379EE] hover:bg-[#3662c1] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm"
        >
          <FaPlus size={14} /> Add New Product
        </button>
      </div>

      {/* Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#202224]">Create New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4379EE] outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number" step="0.01" required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4379EE] outline-none"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image</label>
                <label className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-500 text-sm">
                  <span className="truncate">{selectedFile ? selectedFile.name : "Choose File"}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4379EE] outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-[#4379EE] text-white font-bold rounded-lg hover:bg-[#3662c1] disabled:bg-gray-400">
                  {isSubmitting ? "Processing..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditingModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative">
            <ProductEdit
              title="Edit Product"
              initialData={editingProduct}
              onSubmit={handleUpdateSubmit}
              isSubmitting={isSubmitting}
            />
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >✕</button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-white">
            <tr>
              {["SL NO.", "Image", "Product Name", "Description", "Price", "Action"].map(header => (
                <th key={header} className="text-[13px] font-semibold text-gray-500 px-6 py-4">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {products.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="text-[14px] text-gray-700 px-6 py-4 font-medium">{idx+1}</td>
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F6FA] flex items-center justify-center border border-gray-100">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                </td>
                
                <td className="text-[14px] text-gray-700 px-6 py-4 font-medium">{item.name}</td>
                <td className="text-[14px] text-gray-500 px-6 py-4 truncate">{item.description || "No description"}</td>
                <td className="text-[14px] text-gray-700 px-6 py-4 font-medium">${Number(item.price).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <button
                      className="p-2.5 text-gray-400 hover:bg-gray-50 hover:text-[#4379EE] border-r border-gray-200"
                      onClick={() => openEditModal(item)}
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      className="p-2.5 text-red-400 hover:bg-red-50"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;