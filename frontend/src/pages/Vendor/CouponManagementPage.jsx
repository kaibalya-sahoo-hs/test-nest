import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { FiEdit, FiTrash2, FiGlobe, FiShoppingBag, FiPackage } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SCOPE_OPTIONS = [
    { value: 'vendor', label: 'All My Products', icon: <FiShoppingBag size={16} />, description: 'Applies to every product in your store' },
    { value: 'product', label: 'Specific Products', icon: <FiPackage size={16} />, description: 'Choose which products this coupon covers' },
];

const CouponManagementPage = () => {
    const [open, setOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [form, setForm] = useState({
        code: "",
        discount: "",
        type: "percentage",
        expiry: "",
        scope: "vendor",
        productIds: [],
        description: "",
        usageLimit: "",
        minAmount: "",
        maxDiscount: "",
    });
    const [errors, setErrors] = useState({});
    const [products, setProducts] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productSearch, setProductSearch] = useState("");

    const resetForm = () => {
        setForm({
            code: "", discount: "", type: "percentage", expiry: "",
            scope: "vendor", productIds: [], description: "", usageLimit: "",
            minAmount: "", maxDiscount: "",
        });
        setErrors({});
        setEditingCoupon(null);
        setProductSearch("");
    };

    const fetchCoupons = async () => {
        const { data } = await api.get('/vendor/coupons');
        if (data.success) setCoupons(data.coupons);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await api.get("/vendor/products");
            setProducts(data.data);
        };
        fetchCoupons();
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const toggleProductSelection = (productId) => {
        setForm(prev => {
            const ids = prev.productIds.includes(productId)
                ? prev.productIds.filter(id => id !== productId)
                : [...prev.productIds, productId];
            return { ...prev, productIds: ids };
        });
        if (errors.productIds) setErrors(prev => ({ ...prev, productIds: null }));
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const validate = () => {
        const newErrors = {};
        if (!form.code.trim()) newErrors.code = "Coupon code is required";
        else if (form.code.trim().length < 3) newErrors.code = "Code must be at least 3 characters";
        else if (form.code.trim().length > 20) newErrors.code = "Code must be 20 characters or less";
        else if (!/^[a-zA-Z0-9]+$/.test(form.code.trim())) newErrors.code = "Code must be alphanumeric only";

        if (!form.description.trim()) newErrors.description = "Description is required";

        if (!form.discount || Number(form.discount) <= 0) newErrors.discount = "Discount must be greater than 0";
        if (form.type === "percentage" && Number(form.discount) > 100) newErrors.discount = "Percentage cannot exceed 100";

        if (form.scope === "product" && form.productIds.length === 0) {
            newErrors.productIds = "Select at least one product";
        }

        if (form.expiry && new Date(form.expiry) < new Date()) newErrors.expiry = "Expiry date must be in the future";

        if (form.usageLimit && Number(form.usageLimit) < 0) newErrors.usageLimit = "Usage limit cannot be negative";

        if (form.minAmount && Number(form.minAmount) < 0) newErrors.minAmount = "Min amount cannot be negative";
        if (form.maxDiscount && Number(form.maxDiscount) < 0) newErrors.maxDiscount = "Max discount cannot be negative";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            if (editingCoupon) {
                // Update existing coupon
                await api.patch(`/vendor/coupon/${editingCoupon.id}`, {
                    code: form.code,
                    discount: form.discount,
                    type: form.type,
                    expiry: form.expiry || null,
                    description: form.description,
                    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                    scope: form.scope,
                    productIds: form.scope === 'product' ? form.productIds : [],
                    minAmount: form.minAmount ? Number(form.minAmount) : null,
                    maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
                });
                toast.success('Coupon updated successfully');
            } else {
                // Create new coupon
                const bodyData = {
                    coupon: {
                        code: form.code,
                        discount: form.discount,
                        type: form.type,
                        expiry: form.expiry || null,
                        isActive: true,
                        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                        description: form.description,
                        scope: form.scope,
                        minAmount: form.minAmount ? Number(form.minAmount) : null,
                        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
                    },
                    productIds: form.scope === 'product' ? form.productIds : [],
                };
                await api.post('/vendor/coupon', bodyData);
                toast.success('Coupon created successfully');
            }
            fetchCoupons();
            setOpen(false);
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setForm({
            code: coupon.displayName || "",
            discount: coupon.discountValue || "",
            type: coupon.type || "percentage",
            expiry: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : "",
            scope: coupon.scope || "vendor",
            productIds: (coupon.products || []).map(p => p.id),
            description: coupon.description || "",
            usageLimit: coupon.usageLimit || "",
            minAmount: coupon.minimumAmount || "",
            maxDiscount: coupon.maxDiscountAmount || "",
        });
        setErrors({});
        setOpen(true);
    };

    const handleDelete = async (couponId) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await api.delete(`/vendor/coupon/${couponId}`);
            toast.success("Coupon deleted");
            setCoupons(coupons.filter(c => c.id !== couponId));
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const handleToggle = async (couponId) => {
        try {
            const { data } = await api.patch(`/vendor/coupon/${couponId}/toggle`);
            toast.success(data.message);
            setCoupons(coupons.map(c => c.id === couponId ? { ...c, isActive: data.isActive } : c));
        } catch (err) {
            toast.error("Toggle failed");
        }
    };

    const getScopeBadge = (scope) => {
        const map = {
            global: { label: 'Global', classes: 'bg-purple-50 text-purple-600 border-purple-100' },
            vendor: { label: 'All Products', classes: 'bg-blue-50 text-blue-600 border-blue-100' },
            product: { label: 'Specific', classes: 'bg-amber-50 text-amber-600 border-amber-100' },
        };
        const info = map[scope] || map.product;
        return (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${info.classes}`}>
                {info.label}
            </span>
        );
    };

    const ErrorMsg = ({ msg }) => msg ? (
        <p className="text-[10px] text-red-500 font-bold ml-1 mt-1">{msg}</p>
    ) : null;

    return (
        <div className="min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Coupon Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Create and manage discount coupons for your products</p>
                </div>
                <button
                    className="flex text-sm items-center gap-2 bg-[#4379EE] hover:bg-[#3662c1] text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95"
                    onClick={() => { resetForm(); setOpen(true); }}
                >
                    <FaPlus size={14} /> Add New Coupon
                </button>
            </div>

            {/* Coupon Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead className="bg-gray-50/80 border-b border-gray-100">
                            <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Scope</th>
                                <th className="px-6 py-4">Expires</th>
                                <th className="px-6 py-4 text-center">Limit</th>
                                <th className="px-6 py-4 text-center">Used</th>
                                <th className="px-6 py-4">Products</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length === 0 ? (
                                <tr><td colSpan="10" className="text-center py-12 text-gray-400">No coupons yet. Create your first one!</td></tr>
                            ) : coupons.map((coupon) => (
                                <tr key={coupon.id} className="border-b border-gray-50 text-sm font-medium text-gray-800 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 max-w-[200px]">
                                        <p className="font-semibold text-[#1F2937] truncate">{coupon.description}</p>
                                    </td>
                                    <td className="px-6 py-4 font-mono">
                                        <span className="inline-block px-3 py-1 bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7] rounded-lg font-bold text-xs uppercase tracking-wide">
                                            {coupon.displayName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        {coupon.type === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getScopeBadge(coupon.scope)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-center">{coupon.usageLimit || '∞'}</td>
                                    <td className="px-6 py-4 text-center">{coupon.usageCount}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {coupon.scope === 'global' ? (
                                            <span className="text-purple-500 font-semibold">All Platform</span>
                                        ) : coupon.scope === 'vendor' ? (
                                            <span className="text-blue-500 font-semibold">All My Products</span>
                                        ) : (
                                            <span title={(coupon.products || []).map(p => p.name).join(', ')}>
                                                {(coupon.products || []).length} product{(coupon.products || []).length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleToggle(coupon.id)} className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer" style={{ backgroundColor: coupon.isActive ? '#4379EE' : '#D1D5DB' }}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${coupon.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-1">
                                            <button onClick={() => handleEdit(coupon)} className="p-2 text-gray-400 hover:text-[#4379EE] hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                                <FiEdit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(coupon.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
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

            {/* Create / Edit Modal */}
            {open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[#202224]">
                                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                            </h2>
                            <button onClick={() => { setOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Coupon Code */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Coupon Code <span className="text-red-500">*</span></label>
                                <input name="code" placeholder="e.g. SAVE10" value={form.code} onChange={handleChange}
                                    className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none text-sm font-medium transition-all uppercase ${errors.code ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-[#4379EE]'}`}
                                />
                                <ErrorMsg msg={errors.code} />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description <span className="text-red-500">*</span></label>
                                <input name="description" placeholder="e.g. Summer sale 10% off" value={form.description} onChange={handleChange}
                                    className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none text-sm ${errors.description ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-[#4379EE]'}`}
                                />
                                <ErrorMsg msg={errors.description} />
                            </div>

                            {/* Discount Value & Type */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Discount Value <span className="text-red-500">*</span></label>
                                    <input name="discount" type="number" placeholder="10" value={form.discount} onChange={handleChange}
                                        className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none text-sm ${errors.discount ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-[#4379EE]'}`}
                                    />
                                    <ErrorMsg msg={errors.discount} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
                                    <select name="type" value={form.type} onChange={handleChange}
                                        className="w-full p-3 bg-[#F1F4F9] rounded-xl outline-none text-sm">
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Scope Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Coupon Scope <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-3 gap-2">
                                    {SCOPE_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                setForm(prev => ({
                                                    ...prev,
                                                    scope: opt.value,
                                                    productIds: opt.value !== 'product' ? [] : prev.productIds,
                                                }));
                                            }}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${form.scope === opt.value
                                                    ? 'border-[#4379EE] bg-blue-50/80 text-[#4379EE]'
                                                    : 'border-gray-100 bg-[#F9FAFB] text-gray-500 hover:border-gray-200'
                                                }`}
                                        >
                                            {opt.icon}
                                            <span className="text-xs font-bold">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                                    {SCOPE_OPTIONS.find(o => o.value === form.scope)?.description}
                                </p>
                            </div>

                            {/* Product Multi-Select (only for 'product' scope) */}
                            {form.scope === 'product' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Select Products <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full p-2.5 bg-[#F1F4F9] rounded-xl outline-none text-sm mb-2 focus:ring-2 focus:ring-[#4379EE]"
                                    />
                                    {/* Selected products tags */}
                                    {form.productIds.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {form.productIds.map(id => {
                                                const p = products.find(pr => pr.id === id);
                                                return p ? (
                                                    <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                                                        {p.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleProductSelection(id)}
                                                            className="text-blue-400 hover:text-red-500 transition-colors ml-0.5"
                                                        >
                                                            ✕
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                    {/* Product list */}
                                    <div className={`border rounded-xl overflow-hidden max-h-40 overflow-y-auto ${errors.productIds ? 'border-red-300' : 'border-gray-100'}`}>
                                        {filteredProducts.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-4">No products found</p>
                                        ) : filteredProducts.map(p => (
                                            <label
                                                key={p.id}
                                                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${form.productIds.includes(p.id) ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.productIds.includes(p.id)}
                                                    onChange={() => toggleProductSelection(p.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-[#4379EE] focus:ring-[#4379EE] accent-[#4379EE]"
                                                />
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    {p.image && (
                                                        <img src={p.image} alt="" className="w-7 h-7 rounded-md object-cover flex-shrink-0" />
                                                    )}
                                                    <span className="text-xs font-medium text-gray-700 truncate">{p.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-400 font-bold flex-shrink-0">₹{Number(p.price).toLocaleString('en-IN')}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <ErrorMsg msg={errors.productIds} />
                                </div>
                            )}

                            {/* Min Amount & Max Discount */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Min Order Amount</label>
                                    <input name="minAmount" type="number" placeholder="No minimum" value={form.minAmount} onChange={handleChange}
                                        className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none text-sm ${errors.minAmount ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-[#4379EE]'}`}
                                    />
                                    <ErrorMsg msg={errors.minAmount} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max Discount (₹)</label>
                                    <input name="maxDiscount" type="number" placeholder="No limit" value={form.maxDiscount} onChange={handleChange}
                                        className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none text-sm ${errors.maxDiscount ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-[#4379EE]'}`}
                                    />
                                    <ErrorMsg msg={errors.maxDiscount} />
                                </div>
                            </div>

                            {/* Usage Limit & Expiry */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Usage Limit</label>
                                    <input name="usageLimit" type="number" placeholder="Unlimited" value={form.usageLimit} onChange={handleChange}
                                        className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none text-sm ${errors.usageLimit ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-[#4379EE]'}`}
                                    />
                                    <ErrorMsg msg={errors.usageLimit} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
                                    <input name="expiry" type="date" value={form.expiry} onChange={handleChange}
                                        className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none text-sm ${errors.expiry ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-[#4379EE]'}`}
                                    />
                                    <ErrorMsg msg={errors.expiry} />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => { setOpen(false); resetForm(); }}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-1 py-3 bg-[#4379EE] text-white font-bold rounded-xl hover:bg-[#3662c1] disabled:opacity-50 transition-all">
                                    {isSubmitting ? 'Processing...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManagementPage;
