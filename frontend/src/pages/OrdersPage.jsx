import React, { useState, useEffect } from 'react';
import { api } from "../utils/api";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/users/my-orders');
      if (data.success) {
        console.log(data)
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-20 font-medium">Loading orders...</div>;

  return (
    <div className="min-h-screen">
      <h1 className="text-xl font-bold text-gray-800">Order History</h1>
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
                <th className="py-3 px-6 font-bold">Sl No.</th>
                <th className="py-3 px-6 font-bold">Date</th>
                <th className="py-3 px-6 font-bold text-center">Products</th>
                <th className="py-3 px-6 font-bold">Total Price</th>
                <th className="py-3 px-6 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    {/* Order ID */}
                    <td className="py-4 px-6 font-mono text-xs text-blue-600">
                      {idx+1}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {new Date(order.createdAt).toDateString('en-IN')}
                    </td>

                    {/* Product Images (Max 4) */}
                    <td className="py-4 px-6">
                      <div className="flex -space-x-2 justify-center">
                        {order.items.slice(0, 4).map((item, index) => (
                          <img
                            key={index}
                            className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm bg-gray-200"
                            src={item.productImage}
                            alt={item.productName}
                            title={item.productName}
                          />
                        ))}
                        {order.items.length > 4 && (
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-gray-200 text-[10px] font-bold text-gray-600 shadow-sm">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                      ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;