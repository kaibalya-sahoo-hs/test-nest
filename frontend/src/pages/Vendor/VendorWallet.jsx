import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import WithdrawalHistory from './VendorWithdrawals';
import { useUser } from '../../context/UserContext';

const VendorWallet = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { balance, setBalance } = useUser();

  // Sync state with LocalStorage on mount
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setBalance(parseFloat(balance || 0));
  }, []);

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);

    // 1. Basic Validation
    if (withdrawAmount > balance) {
      return alert("Insufficient balance!");
    }
    if (withdrawAmount <= 0) {
      return alert("Please enter a valid amount.");
    }

    setLoading(true);
    try {
      const { data } = await api.post('/withdraw', { amount: withdrawAmount });
      if (data.success) {
        // 2. Update LocalStorage balance
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const newBalance = balance - withdrawAmount;
        user.balance = newBalance;
        localStorage.setItem('user', JSON.stringify(user));
        
        // 3. Update State
        setBalance(newBalance);
        alert("Withdrawal Initiated Successfully!");
        setIsModalOpen(false);
        setAmount('');
      }
    } catch (err) {
      console.log(err)
      alert(err.response?.data?.message || "Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {/* Wallet Card */}
      <h1 className='text-2xl font-bold'>Wallet</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-sm mt-5">
        <p className="text-gray-500 text-sm">Available Balance</p>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">₹{balance.toLocaleString()}</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Withdraw Funds
        </button>
      </div>

      {/* Withdrawal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Request Payout</h3>
            <p className="text-sm text-gray-500 mb-6">
              Funds will be transferred to your registered bank account.
            </p>

            <form onSubmit={handleWithdrawal}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Withdraw (Max: ₹{balance})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                  <input 
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                    max={balance}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || !amount}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <WithdrawalHistory/>
    </div>
  );
};

export default VendorWallet;