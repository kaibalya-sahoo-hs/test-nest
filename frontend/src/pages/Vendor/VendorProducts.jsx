import React, { useEffect, useState, useRef, useCallback } from "react";
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

  // Poll upload status for products that are still processing
  const pollingRef = useRef(null);

  useEffect(() => {
    const processingProducts = products.filter(p => p.imageUploadStatus === 'processing');

    if (processingProducts.length > 0) {
      pollingRef.current = setInterval(async () => {
        let anyUpdated = false;

        for (const p of processingProducts) {
          try {
            const { data } = await api.get(`/upload/status/${p.id}`);
            if (data.success && data.status !== 'processing') {
              anyUpdated = true;
              if (data.status === 'completed') {
                toast.success(`Images uploaded for "${p.name}"`);
              } else if (data.status === 'failed') {
                toast.error(`Image upload failed for "${p.name}"`);
              }
            }
          } catch (e) {
            // ignore polling errors
          }
        }

        if (anyUpdated) {
          fetchVendorProducts();
        }
      }, 3000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [products]);

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

  const getProductPriceRange = (product) => {
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map(v => Number(v.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return `₹${minPrice.toLocaleString("en-IN")}`;
      }
      return `₹${minPrice.toLocaleString("en-IN")} - ₹${maxPrice.toLocaleString("en-IN")}`;
    }
    return `₹${Number(product.price).toLocaleString("en-IN")}`;
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
                <th className="p-5 text-xs font-bold text-gray-500 uppercase text-center">Variants</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase text-center">Coupons</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="7" className="p-20 text-center text-gray-400">Loading inventory...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="7" className="p-20 text-center text-gray-400">No products found.</td></tr>
              ) : (
                products.map((product, idx) => (
                  <React.Fragment key={product.id}>
                    <tr className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-5 font-bold text-[#202224]">{idx + 1}</td>
                      <td className="p-5">
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                          {product.imageUploadStatus === 'processing' ? (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50">
                              <div className="w-5 h-5 border-2 border-[#4379EE] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : product.imageUploadStatus === 'failed' ? (
                            <div className="w-full h-full flex items-center justify-center bg-red-50">
                              <span className="text-red-500 text-lg font-bold">✕</span>
                            </div>
                          ) : (
                            <img src={product.variants[0]?.image || "https://via.placeholder.com/150"} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                          )}
                          {product.imageUploadStatus === 'processing' && (
                            <div className="absolute -bottom-0.5 left-0 right-0 h-1 bg-blue-100">
                              <div className="h-full bg-[#4379EE] rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-5 font-bold text-[#202224]">
                        <div className="flex items-center gap-2">
                          {product.name}
                          {product.imageUploadStatus === 'processing' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                              Uploading images
                            </span>
                          )}
                          {product.imageUploadStatus === 'failed' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                              Upload failed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-5 font-bold text-[#202224]">₹{Number(product.variants[0]?.price).toLocaleString("en-IN")}</td>
                      <td className="p-5 text-center">
                        {product.variants && product.variants.length > 0 ? (
                          <button
                            onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4379EE] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all"
                          >
                            {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                            {expandedProduct === product.id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                      <td className="p-5 text-center">
                        {product.coupons && product.coupons.length > 0 ? (
                          <button
                            onClick={() => setExpandedProduct(expandedProduct === `coupon-${product.id}` ? null : `coupon-${product.id}`)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4379EE] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all"
                          >
                            {product.coupons.length} coupon{product.coupons.length > 1 ? 's' : ''}
                            {expandedProduct === `coupon-${product.id}` ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
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
                    {/* Expandable variants row */}
                    {expandedProduct === product.id && product.variants && product.variants.length > 0 && (
                      <tr>
                        <td colSpan="7" className="px-5 py-4 bg-blue-50/30">
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-[#202224] mb-3">Available Variants</h4>
                            {product.variants.map(variant => (
                              <div key={variant.id} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between hover:border-blue-300 transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                  {variant.image && (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                                      <img src={variant.image} alt={`${variant.color}-${variant.size}`} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-mono text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        {variant.color}
                                      </span>
                                      <span className="font-mono text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                                        {variant.size}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-xs">
                                      {variant.price && (
                                        <div>
                                          <p className="text-gray-500">Price</p>
                                          <p className="font-bold">₹{Number(variant.price).toLocaleString("en-IN")}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-gray-500">Stock</p>
                                        <p className={`font-bold ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {variant.stock} units
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Status</p>
                                        {variant.imageUploadStatus === 'processing' && (
                                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                            Processing
                                          </span>
                                        )}
                                        {variant.imageUploadStatus === 'completed' && (
                                          <span className="text-xs font-bold text-green-600">✓ Ready</span>
                                        )}
                                        {variant.imageUploadStatus === 'failed' && (
                                          <span className="text-xs font-bold text-red-600">✕ Failed</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Expandable coupon row */}
                    {expandedProduct === `coupon-${product.id}` && product.coupons && product.coupons.length > 0 && (
                      <tr>
                        <td colSpan="7" className="px-5 py-3 bg-gray-50/50">
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
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [featureInput, setfeatureInput] = useState('')
  const [variantFormOpen, setVariantFromOpen] = useState(false)
  const [deletingVariantId, setDeletingVariantId] = useState(null);

  const [tags, setTags] = useState(
    initialData?.tags && Array.isArray(initialData.tags) && initialData.tags.length > 0
      ? initialData.tags.map(tag => ({ id: tag.id, name: tag.name }))
      : []
  );
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
    color: initialData?.color || "",
    size: initialData?.size || "",
    features: initialData?.features && Array.isArray(initialData.features)
      ? initialData.features.map(f => (typeof f === 'string' ? f : f.name || String(f)))
      : []
  });

  // Generate previews for new files
  const newPreviews = files.map(f => URL.createObjectURL(f));
  const allImages = [...existingImages, ...newPreviews];
  const totalImages = allImages.length;

  const validate = () => {
    let newErrors = {};

    if (totalImages === 0 && !initialData) newErrors.image = "At least one product image is required";

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    else if (formData.name.length < 3) newErrors.name = "Name must be at least 3 characters";

    if (!formData.description.trim()) newErrors.description = "Description is required";
    else if (formData.description.trim().length < 10) newErrors.description = "Description must be at least 10 characters";

    if (tags.length < 5) newErrors.tags = "Minimum 5 tags are required";

    if (formData.features.length < 3) newErrors.features = "Minimum 3 features are required"

    // Price and stock validation only for new products
    if (!initialData) {
      if (!formData.price || formData.price <= 0) newErrors.price = "Price must be greater than 0";
      if (formData.stock === "" || formData.stock < 0) newErrors.stock = "Stock cannot be negative";
    }

    // Validate variants for both create and update
    if (initialData && (!initialData.variants || initialData.variants.length === 0)) {
      newErrors.variants = "At least one variant is required";
    }

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

  const handleVariantDelete = async (variantId) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) return;

    setDeletingVariantId(variantId);
    try {
      await api.delete(`/vendor/products/${initialData.id}/variants/${variantId}`);
      toast.success("Variant deleted successfully");
      // Update the initialData variants list
      initialData.variants = initialData.variants.filter(v => v.id !== variantId);
      setDeletingVariantId(null);
      onSave();
    } catch (err) {
      setDeletingVariantId(null);
      toast.error(err.response?.data?.message || "Failed to delete variant");
    }
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


  const handleAddFeature = (e) => {
    e.preventDefault();
    let featureError = "";
    const trimmed = featureInput.trim();

    if (!trimmed) featureError = "Feature cannot be empty";
    else if (trimmed.length < 5) featureError = "A feature should be at least 5 characters long";
    else if (formData.features.some(f => f === trimmed)) featureError = "This feature already exist"

    if (featureError) {
      setErrors({ ...errors, features: featureError });
      return;
    }

    setFormData((prev) => ({ ...prev, features: [...prev.features, trimmed] }));
    setfeatureInput("");
    setErrors({ ...errors, features: null });
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
    data.append("color", formData.color);
    data.append("size", formData.size);
    data.append("features", formData.features);

    console.log(data);
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#202224]">Product Variants</h3>
                {errors.variants && (
                  <p className="text-[10px] text-red-500 font-bold mt-1">{errors.variants}</p>
                )}
              </div>
              {initialData && <button
                type="button"
                onClick={() => setVariantFromOpen({ mode: 'create' })}
                className="flex items-center gap-2 bg-blue-50 text-[#4379EE] px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all text-xs font-bold"
              >
                <FaPlus size={12} /> Add Variant
              </button>}

            </div>
            {initialData && initialData.variants ?
              <div>
                {initialData.variants.length > 0 ? (
                  <div className="space-y-2">
                    {initialData.variants.map((variant) => (
                      <div key={variant.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {variant.color}
                              </span>
                              <span className="font-mono text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                                {variant.size}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{variant.name}</p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              {variant.price && (
                                <div>
                                  <p className="text-gray-500 text-xs">Price</p>
                                  <p className="font-bold text-[#202224]">₹{Number(variant.price).toLocaleString("en-IN")}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-gray-500 text-xs">Stock</p>
                                <p className={`font-bold ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {variant.stock} units
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Status</p>
                                <div className="flex items-center gap-1">
                                  {variant.imageUploadStatus === 'processing' && (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                      Processing
                                    </span>
                                  )}
                                  {variant.imageUploadStatus === 'completed' && (
                                    <span className="text-xs font-bold text-green-600">✓ Ready</span>
                                  )}
                                  {variant.imageUploadStatus === 'failed' && (
                                    <span className="text-xs font-bold text-red-600">✕ Failed</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          {variant.image && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                              <img src={variant.image} alt={`${variant.color}-${variant.size}`} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setVariantFromOpen({ mode: 'edit', variant })}
                              className="p-2 text-gray-400 hover:text-[#4379EE] hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit variant"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVariantDelete(variant.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete variant"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm mb-3">No variants added yet</p>
                    {initialData && <button
                      type="button"
                      onClick={() => setVariantFromOpen({ mode: 'create' })}
                      className="inline-flex items-center gap-2 bg-[#4379EE] text-white px-4 py-2 rounded-lg hover:bg-[#3768D1] transition-all text-sm font-bold"
                    >
                      <FaPlus size={14} /> {initialData ? "Create First Variant" : "Add Variant"}
                    </button>}
                  </div>
                )}
              </div> :
              <div className="space-y-3">
                <label className="block text-sm font-bold">Product Images (Max 5)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50/50"
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <FiUploadCloud size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB (Max 5 images)</p>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {files.length > 0 && <p className="mt-2 text-xs text-green-600">Files selected: {files.length}</p>}
                {/* Image Previews */}
                {files.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {newPreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeNewFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            }

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product name</label>
                <FaAsterisk size={10} className="text-red-500" />
              </div>
              <input placeholder="title" className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${errors.name ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: null }); }}
              />
              <ErrorMsg msg={errors.name} />
            </div>

            {!initialData && (
              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Tags</label>
                  <FaAsterisk size={10} className="text-red-500" />
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
                <div className="flex flex-wrap gap-2 mt-2 min-h-8">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold transition-all hover:bg-blue-100">
                      <span>{tag.name}</span>
                      <button type="button" onClick={() => setTags(tags.filter((_, i) => i !== index))} className="hover:text-red-500 transition-colors">✕</button>
                    </div>
                  ))}
                  {tags.length === 0 && !errors.tags && <p className="text-xs text-gray-400 italic ml-1">No tags added yet</p>}
                </div>
              </div>
            )}

            {!initialData && (
              <>
                <div className="space-y-1 col-span-2">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Price</label>
                  </div>
                  <input placeholder="price" className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${errors.price ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
                    value={formData.price}
                    type="number"
                    onChange={(e) => { setFormData({ ...formData, price: e.target.value }); if (errors.price) setErrors({ ...errors, price: null }); }}
                  />
                  <ErrorMsg msg={errors.price} />
                </div>
                <div className="space-y-1 col-span-2">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Stock</label>
                  </div>
                  <input placeholder="stock" className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${errors.stock ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
                    value={formData.stock}
                    type="number"
                    onChange={(e) => { setFormData({ ...formData, stock: e.target.value }); if (errors.stock) setErrors({ ...errors, stock: null }); }}
                  />
                  <ErrorMsg msg={errors.stock} />
                </div>
                <div className="space-y-1 col-span-2">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Color (Optional)</label>
                  </div>
                  <input placeholder="Color" className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${errors.color ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
                    value={formData.color}
                    type="text"
                    onChange={(e) => { setFormData({ ...formData, color: e.target.value }); if (errors.color) setErrors({ ...errors, color: null }); }}
                  />
                  <ErrorMsg msg={errors.color} />
                </div>
                <div className="space-y-1 col-span-2">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Size (Optional)</label>
                  </div>
                  <input placeholder="Size" className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${errors.size ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
                    value={formData.size}
                    type="text"
                    onChange={(e) => { setFormData({ ...formData, size: e.target.value }); if (errors.size) setErrors({ ...errors, size: null }); }}
                  />
                  <ErrorMsg msg={errors.size} />
                </div>
                <div className="space-y-1 col-span-2">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Description</label>
                    <FaAsterisk size={10} className="text-red-500" />
                  </div>
                  <textarea placeholder="Describe your product (min 10 characters)" rows="3"
                    className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none resize-none ${errors.description ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
                    value={formData.description}
                    onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: null }); }}
                  />
                  <ErrorMsg msg={errors.description} />
                </div>
              </>
            )}
            {initialData && (
              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Description</label>
                  <FaAsterisk size={10} className="text-red-500" />
                </div>
                <textarea placeholder="Describe your product (min 10 characters)" rows="3"
                  className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none resize-none ${errors.description ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
                  value={formData.description}
                  onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: null }); }}
                />
                <ErrorMsg msg={errors.description} />
              </div>
            )}
            <div className="space-y-2 col-span-2">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Features</label>
                <FaAsterisk size={10} className="text-red-500" />
              </div>
              <div className="flex gap-2 items-center relative">
                <input placeholder="Add at least 3 features" value={featureInput}
                  className={`flex-1 p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${errors.features ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-blue-500'}`}
                  onChange={(e) => { setfeatureInput(e.target.value); if (errors.features) setErrors({ ...errors, features: null }); }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature(e)}
                />
                <button type="button" onClick={handleAddFeature}
                  className="ml-2 right-2 bg-blue-500 text-white px-4 py-2 absolute rounded-lg hover:bg-blue-600 text-sm font-bold transition-transform active:scale-90">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 min-h-8">
                {formData.features.map((feat, index) => {
                  const display = typeof feat === 'string' ? feat : feat.name || String(feat);
                  return (
                    <div key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold transition-all hover:bg-blue-100">
                      <span>{display}</span>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))} className="hover:text-red-500 transition-colors">✕</button>
                    </div>
                  )
                })}
                {formData.features.length === 0 && !errors.features && <p className="text-xs text-gray-400 italic ml-1">No features added yet</p>}
              </div>
              <ErrorMsg msg={errors.features} />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2 font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
            <button type="submit" disabled={uploading} className="bg-[#4379EE] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#3768D1] transition-all disabled:opacity-50">
              {uploading ? "Processing..." : initialData ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
        <div>
          {variantFormOpen && initialData && (
            <ProductVariantModal
              productId={initialData.id}
              variantToEdit={variantFormOpen.mode === 'edit' ? variantFormOpen.variant : null}
              onClose={() => setVariantFromOpen(false)}
              onSave={async () => {
                setVariantFromOpen(false);
                // Fetch updated product data to show new/updated variants immediately
                try {
                  const response = await api.get(`/vendor/products/${initialData.id}`);
                  if (response.data.success && response.data.product) {
                    // Update initialData with new variants
                    onSave();
                  }
                } catch (err) {
                  console.error('Failed to fetch updated product:', err);
                  onSave();
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ProductVariantModal = ({ productId, onClose, onSave, variantToEdit }) => {
  const [variantFiles, setVariantFiles] = useState([]);
  const [variantErrors, setVariantErrors] = useState({});
  const [variantUploading, setVariantUploading] = useState(false);

  const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange', 'Pink', 'Gray'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '32', '34', '36', '38', '40', '42'];

  const [variantData, setVariantData] = useState({
    color: variantToEdit?.color || '',
    size: variantToEdit?.size || '',
    price: variantToEdit?.price || '',
    stock: variantToEdit?.stock || 0,
  });

  const [existingVariantImages, setExistingVariantImages] = useState(
    variantToEdit?.images && variantToEdit.images.length > 0
      ? variantToEdit.images
      : variantToEdit?.image ? [variantToEdit.image] : []
  );

  const variantPreviews = variantFiles.map(f => URL.createObjectURL(f));

  const validateVariant = () => {
    let newErrors = {};

    if (!variantData.color.trim()) newErrors.color = "Color is required";
    if (!variantData.size.trim()) newErrors.size = "Size is required";
    if (!variantToEdit && variantFiles.length === 0) newErrors.images = "At least one variant image is required";
    if (!variantData.price || variantData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (variantData.stock === "" || variantData.stock < 0) newErrors.stock = "Stock cannot be negative";

    setVariantErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVariantFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const remaining = 5 - variantPreviews.length;

    if (remaining <= 0) {
      toast.error("Maximum 5 images allowed per variant");
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remaining);
    setVariantFiles(prev => [...prev, ...filesToAdd]);
    if (variantErrors.images) setVariantErrors({ ...variantErrors, images: null });
  };

  const removeVariantFile = (index) => {
    setVariantFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingVariantImage = (index) => {
    setExistingVariantImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    if (!validateVariant()) return;

    setVariantUploading(true);

    const formData = new FormData();
    formData.append("color", variantData.color);
    formData.append("size", variantData.size);
    formData.append("price", variantData.price);
    formData.append("stock", variantData.stock);

    for (const file of variantFiles) {
      formData.append("files", file);
    }

    // For update: send existing images that were kept
    if (variantToEdit) {
      formData.append("existingImages", JSON.stringify(existingVariantImages));
    }

    try {
      if (variantToEdit) {
        // Update existing variant
        await api.patch(`/vendor/products/${productId}/variants/${variantToEdit.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Variant updated successfully!");
      } else {
        // Create new variant
        await api.post(`/vendor/products/${productId}/variants`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Variant created successfully!");
      }
      setVariantFiles([]);
      setVariantData({ color: '', size: '', price: '', stock: 0 });
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save variant");
    } finally {
      setVariantUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[95vh]">
        <h2 className="text-2xl font-bold text-[#202224] mb-6">
          {variantToEdit ? 'Edit Product Variant' : 'Add Product Variant'}
        </h2>

        <form onSubmit={handleVariantSubmit} className="space-y-6">

          {/* Image Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Variant Images</label>
              <FaAsterisk size={10} className="text-red-500" />
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50/50"
              onClick={() => document.getElementById('variant-file-input').click()}
            >
              <FiUploadCloud size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-600 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB (Max 5 images)</p>
              <input
                id="variant-file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleVariantFileChange}
                className="hidden"
              />
            </div>

            {variantErrors.images && <p className="text-[10px] text-red-500 font-bold">{variantErrors.images}</p>}

            {/* Image Previews */}
            {(variantPreviews.length > 0 || existingVariantImages.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {existingVariantImages.map((image, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img src={image} alt={`Existing ${index}`} className="w-full h-24 object-cover rounded-lg border border-green-200 bg-green-50" />
                    <button
                      type="button"
                      onClick={() => removeExistingVariantImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded font-bold">Existing</span>
                  </div>
                ))}
                {variantPreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img src={preview} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => removeVariantFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-bold">New</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Color and Size Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Color</label>
                <FaAsterisk size={10} className="text-red-500" />
              </div>
              <select
                value={variantData.color}
                onChange={(e) => {
                  setVariantData({ ...variantData, color: e.target.value });
                  if (variantErrors.color) setVariantErrors({ ...variantErrors, color: null });
                }}
                className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${variantErrors.color ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
              >
                <option value="">Select a color</option>
                {colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              {variantErrors.color && <p className="text-[10px] text-red-500 font-bold">{variantErrors.color}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Size</label>
                <FaAsterisk size={10} className="text-red-500" />
              </div>
              <select
                value={variantData.size}
                onChange={(e) => {
                  setVariantData({ ...variantData, size: e.target.value });
                  if (variantErrors.size) setVariantErrors({ ...variantErrors, size: null });
                }}
                className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${variantErrors.size ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
              >
                <option value="">Select a size</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {variantErrors.size && <p className="text-[10px] text-red-500 font-bold">{variantErrors.size}</p>}
            </div>
          </div>

          {/* Price and Stock Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Variant Price</label>
                <FaAsterisk size={10} className="text-red-500" />
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="Enter price"
                value={variantData.price}
                onChange={(e) => {
                  setVariantData({ ...variantData, price: e.target.value });
                  if (variantErrors.price) setVariantErrors({ ...variantErrors, price: null });
                }}
                className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${variantErrors.price ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
              />
              {variantErrors.price && <p className="text-[10px] text-red-500 font-bold">{variantErrors.price}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Stock Quantity</label>
                <FaAsterisk size={10} className="text-red-500" />
              </div>
              <input
                type="number"
                placeholder="Enter stock"
                value={variantData.stock}
                onChange={(e) => {
                  setVariantData({ ...variantData, stock: Math.max(0, Number(e.target.value) || 0) });
                  if (variantErrors.stock) setVariantErrors({ ...variantErrors, stock: null });
                }}
                className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none transition-all ${variantErrors.stock ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-blue-500'}`}
              />
              {variantErrors.stock && <p className="text-[10px] text-red-500 font-bold">{variantErrors.stock}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={variantUploading}
              className="bg-[#4379EE] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#3768D1] transition-all disabled:opacity-50"
            >
              {variantUploading ? "Processing..." : variantToEdit ? "Update Variant" : "Create Variant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VendorProducts;
