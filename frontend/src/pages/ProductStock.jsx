import React from 'react';
import { FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';

const ProductStock = () => {
  const stockData = [
    { id: 1, name: "Apple Watch Series 4", category: "Digital Product", price: "$690.00", piece: 63, colors: ['bg-black', 'bg-gray-400', 'bg-red-300'], img: "https://images.macrumors.com/t/wH_bZG4JMw5WDKnHKK_ZZ6ym3Z4=/400x0/article-new/2022/09/apple-watch-ultra-waypoint-watch-face.jpg?lossy" },
    { id: 2, name: "Microsoft Headsquare", category: "Digital Product", price: "$190.00", piece: 13, colors: ['bg-black', 'bg-red-400', 'bg-blue-500', 'bg-yellow-400'], img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndMcJW71HLgi9ntgoterJiJJjLxbtOVVpyA&s" },
    { id: 3, name: "Women's Dress", category: "Fashion", price: "$640.00", piece: 635, colors: ['bg-purple-800', 'bg-blue-300', 'bg-indigo-900', 'bg-blue-600'], img: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRotdC1JOwwYWdkID1ZKhSBhHrhL-LuQVNhKj2aSVxi1uPK7HwiES8V4dEKpPIJpUxXg8f8Bi-u8BYF-58zPgilFd31aPGCAC3ZFACXidSwI_w8JUmH44nw&usqp=CAc" },
    { id: 4, name: "Samsung A50", category: "Mobile", price: "$400.00", piece: 67, colors: ['bg-blue-900', 'bg-black', 'bg-pink-700'], img: "https://images.samsung.com/is/image/samsung/ie-galaxy-a50-sm-a505fzwsbtu-backwhite-181313984?$720_576_JPG$" },
  ];

  return (
    <div className="p-8 bg-[#F5F6FA] min-h-screen font-sans mt-15">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#202224]">Product Stock</h1>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search product name"
            className="pl-10 pr-4 py-2 w-72 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-[14px] font-bold text-[#202224]">Image</th>
              <th className="px-6 py-4 text-[14px] font-bold text-[#202224]">Product Name</th>
              <th className="px-6 py-4 text-[14px] font-bold text-[#202224]">Category</th>
              <th className="px-6 py-4 text-[14px] font-bold text-[#202224]">Price</th>
              <th className="px-6 py-4 text-[14px] font-bold text-[#202224]">Piece</th>
              <th className="px-6 py-4 text-[14px] font-bold text-[#202224]">Available Color</th>
              <th className="px-6 py-4 text-[14px] font-bold text-[#202224] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-6">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src={item.img} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                  </div>
                </td>
                <td className="px-6 py-4 text-[14px] text-[#202224] font-medium">{item.name}</td>
                <td className="px-6 py-4 text-[14px] text-[#202224]">{item.category}</td>
                <td className="px-6 py-4 text-[14px] text-[#202224] font-semibold">{item.price}</td>
                <td className="px-6 py-4 text-[14px] text-[#202224]">{item.piece}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {item.colors.map((color, idx) => (
                      <span key={idx} className={`w-4 h-4 rounded-full ${color} border border-gray-100 shadow-sm`}></span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <div dir='ltr'>
                    <button className="p-2 border border-gray-200 rounded-s-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-all">
                      <FiEdit size={16} />
                    </button>
                    </div>
                    <div dir='rtl'>
                    <button className="p-2 border text-red-500 border-gray-200 rounded-s-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
                      <FiTrash2 size={16} />
                    </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductStock;