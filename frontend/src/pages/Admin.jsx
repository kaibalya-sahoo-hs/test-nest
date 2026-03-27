import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import UserModal from '../components/UserModal'; // 1. Import your Modal
import "../AdminTable.css"
import { LuUsers } from "react-icons/lu";
import { IoMdTrendingUp } from "react-icons/io";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';
import Charts from '../components/Charts';
import { GoPackage } from "react-icons/go";
import { AiOutlineStock } from "react-icons/ai";
import { FaClockRotateLeft } from "react-icons/fa6";


const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false)

  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  // 2. State for Modal and Selected User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:8000';

  // --- Auth & Logout ---
  const handleLogout = () => {
    toast.success('Loggedout successfuly');
    localStorage.removeItem('admin');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // --- API Calls ---
  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/users`);
      if (!res.ok) throw new Error('Failed to fetch');

      const allData = await res.json();
      console.log(allData)
      // Filtering based on role
      setUsers(allData.filter(user => user.role === 'guest'));
      setMembers(allData.filter(user => user.role === 'member'));
    } catch (err) {
      toast.error('Error loading data');
      setMessage('Error loading data');
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('admin')) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, []);

  // 3. Updated function to open modal with data
  const handleRowClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const deleteUser = async (e, id) => {
    e.stopPropagation(); // 4. Prevents modal from opening when clicking delete
    if (!window.confirm("Delete User?")) return;
    const res = await fetch(`${BASE_URL}/admin/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== id));
      toast.success("User removed");
    }
  };

  const createMember = async (e) => {
    e.preventDefault();
    if (newMember.email == '' || newMember.name == '' || newMember.password == '') {
      toast.error("Fileds cannot be empty")
    } else {
      const res = await fetch(`${BASE_URL}/admin/member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      const data = await res.json();
      if (res.ok) {
        setMembers([...members, data]);
        setNewMember({ name: '', email: '', password: '' });
        toast.success("Member created");
      }
    }

  };

  const deleteMember = async (id) => {
    if (!window.confirm("Delete Member?")) return;
    const res = await fetch(`${BASE_URL}/admin/members/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMembers(members.filter(m => m.id !== id));
      toast.success("Member deleted");
    }
  };

  const updateUser = async (id, newName, newId) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/edit`, {
        method: 'PATCH', // or 'PUT' depending on your backend
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id, // The original ID to find the user
          updatedCredentials: {
            name: newName,
            id: newId // The new ID if you are changing it
          }
        }),
      });

      const data = await response.json();
      console.log(data)
      if (response.ok && data.success) {
        toast.success(data.message || "Updated successfully");
        fetchData(); // Refresh the table
        setIsModalOpen(false); // Close modal
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Server error during update");
    }
  };

  return (
    <div className="bg-gray-200">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center pb-6">
          <div>
            <h1 className="text-2xl font-black ">Dashboard</h1>
          </div>
        </div>

        <div className='flex justify-between mb-10'>
          <div className='rounded-xl p-6 bg-white w-fit'>
            <div className='flex justify-between'>
              <div>
                <span className='text-sm'>Total Users</span>
                <p className=''>40,000</p>
              </div>
              <div className='p-4 rounded-2xl bg-purple-200 text-purple-500 w-fit text-xl'><LuUsers /></div>
            </div>
            <div className='flex text-sm mt-4 gap-1'>
            <span className='text-green-400 flex gap-1 items-center'><IoMdTrendingUp /><span>50%</span> </span> up from yesterday
            </div>
            <div>
              <p></p>
            </div>
          </div>
          <div className='rounded-xl p-6 bg-white w-fit'>
            <div className='flex justify-between'>
              <div>
                <span className='text-sm'>Total Orders</span>
                <p className=''>40,000</p>
              </div>
              <div className='p-4 rounded-2xl bg-yellow-200 text-yellow-500 w-fit text-xl'><GoPackage /></div>
            </div>
            <div className='flex text-sm mt-4 gap-1'>
            <span className='text-green-400 flex gap-1 items-center'><IoMdTrendingUp /><span>1.3%</span> </span> up from past week
            </div>
            <div>
              <p></p>
            </div>
          </div>
          <div className='rounded-xl p-6 bg-white w-fit'>
            <div className='flex justify-between'>
              <div>
                <span className='text-sm'>Total Sales</span>
                <p className=''>40,000</p>
              </div>
              <div className='p-4 rounded-2xl bg-green-200 text-green-500 w-fit text-xl'><AiOutlineStock /></div>
            </div>
            <div className='flex text-sm mt-4 gap-1'>
            <span className='text-green-400 flex gap-1 items-center'><IoMdTrendingUp /><span>50%</span> </span> up from yesterday
            </div>
            <div>
              <p></p>
            </div>
          </div>
          <div className='rounded-xl p-6 bg-white w-fit'>
            <div className='flex justify-between'>
              <div>
                <span className='text-sm'>Total Pending</span>
                <p className=''>2780</p>
              </div>
              <div className='p-4 rounded-2xl bg-orange-200 text-orange-500 w-fit text-xl'><FaClockRotateLeft/></div>
            </div>
            <div className='flex text-sm mt-4 gap-1'>
            <span className='text-green-400 flex gap-1 items-center'><IoMdTrendingUp /><span>50%</span> </span> up from yesterday
            </div>
            <div>
              <p></p>
            </div>
          </div>
        </div>


        <Charts data={data}/>

          <div className="rounded-lg overflow-hidden p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 ">
                  <th className="p-4 font-black">NAME</th>
                  <th className="p-4 font-black">EMAIL</th>
                  <th className="p-4 font-black text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(u)}
                  >
                    <td className="p-4 font-medium flex items-center gap-4">
                      {/* Profile Pic Thumbnail */}
                      <div className="w-10 h-10 rounded-[50%] border border-[#adacad] overflow-hidden bg-gray-100 flex-shrink-0">
                        {u.profile ? (
                          <img
                            src={u.profile}
                            alt={u.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-xs">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span>{u.name}</span>
                    </td>

                    <td className="p-4 uppercase text-sm font-bold text-red-600">{u.email}</td>

                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => deleteUser(e, u.id)}
                        className="font-bold bg-red-500 text-red-600 hover:underline px-2"
                      >
                        REMOVE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

      </div>

      {/* 7. Render User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={updateUser} // Pass the function here
        onUploadSuccess={fetchData}
        {...selectedUser}
      />
    </div>
  );
};

export default Admin;