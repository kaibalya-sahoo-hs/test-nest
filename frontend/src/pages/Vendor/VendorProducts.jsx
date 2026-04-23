import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiUploadCloud, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaAsterisk, FaPlus } from "react-icons/fa6";

function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [vendorStatus, setVendorStatus] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);

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

  const fetchVendorStatus = async () => {
    try {
      const response = await api.get("/vendor/vendorStatus");
      setVendorStatus(response.data.vendorStatus);
    } catch (err) {
      toast.error("Failed to load vendor status");
    }
  };

  useEffect(() => {
    fetchVendorProducts();
    fetchVendorStatus();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
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

  const handleCouponToggle = async (couponId, productId) => {
    try {
      const { data } = await api.patch(`/vendor/coupon/${couponId}/toggle`);
      toast.success(data.message);
      // Update local state
      setProducts(products.map(p => {
        if (p.id === productId && p.coupons) {
          return {
            ...p,
            coupons: p.coupons.map(c => c.id === couponId ? { ...c, isActive: data.isActive } : c)
          };
        }
        return p;
      }));
    } catch (err) {
      toast.error("Toggle failed");
    }
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
        {vendorStatus === "approved" && (
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
                <th className="p-5 text-xs font-bold text-gray-500 uppercase">SL no.</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase">Image</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase">Product Name</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase">Price</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase text-center">Coupons</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center text-gray-400">Loading inventory...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6" className="p-20 text-center text-gray-400">No products found.</td></tr>
              ) : (
                products.map((product, idx) => (
                  <React.Fragment key={product.id}>
                    <tr className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-5 font-bold text-[#202224]">{idx + 1}</td>
                      <td className="p-5">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                          <img src={product.image || "https://via.placeholder.com/150"} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                      </td>
                      <td className="p-5 font-bold text-[#202224]">{product.name}</td>
                      <td className="p-5 font-bold text-[#202224]">₹{Number(product.price).toLocaleString("en-IN")}</td>
                      <td className="p-5 text-center">
                        {product.coupons && product.coupons.length > 0 ? (
                          <button
                            onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4379EE] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all"
                          >
                            {product.coupons.length} coupon{product.coupons.length > 1 ? 's' : ''}
                            {expandedProduct === product.id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => handleEdit(product.id)} className="p-2 text-gray-400 hover:text-[#4379EE] hover:bg-blue-50 rounded-lg transition-all" aria-label="edit product">
                            <FiEdit size={18} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" aria-label="remove product">
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expandable coupon row */}
                    {expandedProduct === product.id && product.coupons && product.coupons.length > 0 && (
                      <tr>
                        <td colSpan="6" className="px-5 py-3 bg-gray-50/50">
                          <div className="space-y-2">
                            {product.coupons.map(coupon => (
                              <div key={coupon.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
                                <div className="flex items-center gap-4">
                                  <span className="font-mono text-xs font-bold bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7] px-2 py-1 rounded-lg uppercase">
                                    {coupon.displayName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {coupon.type === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    Used: {coupon.usageCount}/{coupon.usageLimit || '∞'}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleCouponToggle(coupon.id, product.id)}
                                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
                                  style={{ backgroundColor: coupon.isActive ? '#4379EE' : '#D1D5DB' }}
                                >
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${coupon.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

/* MODAL WITH MULTI-IMAGE UPLOAD */
const ProductModal = ({ onClose, onSave, initialData }) => {
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : initialData?.image ? [initialData.image] : []
  );
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || "",
    category: initialData?.category || "",
    stock: initialData?.stock || 0,
    description: initialData?.description || "",
  });
  const [errors, setErrors] = useState({});

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(
    initialData?.tags && Array.isArray(initialData.tags) && initialData.tags.length > 0
      ? initialData.tags.map(tag => ({ id: tag.id, name: tag.name }))
      : []
  );

  // Generate previews for new files
  const newPreviews = files.map(f => URL.createObjectURL(f));
  const allImages = [...existingImages, ...newPreviews];
  const totalImages = allImages.length;

  const validate = () => {
    let newErrors = {};

    if (totalImages === 0 && !initialData) newErrors.image = "At least one product image is required";

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    else if (formData.name.length < 3) newErrors.name = "Name must be at least 3 characters";

    if (!formData.price || formData.price <= 0) newErrors.price = "Price must be greater than 0";

    if (formData.stock === "" || formData.stock < 0) newErrors.stock = "Stock cannot be negative";

    if (!formData.description.trim()) newErrors.description = "Description is required";
    else if (formData.description.trim().length < 10) newErrors.description = "Description must be at least 10 characters";

    if (tags.length < 5) newErrors.tags = "Minimum 5 tags are required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const remaining = 5 - totalImages;
    if (remaining <= 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    const filesToAdd = selectedFiles.slice(0, remaining);
    setFiles(prev => [...prev, ...filesToAdd]);
    if (errors.image) setErrors({ ...errors, image: null });
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    const trimmedTag = tagInput.trim();
    let tagError = "";

    if (!trimmedTag) tagError = "Tag cannot be empty";
    else if (tags.some(t => t.name.toLowerCase() === trimmedTag.toLowerCase())) tagError = "This tag already exists";
    else if (trimmedTag.length > 15) tagError = "Tag is too long (max 15 chars)";

    if (tagError) {
      setErrors({ ...errors, tags: tagError });
      return;
    }

    setTags([...tags, { name: trimmedTag }]);
    setTagInput("");
    setErrors({ ...errors, tags: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setUploading(true);

    const data = new FormData();

    const formattedtags = tags.map((tag) => tag.name).join(',');
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("description", formData.description);
    data.append("tags", formattedtags);

    // Append new files
    for (const file of files) {
      data.append("files", file);
    }

    // For update: send existing images that were kept
    if (initialData) {
      data.append("existingImages", JSON.stringify(existingImages));
    }

    try {
      if (initialData) {
        await api.patch(`vendor/products/${initialData.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated!");
      } else {
        if (files.length === 0) {
          toast.error("At least one product image is required");
          setUploading(false);
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

  const ErrorMsg = ({ msg }) => msg ? (
    <p className="text-[10px] text-red-500 font-bold ml-1 mt-1">{msg}</p>
  ) : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[95vh]">
        <h2 className="text-2xl font-bold text-[#202224] mb-6">
          {initialData ? "Edit Product" : "Create a new product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Multi-Image Upload Area */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Product Images</label>
              <FaAsterisk size={10} className="text-red-500"/>
              <span className="text-[10px] text-gray-400 ml-2">({totalImages}/5)</span>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-5 gap-3 mb-3">
              {/* Existing images */}
              {existingImages.map((img, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >✕</button>
                  {idx === 0 && <span className="absolute bottom-1 left-1 bg-[#4379EE] text-white text-[8px] px-1.5 py-0.5 rounded-md font-bold">MAIN</span>}
                </div>
              ))}

              {/* New file previews */}
              {newPreviews.map((preview, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-200 group">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewFile(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >✕</button>
                  <span className="absolute bottom-1 left-1 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-md font-bold">NEW</span>
                </div>
              ))}

              {/* Upload button */}
              {totalImages < 5 && (
                <label className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all ${errors.image ? 'border-red-400' : 'border-gray-200'}`}>
                  <FiUploadCloud size={20} className="text-gray-400 mb-1" />
                  <span className="text-[9px] text-gray-400 font-bold">ADD</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                </label>
              )}
            </div>
            <ErrorMsg msg={errors.image} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product name</label>
                <FaAsterisk size={10} className="text-red-500"/>
              </div>
              <input placeholder="title" className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${errors.name ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: null }); }}
              />
              <ErrorMsg msg={errors.name} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Price (₹)</label>
                <FaAsterisk size={10} className="text-red-500"/>
              </div>
              <input placeholder="price" type="number" className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none ${errors.price ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
                value={formData.price}
                onChange={(e) => { setFormData({ ...formData, price: e.target.value }); if (errors.price) setErrors({ ...errors, price: null }); }}
              />
              <ErrorMsg msg={errors.price} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Stock Count</label>
              <input placeholder="stock" type="number" className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none ${errors.stock ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
                value={formData.stock}
                onChange={(e) => { setFormData({ ...formData, stock: e.target.value }); if (errors.stock) setErrors({ ...errors, stock: null }); }}
              />
              <ErrorMsg msg={errors.stock} />
            </div>
            <div className="space-y-2 col-span-2">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Tags</label>
                <FaAsterisk size={10} className="text-red-500"/>
              </div>
              <div className="flex gap-2 relative items-center">
                <input placeholder="Minimum 5 tags are required" value={tagInput}
                  className={`flex-1 p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${errors.tags ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-blue-500'}`}
                  onChange={(e) => { setTagInput(e.target.value); if (errors.tags) setErrors({ ...errors, tags: null }); }}
                  onKeyPress={(e) => e.key === 'Enter' && handleButtonClick(e)}
                />
                <button type="button" onClick={handleButtonClick}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 absolute right-2 text-sm font-bold transition-transform active:scale-90">
                  Add
                </button>
              </div>
              {errors.tags && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.tags}</p>}
              <div className="flex flex-wrap gap-2 mt-2 min-h-[32px]">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold transition-all hover:bg-blue-100">
                    <span>{tag.name}</span>
                    <button type="button" onClick={() => setTags(tags.filter((_, i) => i !== index))} className="hover:text-red-500 transition-colors">✕</button>
                  </div>
                ))}
                {tags.length === 0 && !errors.tags && <p className="text-xs text-gray-400 italic ml-1">No tags added yet</p>}
              </div>
            </div>
            <div className="space-y-1 col-span-2">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Description</label>
                <FaAsterisk size={10} className="text-red-500"/>
              </div>
              <textarea placeholder="Describe your product (min 10 characters)" rows="3"
                className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none resize-none ${errors.description ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
                value={formData.description}
                onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: null }); }}
              />
              <ErrorMsg msg={errors.description}/>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
            <button type="submit" disabled={uploading} className="bg-[#4379EE] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#3768D1] transition-all disabled:opacity-50">
              {uploading ? "Processing..." : initialData ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProducts;
