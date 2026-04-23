import React, { useEffect, useState } from 'react';
import { FaPlus, FaRulerVertical } from 'react-icons/fa6';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CouponManagementPage = () => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        code: "",
        discount: "",
        type: "percentage",
        expiry: "",
        minAmount: "",
        productId: "",
        description: "",
        usageLimit: 0
    });
    const [products, setProducts] = useState([]);
    const [coupons, setCoupons] = useState([])

    const fetchCoupons = async () => {
        const {data} = await api.get('/vendor/coupons')
        console.log(data)
        if(data.success){
            setCoupons(data.coupons)
        }
    }

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await api.get("/vendor/products"); // change to your API
            console.log(data)
            setProducts(data.data);
        };

        fetchCoupons()
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const bodyData = {
            coupon: {
                code: form.code,
                discount: form.discount,
                expiry: form.expiry,
                isActive: true,
                usageLimit: form.usageLimit,
                description: form.description
            },
            productId: form.productId
        }
        console.log(bodyData)
        const { data } = await api.post('/vendor/coupon', bodyData)
        if (data.success) {
            toast.success('Coupon added successfully')
        }

        setOpen(false);
    };


    return (
        <div className="min-h-screen ">
            {/* 1. Page Header with Title and "Add New" Button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-[#111827]">
                    Coupon Management
                </h1>
                <button className="flex text-sm items-center gap-2 bg-blue-500 hover:bg-blue-300 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all active:scale-95" onClick={() => setOpen(true)}>
                    <FaPlus size={18} />
                    Add New Coupon
                </button>
            </div>

            {/* 2. Main Coupon Table Card */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        {/* Table Header Row */}
                        <thead className="bg-[#F9FAFB] border-b border-gray-100">
                            <tr className="text-sm font-semibold text-gray-500">
                                <th className="px-6 py-4 min-w-[200px]">Description</th>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Active To</th>
                                <th className="px-6 py-4 whitespace-nowrap">Limit</th>
                                <th className="px-6 py-4 whitespace-nowrap">Used</th>
                                <th className="px-6 py-4 whitespace-nowrap">Product</th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                            {coupons.map((coupon) => (
                                <tr
                                    key={coupon.id}
                                    className="border-b border-gray-100 last:border-b-0 text-sm font-medium text-gray-900 transition-colors hover:bg-[#F9FAFB]"
                                >
                                    {/* description -> Name Column */}
                                    <td className="px-6 py-5 font-semibold text-[#1F2937]">
                                        {coupon.description}
                                        {coupon.product.name && (
                                            <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                                                Product: {coupon.product.name}
                                            </p>
                                        )}
                                    </td>

                                    {/* code -> Code Pill */}
                                    <td className="px-6 py-5 font-mono">
                                        <span className="inline-block px-3 py-1 bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7] rounded font-bold text-xs uppercase tracking-wide">
                                            {coupon.displayName}
                                        </span>
                                    </td>

                                    {/* discountValue -> Price Column */}
                                    <td className="px-6 py-5 text-gray-600">
                                        {coupon.discountValue}
                                    </td>

                                    {/* type -> Active From (Note: based on your object, type holds the date) */}
                                    <td className="px-6 py-5 text-gray-600">
                                        {coupon.type}
                                    </td>

                                    {/* expiryDate -> Active To */}
                                    <td className="px-6 py-5 text-gray-600">
                                        {coupon.expiryDate}
                                    </td>

                                    {/* isActive -> Limit Number (based on your object having 40 here) */}
                                    <td className="px-6 py-5 text-center text-gray-600">
                                        {coupon.usageLimit}
                                    </td>

                                    {/* usageCount -> Used From */}
                                    <td className="px-6 py-5 text-center text-gray-600">
                                        {coupon.usageCount}
                                    </td>

                                    <td className="px-6 py-5 text-center text-gray-600">
                                        {coupon.product.name}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-[420px] p-6 shadow-lg">

                        <h2 className="text-xl font-semibold mb-4">
                            Create Coupon
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-3">

                            {/* Coupon Code */}
                            <input
                                name="code"
                                placeholder="Coupon Code (e.g. SAVE10)"
                                value={form.code}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-100 rounded-xl outline-none"
                                required
                            />

                            <input
                                name="description"
                                placeholder="Description"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-100 rounded-xl outline-none"
                                required
                            />

                            {/* Discount */}
                            <input
                                name="discount"
                                type="number"
                                placeholder="Discount Value"
                                value={form.discount}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-100 rounded-xl outline-none"
                                required
                            />

                            <input
                                name="usageLimit"
                                type="number"
                                placeholder="Usage limit"
                                value={form.usageLimit}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-100 rounded-xl outline-none"
                                required
                            />


                            {/* Type */}
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-100 rounded-xl"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>

                            {/* Product Selection (🔥 NEW) */}
                            <select
                                name="productId"
                                value={form.productId}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-100 rounded-xl"
                                required
                            >
                                <option value="">Select Product</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>

                            {/* Expiry */}
                            <input
                                name="expiry"
                                type="date"
                                value={form.expiry}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-100 rounded-xl outline-none"
                            />

                            {/* Actions */}
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-200"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-blue-500 text-white"
                                >
                                    Save
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
