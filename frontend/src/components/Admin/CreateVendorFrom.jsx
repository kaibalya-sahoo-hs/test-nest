import { useState } from "react";
import { FaShop } from "react-icons/fa6";
import { FiAlignLeft, FiLock, FiMail, FiShield, FiUser, FiUserPlus } from "react-icons/fi";
import api from "../../utils/api";
import toast from "react-hot-toast";

const CreateVendorForm = ({setShowAddForm, setVendors}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    storeDescription: '',
    role: 'vendor'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    if(!formData.name || !formData.email || !formData.password || !formData.storeName || !formData.storeDescription) {
      toast.error("Please fill in all fields");
      return;
    }

    if(formData.name.trim() === '' || formData.email.trim() === '' || formData.password.trim() === '' || formData.storeName.trim() === '' || formData.storeDescription.trim() === '') {
      toast.error("Fields cannot be empty");
      return;
    }

    const { data } = await api.post('/admin/vendor', formData);
    if (data.success) {
        console.log(data)
      toast.success(`Vendor ${formData.name} created as ${formData.role}`);
      setShowAddForm(false);
      setVendors((prevVendors) => [...prevVendors, data.vendor]);
    } else {
      toast.error(data.message || "Failed to create vendor");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-60 ">

    <div className="max-w-md bg-white mx-auto rounded-2xl shadow-xl p-8 border border-gray-100 md:mt-10 md:h-160 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
          <FiUserPlus size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Create New Vendor</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="email"
              required
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
          <div className="relative">
            <FaShop className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="storeName"
              required
              placeholder="John Doe's Store"
              value={formData.storeName}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>


        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Store Description</label>
          <div className="relative">
            <FiAlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="storeDescription"
              required
              placeholder="store description"
              value={formData.storeDescription}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="w-full bg-gray-200 hover:bg-gray-300 text-black font-bold py-4 rounded-xl transition-all transform active:scale-[0.98]"
            onClick={() => setShowAddForm(false)}
          >
            Close Form
          </button>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98]"
          >
            Create Vendor
          </button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default CreateVendorForm;