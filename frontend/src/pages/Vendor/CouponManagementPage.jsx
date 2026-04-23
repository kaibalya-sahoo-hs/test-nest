import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CouponManagementPage = () => {
    const [open, setOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [form, setForm] = useState({
        code: "",
        discount: "",
        type: "percentage",
        expiry: "",
        productId: "",
        description: "",
        usageLimit: ""
    });
    const [errors, setErrors] = useState({});
    const [products, setProducts] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setForm({ code: "", discount: "", type: "percentage", expiry: "", productId: "", description: "", usageLimit: "" });
        setErrors({});
        setEditingCoupon(null);
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

    const validate = () => {
        const newErrors = {};
        if (!form.code.trim()) newErrors.code = "Coupon code is required";
        else if (form.code.trim().length < 3) newErrors.code = "Code must be at least 3 characters";
        else if (form.code.trim().length > 20) newErrors.code = "Code must be 20 characters or less";
        else if (!/^[a-zA-Z0-9]+$/.test(form.code.trim())) newErrors.code = "Code must be alphanumeric only";

        if (!form.description.trim()) newErrors.description = "Description is required";

        if (!form.discount || Number(form.discount) <= 0) newErrors.discount = "Discount must be greater than 0";
        if (form.type === "percentage" && Number(form.discount) > 100) newErrors.discount = "Percentage cannot exceed 100";

        if (!form.productId) newErrors.productId = "Please select a product";

        if (form.expiry && new Date(form.expiry) < new Date()) newErrors.expiry = "Expiry date must be in the future";

        if (form.usageLimit && Number(form.usageLimit) < 0) newErrors.usageLimit = "Usage limit cannot be negative";

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
                const { data } = await api.patch(`/vendor/coupon/${editingCoupon.id}`, {
                    code: form.code,
                    discount: form.discount,
                    type: form.type,
                    expiry: form.expiry || null,
                    description: form.description,
                    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                    productId: form.productId,
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
                    },
                    productId: form.productId,
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
            productId: coupon.product?.id || "",
            description: coupon.description || "",
            usageLimit: coupon.usageLimit || "",
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
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Expires</th>
                                <th className="px-6 py-4 text-center">Limit</th>
                                <th className="px-6 py-4 text-center">Used</th>
                                <th className="px-6 py-4">Product</th>
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
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${coupon.type === 'percentage' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-center">{coupon.usageLimit || '∞'}</td>
                                    <td className="px-6 py-4 text-center">{coupon.usageCount}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{coupon.product?.name || '—'}</td>
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
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[#202224]">
                                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                            </h2>
                            <button onClick={() => { setOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Coupon Code <span className="text-red-500">*</span></label>
                                <input name="code" placeholder="e.g. SAVE10" value={form.code} onChange={handleChange}
                                    className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none text-sm font-medium transition-all uppercase ${errors.code ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-[#4379EE]'}`}
                                />
                                <ErrorMsg msg={errors.code} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description <span className="text-red-500">*</span></label>
                                <input name="description" placeholder="e.g. Summer sale 10% off" value={form.description} onChange={handleChange}
                                    className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none text-sm ${errors.description ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-[#4379EE]'}`}
                                />
                                <ErrorMsg msg={errors.description} />
                            </div>

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

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product <span className="text-red-500">*</span></label>
                                <select name="productId" value={form.productId} onChange={handleChange}
                                    className={`w-full p-3 bg-[#F1F4F9] rounded-xl outline-none text-sm ${errors.productId ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-[#4379EE]'}`}>
                                    <option value="">Select Product</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <ErrorMsg msg={errors.productId} />
                            </div>

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
