import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import api from '../../utils/api'

function Payments() {
  const { orderId } = useParams()
  const [payments, setPayments] = useState([])
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  const fetchPayments = async () => {
    const { data } = await api.get(`/admin/orders/payments/${orderId}`)
    console.log(data)
    setPayments(data.payments)
  }
  useEffect(() => {
    fetchPayments()
  }, [])
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Transaction & Logs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Razorpay Order ID</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Current Status</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold text-center">History</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <React.Fragment key={payment.id}>
                {/* Main Payment Row */}
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono text-sm text-blue-600">{payment.razorpayOrderId}</div>
                    <div className="text-xs text-gray-400">{payment.razorpayPaymentId || 'No Payment ID'}</div>
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {payment.currency} {parseFloat(payment.amount).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleRow(payment.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-semibold underline"
                    >
                      {expandedRow === payment.id ? 'Hide Logs' : `View Logs (${payment.statusHisotry?.length || 0})`}
                    </button>
                  </td>
                </tr>

                {/* Expanded Status History Row */}
                {expandedRow === payment.id && (
                  <tr className="bg-gray-50">
                    <td colSpan="5" className="p-0">
                      <div className="p-4 border-l-4 border-blue-400 ml-8 my-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Status Timeline</h4>
                        <div className="space-y-3">
                          {payment.statusHisotry && payment.statusHisotry.length > 0 ? (
                            payment.statusHisotry.map((log) => (
                              <div key={log.id} className="flex items-center gap-4 text-sm">
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                <div className="min-w-[100px] font-medium text-gray-700 uppercase">
                                  {log.paymentStatus}
                                </div>
                                <div className="text-gray-400">
                                  {new Date(log.createdAt).toLocaleString()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-400 italic">No logs available</div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Payments