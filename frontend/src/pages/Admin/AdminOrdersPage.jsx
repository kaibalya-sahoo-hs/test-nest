import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useNavigate } from "react-router";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/admin/orders");
      setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading)
    return <div className="p-10 text-center font-sans">Loading Orders...</div>;

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            Total Orders: {orders.length}
          </span>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                <th className="p-4 border-b">Order Info</th>
                <th className="p-4 border-b">Items Purchased</th>
                <th className="p-4 border-b">Financial Summary</th>
                <th className="p-4 border-b">Payment Info</th>
                <th className="p-4 border-b">Status</th>
              </tr>
            </thead>
            {orders && orders.length === 0 ? <tbody>
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="5">
                  No orders found.
                </td>
              </tr>
            </tbody> :<tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Order Info */}
                  <td className="p-4 align-top">
                    <div className="font-mono text-xs text-blue-600 font-bold mb-1">
                      #{order.id.slice(0, 8)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </td>

                  {/* Items Purchased */}
                  <td className="p-4 align-top">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 mb-2 last:mb-0"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 rounded border object-cover"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            {item.product.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Qty: {item.quantity} × ₹{item.product.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </td>

                  {/* Financial Summary */}
                  <td className="p-4 align-top">
                    <div className="text-sm font-bold text-gray-900">
                      ₹{order.totalAmount}
                    </div>
                    {order.discount > 0 && (
                      <div className="text-xs text-green-600">
                        Discount: -₹{order.discount}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">Tax Incl.</div>
                  </td>

                  {/* Payment Logs Column */}
                  <td className="p-4 align-top">
                    <div
                      className="space-y-2 py-2 px-4 rounded-xl bg-blue-500 text-white w-fit"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      View Payment Logs
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4 align-top">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${order.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>}
            
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminOrdersPage;
