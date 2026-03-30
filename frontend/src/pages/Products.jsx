import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { FaPlus } from 'react-icons/fa';
import api from "../utils/api";
import { FiEdit, FiTrash2 } from 'react-icons/fi'; // Professional thin-stroke icons
import ProductEdit from './ProductEdit';

function Products() {
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    // Note: 'status' should be added to your backend DTO if you want it editable.
    // For now, I will use a placeholder logic like in the image.
  });
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null);


  const handleUpdateSubmit = async (formDataToSend) => {
    setIsSubmitting(true);
    try {
      const res = await api.patch(`http://localhost:8000/admin/products/${editingProduct.id}`, formDataToSend);
      const updatedProduct = res.data.data || res.data;
      
      // Update local state so UI reflects changes
      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      
      toast.success("Product updated successfully!");
      setIsEditingModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      toast.error("Update failed");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (formData.name.trim() == "" || !formData.price) {
      toast.error("Fields Cannot be empty")
      return
    }
    setIsSubmitting(true);


    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('description', formData.description);

    if (selectedFile) {
      formDataToSend.append('file', selectedFile);
    }

    try {
      const res = await api.post('http://localhost:8000/admin/products', formDataToSend);
      const newProduct = res.data.data || res.data;
      setProducts((prev) => [...prev, newProduct]);
      setIsModalOpen(false);
      setFormData({ name: '', price: '', description: '' });
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload failed", err);
      setError("Failed to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (formDataToSend) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await api.patch(`/admin/products/${editingProduct.id}`, formDataToSend);
      } else {
        // API call to POST /admin/products
        await api.post('/admin/products', formDataToSend);
      }
      setIsModalOpen(false);
      // Refresh your product list here
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    // 1. Ask for confirmation (Standard Admin UX)
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`http://localhost:8000/admin/products/${id}`);

      // 2. Update the UI state immediately by filtering out the deleted item
      setProducts(products.filter(item => item.id !== id));
      toast.success("Product deleted successfully")
      // Optional: Add a success toast here
      console.log("Product deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Could not delete product.");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('http://localhost:8000/admin/products');
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading && products.length === 0) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-[#F5F6FA] min-h-screen font-sans p-4 sm:p-8">
      {/* Header (Kept your original UI) */}
      <div className='flex justify-between items-center mb-8'>
        <h1 className="text-xl sm:text-2xl font-bold text-[#202224]">Orders</h1> {/* Changed title to Orders to match context */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#4379EE] hover:bg-[#3662c1] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm"
        >
          <FaPlus size={14} />
          Add New Product
        </button>
      </div>

      {/* Hero Banner Section (Kept your original UI) */}
      {/* <div className="relative w-full h-[200px] bg-[#4379EE] rounded-2xl overflow-hidden mb-10 flex items-center px-10 shadow-lg shadow-blue-100">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 100 Q 250 50 400 200 T 800 150 T 1200 250" stroke="white" fill="transparent" strokeWidth="2" />
              <path d="M0 150 Q 300 100 500 250 T 900 200 T 1300 300" stroke="white" fill="transparent" strokeWidth="2" />
            </svg>
          </div>
          <div className="relative z-10 text-white max-w-lg">
            <p className="text-sm font-medium mb-1 opacity-90">Inventory Dashboard</p>
            <h2 className="text-4xl font-extrabold mb-3 leading-tight">Current Stock Status</h2>
            <p className="text-sm opacity-80 mb-5">Showing all active products. Use the button to add new stock.</p>
          </div>
      </div> */}

      {/* Modal (Kept your original UI) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#202224]">Create New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {isModalOpen && (
              <div className="fixed inset-0 z-300 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#202224]">Create New Product</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>

                  <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                      <input
                        type="text" required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379EE]"
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
                        <input
                          type="number" step="0.01" required
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379EE]"
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image</label>
                      <label className="flex items-center justify-center w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 text-sm">
                        <span className="truncate">{selectedFile ? selectedFile.name : "Choose File"}</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                      <textarea
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379EE]"
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-[#4379EE] text-white font-bold rounded-lg hover:bg-[#3662c1] transition-colors"
                      >
                        {isSubmitting ? "Uploading..." : "Create Product"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="relative">
          <ProductEdit
            title={"Edit Product"}
            initialData={editingProduct}
            onSubmit={handleUpdateSubmit}
            isSubmitting={isSubmitting}
          />
          <button
            onClick={() => setIsEditingModalOpen(false)} // Fix: Use Edit Modal state
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >✕</button>
        </div>
      </div>
      )}

      {/* THE NEW TABLE UI (Matches Uploaded Image) */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-white">
            <tr>
              {["Image", "Product Name", "Category", "Price", "Action"].map(header => (
                <th key={header} className="text-[13px] font-semibold text-gray-500 px-6 py-4">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white">
            {products.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">

                {/* Image - Matches the rounded orange/black background look */}
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F6FA] flex items-center justify-center border border-gray-100">
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>

                {/* Product Name */}
                <td className="text-[14px] text-gray-700 px-6 py-4 font-medium">
                  {item.name}
                </td>

                {/* Category */}
                <td className="text-[14px] text-gray-500 px-6 py-4">
                  Digital Product
                </td>

                {/* Price */}
                <td className="text-[14px] text-gray-700 px-6 py-4 font-medium">
                  ${Number(item.price).toFixed(2)}
                </td>


                {/* --- EXACT ACTION BUTTONS FROM IMAGE --- */}
                <td className="px-6 py-4">
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    {/* Edit Button */}
                    <button
                      className="p-2.5 text-gray-400 hover:bg-gray-50 hover:text-[#4379EE] transition-colors border-r border-gray-200"
                      title="Edit"
                      onClick={() => setIsEditingModalOpen(true)}
                    >
                      <FiEdit size={16} />
                    </button>

                    {/* Delete Button */}
                    <button
                      className="p-2.5 text-red-400 hover:bg-red-50 transition-colors"
                      title="Delete"
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
  )
}

export default Products