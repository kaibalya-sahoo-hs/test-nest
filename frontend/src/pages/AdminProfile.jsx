import React from 'react'
import { FiMail, FiShield, FiUser } from 'react-icons/fi'

function AdminProfile() {
    const userData = localStorage.getItem('user')
    const user = userData ? JSON.parse(userData) : null
  return (
    <div className="bg-[#F5F6FA] min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-[#202224] mb-8">Admin Profile</h1>

      <div className="">
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Cover Header */}
          <div className="h-32 bg-gradient-to-r from-[#4379EE] to-[#5E8FFF]"></div>

          <div className="px-8 pb-10">
            {/* Profile Header Section */}
            <div className="relative flex items-end gap-6 -mt-12 mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-[#F1F4F9] shadow-md flex items-center justify-center">
                  {user.profile ? (
                    <img src={user.profile} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-[#4379EE]">{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              <div className="pb-2">
                <h2 className="text-2xl font-bold text-[#202224]">{user.name}</h2>
                <p className="text-gray-400 font-medium flex items-center gap-2 capitalize">
                  <FiShield className="text-[#4379EE]" /> {user.role || 'Member'}
                </p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
              
              {/* Left Column: Details */}
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Full Name</label>
                  <div className="flex items-center gap-3 bg-[#F5F6FA] p-4 rounded-xl text-[#202224] font-semibold">
                    <FiUser className="text-gray-400" />
                    <span>{user.name}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Email Address</label>
                  <div className="flex items-center gap-3 bg-[#F5F6FA] p-4 rounded-xl text-[#202224] font-semibold">
                    <FiMail className="text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Meta Info */}
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Account ID</label>
                  <div className="p-4 rounded-xl border border-dashed border-gray-200 text-gray-500 font-mono font-medium">
                    #0000{user.id}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Role</label>
                  <div className="p-4 rounded-xl border border-dashed border-gray-200 text-gray-500 font-mono font-medium">
                    {user.role}
                  </div>
                </div>
              </div>
              
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProfile