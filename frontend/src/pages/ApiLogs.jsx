import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {useNavigate} from 'react-router'

const ApiLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate()

  const fetchLogs = async () => {
    const adminKey = localStorage.getItem('admin');
    
    try {
      const response = await fetch('http://localhost:8000/admin/apiLogs', {
        method: 'GET', // Sending body requires POST or similar
        headers: { 'Content-Type': 'application/json' },// Sends true if key exists, false otherwise
      });

      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
      } else {
        toast.error("Failed to retrieve system logs");
      }
    } catch (error) {
      console.error("Log fetch error:", error);
      toast.error("Server connection lost");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Helper to color status codes
  const getStatusColor = (code) => {
    if (code >= 200 && code < 300) return 'text-green-600';
    if (code >= 400) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b-4 border-black pb-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">System API Logs</h1>
            <p className="font-bold text-xs uppercase text-gray-500 mt-1">Real-time traffic monitor</p>
          </div>
          <div className=''>
          <button 
            onClick={fetchLogs}
            className="border-2 mx-2 rounded-md border-black px-4 py-2 font-black text-xs uppercase hover:bg-black hover:text-white transition-all shadow-black shadow-sm active:translate-y-1 active:shadow-none bg-white"
          >
            Refresh Feed
          </button>
          <button 
            onClick={() => navigate('/admin')}
            className="border-2 mx-2 rounded-md border-black px-4 py-2 font-black text-xs uppercase hover:bg-black hover:text-white transition-all shadow-black shadow-sm active:translate-y-1 active:shadow-none bg-white"
          >
            Dashboard
          </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="border-4 border-black bg-white rounded-xl overflow-hidden overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-xs tracking-widest">
                <th className="p-4 border-r border-white/20">Method</th>
                <th className="p-4 border-r border-white/20">Endpoint</th>
                <th className="p-4 border-r border-white/20 text-center">Status</th>
                <th className="p-4 border-r border-white/20">Payload</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center font-black animate-pulse uppercase">
                    Fetching Encrypted Logs...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="border-b-2 border-black hover:bg-gray-50 transition-colors">
                    <td className="p-4 border-r-2 border-black">
                      <span className={`font-black px-2 py-1 border-2 rounded-md border-black shadow-[2px_2px_0px_0px_black]
                        ${log.method === 'GET' ? 'text-[black] bg-[green]' : 'text-[white] bg-[#d10404]'}`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="p-4 border-r-2 border-black font-bold break-all">
                      {log.url}
                    </td>
                    <td className={`p-4 border-r-2 border-black text-center font-black text-lg ${getStatusColor(log.statusCode)}`}>
                      {log.statusCode}
                    </td>
                    <td className="p-4 border-r-2 border-black text-[10px] text-gray-500 truncate max-w-[150px]">
                      {log.payload ? JSON.stringify(log.payload) : <span className="italic text-gray-300">empty</span>}
                    </td>
                    <td className="p-4 text-xs font-bold text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center font-bold text-gray-400 uppercase">
                    No logs recorded in system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApiLogs;