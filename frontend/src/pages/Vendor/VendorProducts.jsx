import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { CiEdit } from "react-icons/ci";
import { FiEdit, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { FaPlus } from "react-icons/fa6";

// Main Component remains mostly the same, ensuring fetchVendorProducts is passed correctly
function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/vendor/products");
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/vendor/products/${id}`);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (id) => {
    const product = products.find((p) => p.id === id);
    setEditingProduct(product);
    setShowModal(true);
  };

  return (
    <div className="bg-[#F5F6FA] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202224]">
            Products
            <span className="text-blue-700 bg-blue-300 text-sm rounded-2xl py-1 px-2 ms-2">
              {products.length}
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your store inventory and pricing
          </p>
        </div>
        {user?.vendorStatus === "approved" && (
          <button
            aria-label="add product"
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="bg-[#4379EE] hover:bg-[#3768D1] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
          >
            <FaPlus size={20} /> Add New Product
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-xs font-bold text-gray-500 uppercase">
                  SL no.
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase">
                  Image
                </th>

                <th className="p-5 text-xs font-bold text-gray-500 uppercase">
                  Product Name
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase">
                  Price
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-gray-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="p-5 font-bold text-[#202224]">{idx + 1}</td>
                    <td className="p-5">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                        <img
                          src={
                            product.image || "https://via.placeholder.com/150"
                          }
                          alt=""
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                    </td>
                    <td className="p-5 font-bold text-[#202224]">
                      {product.name}
                    </td>
                    <td className="p-5 font-bold text-[#202224]">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleEdit(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          aria-label="remove product"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          aria-label="remove product"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductModal
          onClose={() => setShowModal(false)}
          onSave={fetchVendorProducts}
          initialData={editingProduct}
        />
      )}
    </div>
  );
}

/* MODAL WITH FILE UPLOAD LOGIC */
const ProductModal = ({ onClose, onSave, initialData }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialData?.image || null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || "",
    category: initialData?.category || "",
    stock: initialData?.stock || "",
    description: initialData?.description || "",
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Create a temporary preview URL
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUploading(true);

    const data = new FormData();
    // Append text fields
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("stock", formData.stock);
    data.append("description", formData.description);

    // Append file if selected
    if (file) {
      data.append("file", file);
    }

    try {
      if (initialData) {
        // If editing, you might use PATCH.
        // Note: Multi-part form data usually works better with POST/PUT in some NestJS setups

        await api.patch(`vendor/products/${initialData.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated!");
      } else {
        if (!file) {
          toast.error("product image is required");
          return;
        }

        await api.post("/vendor/product", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product created!");
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[95vh]">
        <h2 className="text-2xl font-bold text-[#202224] mb-6">
          {initialData ? "Edit Product" : "Create a new product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Area */}
          <div className="flex flex-col items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-[#F1F4F9] hover:bg-gray-100 transition-all overflow-hidden relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUploadCloud size={30} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-semibold">
                    Click to upload product image
                  </p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Product Name
              </label>
              <input
                placeholder="title"
                required
                className="w-full p-3 bg-[#F1F4F9] rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Price (₹)
              </label>
              <input
                placeholder="price"
                type="number"
                required
                className="w-full p-3 bg-[#F1F4F9] rounded-xl outline-none"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Stock Count
              </label>
              <input
                placeholder="stock"
                type="number"
                required
                className="w-full p-3 bg-[#F1F4F9] rounded-xl outline-none"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Category
              </label>
              <input
                placeholder="category"
                required
                className="w-full p-3 bg-[#F1F4F9] rounded-xl outline-none"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Description
              </label>
              <textarea
                placeholder="description"
                rows="3"
                className="w-full p-3 bg-[#F1F4F9] rounded-xl outline-none resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="bg-[#4379EE] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#3768D1] transition-all disabled:opacity-50"
            >
              {uploading
                ? "Processing..."
                : initialData
                  ? "Update Product"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProducts;
