import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import UserModal from '../components/UserModal'; // 1. Import your Modal

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: ''});
  const [message, setMessage] = useState('');

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
    <div className="bg-green-500">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b-2 border-black pb-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="border-2 border-black px-6 py-2 font-bold hover:bg-black hover:text-white transition-all"
          >
            LOGOUT
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-8 py-3 font-bold border-2 border-black ${activeTab === 'users' ? 'bg-black text-white' : 'bg-transparent text-black'}`}
          >
            USERS
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-8 py-3 font-bold border-2 border-black ${activeTab === 'members' ? 'bg-black text-white' : 'bg-transparent text-black'}`}
          >
            MEMBERS
          </button>
        </div>

        {/* Content: Users */}
        {activeTab === 'users' && (
          <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full text-left">
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
            <form onSubmit={createMember} className="md:col-span-1 border-2 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black mb-6 uppercase">Add Member</h2>
              <input
                className="w-full border-2 border-black p-3 mb-4 focus:outline-none"
                placeholder="NAME"
                value={newMember.name}
                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
              />
              <input
                className="w-full border-2 border-black p-3 mb-6 focus:outline-none"
                placeholder="EMAIL"
                value={newMember.email}
                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
              />
              <input
                className="w-full border-2 border-black p-3 mb-6 focus:outline-none"
                placeholder="PASSWORD"
                value={newMember.password}
                onChange={e => setNewMember({ ...newMember, password: e.target.value })}
              />
              <button className="w-full bg-black text-white font-black p-3 hover:bg-gray-800">CREATE</button>
            </form>

            <div className="md:col-span-2 space-y-4">
              {members.map(m => (
                <div key={m.id} className="border-2 border-black p-4 bg-white flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div>
                    <p className="font-black text-lg uppercase">{m.name}</p>
                    <p className="text-sm font-bold text-gray-600 uppercase">{m.designation}</p>
                  </div>
                  <button onClick={() => deleteMember(m.id)} className="border-2 border-black p-2 hover:bg-black hover:text-white transition-all">
                    DELETE
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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