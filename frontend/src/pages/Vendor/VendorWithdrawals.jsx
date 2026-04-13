import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const WithdrawalHistory = ({user}) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const { data } = await api.get('/withdraw');
      setWithdrawals(data.withdraws);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper for Status Badge colors
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'processed':
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'reversed':
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Recent Withdrawals</h3>
        <button onClick={fetchWithdrawals} className="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Payout ID / Ref</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-400">Loading history...</td></tr>
            ) : withdrawals.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-400">No transactions found.</td></tr>
            ) : (
              withdrawals.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                        {item.payoutId || 'Initializing...'}
                    </div>
                    <div className="text-xs text-gray-400 truncate w-24">
                        {item.transactionId}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    ₹{item.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawalHistory;