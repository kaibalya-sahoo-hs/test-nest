import React, { useState } from 'react';

function Filter({ title, filterOptions, onClose, onChange }) {
  const [selected, setSelected] = useState([]);

  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      setSelected(selected.filter((item) => item !== opt));
    } else {
      setSelected([...selected, opt]);
    }
  };

  const handleApply = () => {
    // If nothing selected, we assume "All" or just close
    if (selected.length > 0) {
      // Logic: If multiple selected, we pass the array or the first one 
      // based on your Users.js handleFilterChange logic
      onChange(selected[0]); 
    }
    onClose();
  };

  return (
    // Fixed positioning to be relative to the trigger
    <div className="absolute top-12 left-0 z-50 w-[400px] bg-white rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="p-6 pb-2">
        <h2 className="text-xl font-bold text-[#202224] mb-6">{title}</h2>
        
        {/* Pills Container */}
        <div className="flex flex-wrap gap-3 mb-6">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleOption(opt)}
              className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                selected.includes(opt)
                  ? 'bg-[#4379EE] border-[#4379EE] text-white shadow-md'
                  : 'bg-white border-gray-200 text-[#202224] hover:border-[#4379EE]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-50 p-6 bg-gray-50/30">
        <p className="text-[11px] text-gray-400 font-medium mb-6 italic">
          *You can choose multiple {title.toLowerCase()}
        </p>
        
        <div className="flex justify-center">
          <button 
            onClick={handleApply}
            className="w-full max-w-[180px] bg-[#4379EE] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-[#3768D1] transition-all"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Filter;