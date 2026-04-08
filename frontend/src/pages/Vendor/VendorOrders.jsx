import React, { useEffect, useState } from 'react';
import { FaBox, FaCircle, FaRupeeSign, FaEye } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const VendorOrders = () => {
    const [orders, setOrders] = useState([])

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getOrders = async () => {
    try {
        const {data} = await api.get('/vendor/orders')
        setOrders(data)
    } catch (error) {   
        console.log(error)
        toast.error("Error while fetching orders")    
    }
  }

  useEffect(() => {getOrders()}, [])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#202224]">Orders</h2>
        <span className="text-sm text-gray-500 font-medium">{orders.length} Total Orders</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FBFF] text-gray-400 uppercase text-[11px] tracking-widest font-bold">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                {/* ID Column */}
                <td className="px-6 py-4">
                  <span className="font-bold text-[#202224] text-sm">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                </td>

                {/* Products Column */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <img 
                          src={item.product.image} 
                          alt="" 
                          className="w-8 h-8 rounded-lg object-cover bg-gray-100"
                        />
                        <span className="text-sm text-gray-600 truncate max-w-[150px]">
                          {item.quantity}x {item.product.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>

                {/* Date Column */}
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wide ${getStatusColor(order.status)}`}>
                  
                    {order.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {orders.length === 0 && (
        <div className="p-20 text-center">
          <FaBox className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-gray-400 font-medium">No orders found for your store.</p>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;