import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import UserModal from '../components/UserModal'; // 1. Import your Modal
import "../AdminTable.css"
import { FaPlus } from "react-icons/fa";
import ApiLogChart from '../components/ApiLogChart';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false)

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

  const chartData = [
    { time: '09:00', requests: 120 },
    { time: '10:00', requests: 250 },
    { time: '11:00', requests: 180 },
    { time: '12:00', requests: 400 },
    { time: '13:00', requests: 320 },
  ];

  return (
    <div className="bg-green-500">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b-4 border-black pb-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter ">Admin Dashboard</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-8 py-3 rounded-lg font-bold border-2 border-black ${activeTab === 'users' ? 'bg-black text-white' : 'bg-transparent text-black'}`}
          >
            USERS
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-8 py-3 font-bold rounded-lg border-2 border-black ${activeTab === 'members' ? 'bg-black text-white' : 'bg-transparent text-black'}`}
          >
            MEMBERS
          </button>
        </div>

        {/* Content: Users */}
        {activeTab === 'users' && (
          <div className="border-2 border-blackshadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden">
            <table className="w-full text-left bg-gray-300">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100">
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
                      <div className="w-10 h-10 border-2 border-black overflow-hidden bg-gray-100 flex-shrink-0">
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
        )}

        {/* Content: Members */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isMemberFormOpen ?
              <div>
                <form onSubmit={createMember} className="md:col-span-1 border-2 rounded-lg border-black p-6 bg-white absolute w-1/3 left-[40%] top-30 z-10">
                  <h2 className="text-xl font-black mb-6 uppercase">Add Member</h2>
                  <label htmlFor="">
                    Name
                  </label>
                  <input
                    className="w-full border-2 border-black p-2 rounded mb-4 focus:outline-none"
                    value={newMember.name}
                    onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  />
                  <label htmlFor="">Email</label>
                  <input
                    className="w-full border-2 border-black  p-2 rounded mb-6 focus:outline-none"
                    value={newMember.email}
                    onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                  />
                  <label htmlFor="">
                    Password
                  </label>
                  <input
                    className="w-full border-2 border-black  p-2 rounded  mb-6 focus:outline-none"
                    value={newMember.password}
                    onChange={e => setNewMember({ ...newMember, password: e.target.value })}
                  />
                  <div className='flex justify-around gap-2'>
                    <button className="bg-black w-[50%] text-white font-black p-3 hover:bg-gray-800 rounded-md">CREATE</button>
                    <button className='border w-[50%] rounded-md p-4 px-3 py-2 border-[black] bg-white' onClick={() => setIsMemberFormOpen(false)}>Close form</button>
                  </div>
                </form>

              </div>
              : <button onClick={() => setIsMemberFormOpen(true)} className='rounded-md bg-black text-white px-4 py-2 w-fit'>Add memebr</button>}

            <div className="border-2 border-blackshadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden">
              <table className="w-full text-left bg-gray-300">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-100">
                    <th className="p-4 font-black">NAME</th>
                    <th className="p-4 font-black">EMAIL</th>
                    <th className="p-4 font-black text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(u => (
                    <tr
                      key={u.id}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(u)}
                    >
                      <td className="p-4 font-medium flex items-center gap-4">
                        {/* Profile Pic Thumbnail */}
                        <div className="w-10 h-10 border-2 border-black overflow-hidden bg-gray-100 flex-shrink-0">
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
        )}
      </div>
      <h3 className='text-2xl my-3'>Live Traffic Updates</h3>
      <ApiLogChart logData={chartData}/>

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