import React, { useState, useEffect } from "react";
import { CiMapPin } from "react-icons/ci";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import AddressModal from "../../components/User/AddressModal";
import api from "../../utils/api";
import { toast, useToasterStore } from "react-hot-toast";

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Fetch all addresses
  const fetchAddresses = async () => {
    try {
      const { data } = await api.get("/addresses");
      setAddresses(data);
    } catch (err) {
      console.error("Failed to load addresses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      toast.success("Address deleted");
    } catch (err) {
      alert("Delete failed");
    }
  };

  // Handle Add or Update
  const saveAddress = async (formData) => {
    if (formData.postalCode.toString().length !== 6) {
      toast.error("Postal code must be exactly 6 digits");
      return;
    }
    try {
      if(!formData.fullName || !formData.phoneNumber || !formData.streetAddress || !formData.city || !formData.state || !formData.postalCode){
        toast.error("Please fill all required fields");
        return;
      }

      if(formData.fullName.trim() === "" || formData.phoneNumber.trim() === "" || formData.streetAddress.trim() === "" || formData.city.trim() === "" || formData.state.trim() === "" || formData.postalCode.toString().trim() === ""){
        toast.error("Please fill all required fields");
        return;
      }

      // checkfor valid postal code
      if(formData.postalCode.toString().length < 4 || formData.postalCode.toString().length > 10){
        toast.error("Please enter a valid postal code");
        return;
      }
      if (editingAddress) {
        await api.patch(`/addresses/${editingAddress.id}`, formData);
      } else {
        const cleanData = Object.keys(formData).reduce((acc, key) => {
          acc[key] =
            typeof formData[key] === "string"
              ? formData[key].trim()
              : formData[key];
          return acc;
        }, {});

        // 2. FRONTEND VALIDATION
        if (
          !cleanData.fullName ||
          !cleanData.streetAddress ||
          !cleanData.phoneNumber
        ) {
          toast.error("Please fill in all required fields (no spaces only!)");
          return;
        }

        if (cleanData.postalCode.length !== 6) {
          toast.error("Postal code must be exactly 6 digits");
          return;
        }
        await api.post("/addresses", formData);
      }
      toast.success("Addres addd succesfully");
      setShowModal(false);
      setEditingAddress(null);
      fetchAddresses(); // Refresh list
    } catch (err) {
      console.log(err);
      alert("Error saving address");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading addresses...</div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm rounded-xl">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
        <button
          aria-label="add-btn"
          onClick={() => {
            setEditingAddress(null);
            setShowModal(true);
            console.log("Clicked ");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          Add New Address
        </button>
      </div>

      <div
        className={`grid grid-cols-1 md:${addresses.length === 0 && "grid-cols-1"} gap-4`}
      >
        <div>
          {addresses.length === 0 ? (
            <div className="border-dotted border-slate-200 border rounded-xl flex justify-center items-center w-fill col-span-2 py-4 text-gray-400">
              No address added yet
            </div>
          ) : (
            <div>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-xl border-2 transition-all ${addr.isDefault ? "border-blue-500 bg-blue-50/30" : "border-gray-100"}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <CiMapPin
                        size={20}
                        className={
                          addr.isDefault ? "text-blue-600" : "text-gray-400"
                        }
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {addr.addressType}
                      </span>
                      {addr.isDefault && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingAddress(addr);
                          setShowModal(true);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                        aria-label="edit-btn"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-red-500"
                        aria-label="delt-btn"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900">{addr.fullName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {addr.streetAddress}, {addr.city}
                  </p>
                  <p className="text-sm text-gray-600">
                    {addr.state} - {addr.postalCode}
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-2">
                    {addr.phoneNumber}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AddressModal
          onClose={() => setShowModal(false)}
          onSave={saveAddress}
          initialData={editingAddress}
        />
      )}
    </div>
  );
};

export default AddressManager;
