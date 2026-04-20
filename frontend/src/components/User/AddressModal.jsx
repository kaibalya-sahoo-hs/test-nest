import { useState } from "react";
import toast from "react-hot-toast";

const AddressModal = ({ onClose, onSave, initialData }) => {
  console.log("Address modal called");
  const [formData, setFormData] = useState(
    initialData || {
      fullName: "",
      phoneNumber: "",
      streetAddress: "",
      city: "",
      state: "",
      postalCode: "",
      addressType: "home",
      isDefault: false,
    },
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="address-modal-title"
      data-testid="address-modal"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
      >
        <h3 id="address-modal-title" className="text-xl font-bold mb-6">
          {initialData ? "Edit" : "Add New"} Address
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <input
            required
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          />
          <input
          type="number"
            required
            placeholder="Phone Number"
            className="w-full p-3 border rounded-lg"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />
          <textarea
            required
            placeholder="Street Address"
            className="w-full p-3 border rounded-lg"
            value={formData.streetAddress}
            onChange={(e) =>
              setFormData({ ...formData, streetAddress: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="City"
              className="p-3 border rounded-lg"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
            <input
              type="number"
              required
              placeholder="Postal Code"
              className="p-3 border rounded-lg"
              value={formData.postalCode}
              onChange={(e) =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="State"
              className="p-3 border rounded-lg"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            />
          </div>

          <div className="flex gap-4 items-center mt-2">
            <label className="text-sm font-bold text-gray-700">Type:</label>
            {["home", "work", "other"].map((t) => (
              <label
                key={t}
                className="flex items-center gap-1 text-sm cursor-pointer capitalize"
              >
                <input
                  type="radio"
                  checked={formData.addressType === t}
                  onChange={() => setFormData({ ...formData, addressType: t })}
                />{" "}
                {t}
              </label>
            ))}
          </div>

          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData({ ...formData, isDefault: e.target.checked })
              }
            />
            <span className="text-sm text-gray-600">
              Set as default address
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-500 font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-200"
          >
            Save Address
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressModal;
