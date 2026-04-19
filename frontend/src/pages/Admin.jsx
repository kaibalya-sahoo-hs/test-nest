import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import UserModal from "../components/UserModal"; // 1. Import your Modal
import "../AdminTable.css";
import { LuUsers } from "react-icons/lu";
import { IoMdTrendingDown, IoMdTrendingUp } from "react-icons/io";
import Charts from "../components/Charts";
import { GoPackage } from "react-icons/go";
import { AiOutlineStock } from "react-icons/ai";
import { FaClockRotateLeft, FaIndianRupeeSign, FaRupeeSign } from "react-icons/fa6";
import {api} from "../utils/api"

const Admin = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    usersCount: 0,
    ordersCount: 0,
    totalSales: 0,
    totalPendingOrders: 0
  });

  const data = [
    { name: "1k", uv: 2000, pv: 2400, amt: 2400 },
    { name: "3k", uv: 2500, pv: 2600, amt: 2100 },
    { name: "5k", uv: 2100, pv: 2200, amt: 2200 },
    { name: "7k", uv: 2800, pv: 3100, amt: 2300 },
    { name: "9k", uv: 3200, pv: 3500, amt: 2400 },
    { name: "11k", uv: 4500, pv: 4200, amt: 2100 },
    { name: "13k", uv: 3800, pv: 3900, amt: 2500 },
    { name: "15k", uv: 4200, pv: 4800, amt: 2200 },
    { name: "17k", uv: 3000, pv: 3200, amt: 2000 },
    { name: "19k", uv: 3500, pv: 3700, amt: 2100 },
    { name: "21k", uv: 4000, pv: 4100, amt: 2300 },
    { name: "23k", uv: 4800, pv: 5000, amt: 2400 },
    { name: "25k", uv: 8500, pv: 8200, amt: 2500 }, // The high peak spike
    { name: "27k", uv: 3600, pv: 3800, amt: 2100 },
    { name: "29k", uv: 4400, pv: 4600, amt: 2200 },
    { name: "31k", uv: 5200, pv: 5400, amt: 2300 },
    { name: "33k", uv: 5000, pv: 5100, amt: 2400 },
    { name: "35k", uv: 4700, pv: 4900, amt: 2500 },
    { name: "37k", uv: 4200, pv: 4400, amt: 2100 },
    { name: "39k", uv: 5500, pv: 5800, amt: 2200 },
    { name: "41k", uv: 6200, pv: 6400, amt: 2300 },
    { name: "43k", uv: 2200, pv: 2400, amt: 2400 },
    { name: "45k", uv: 3100, pv: 3300, amt: 2500 },
    { name: "47k", uv: 3400, pv: 3200, amt: 2100 },
    { name: "49k", uv: 2800, pv: 3000, amt: 2200 },
    { name: "51k", uv: 4800, pv: 5000, amt: 2300 },
    { name: "53k", uv: 4500, pv: 4700, amt: 2400 },
    { name: "55k", uv: 5800, pv: 6000, amt: 2500 },
    { name: "57k", uv: 6500, pv: 6700, amt: 2100 },
    { name: "60k", uv: 6000, pv: 6200, amt: 2200 },
  ];

  // 2. State for Modal and Selected User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();

  // --- Auth & Logout ---
  const handleLogout = () => {
    toast.success("Loggedout successfuly");
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // --- API Calls ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const {data} = await api.get(`/admin/dashboard` );
      console.log(data)
      setDashboardData(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    if (!user || user.role !== "admin") {
      navigate("/login");
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
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${BASE_URL}/admin/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== id));
      toast.success("User removed");
    }
  };

  const createMember = async (e) => {
    e.preventDefault();
    if (
      newMember.email == "" ||
      newMember.name == "" ||
      newMember.password == ""
    ) {
      toast.error("Fileds cannot be empty");
    } else {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/admin/member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMember),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers([...members, data]);
        setNewMember({ name: "", email: "", password: "" });
        toast.success("Member created");
      }
    }
  };

  const deleteMember = async (id) => {
    if (!window.confirm("Delete Member?")) return;
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${BASE_URL}/admin/members/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMembers(members.filter((m) => m.id !== id));
      toast.success("Member deleted");
    }
  };

  const updateUser = async (id, newName, newId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/admin/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: id, // The original ID to find the user
          updatedCredentials: {
            name: newName,
            id: newId, // The new ID if you are changing it
          },
        }),
      });

      const data = await response.json();
      console.log(data);
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
    <div className="bg-[#F5F6FA] h-fit">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Dashboard</h1>
          </div>
        </div>

        {/* Stat Cards — responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {/* Total Users */}
          <div className="rounded-xl p-5 sm:p-6 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">
                  Total Users
                </span>
                <p className="text-xl sm:text-2xl font-bold text-[#202224]">
                  {dashboardData.usersCount?.toLocaleString()}
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-purple-200 text-[#8280FF] w-fit text-xl flex-shrink-0">
                <LuUsers />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="rounded-xl p-5 sm:p-6 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">
                  Total Orders
                </span>
                <p className="text-xl sm:text-2xl font-bold text-[#202224]">
                  {dashboardData.ordersCount?.toLocaleString()}
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#FFF3D6] text-[#FEC53D] w-fit text-xl flex-shrink-0">
                <GoPackage />
              </div>
            </div>
          </div>

          {/* Total Sales */}
          <div className="rounded-xl p-5 sm:p-6 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">
                  Total Sales
                </span>
                <div className=" sm:text-2xl font-bold text-[#202224] flex items-center gap-1 text-sm">
                  <FaIndianRupeeSign size={20}/><div>{dashboardData.totalSales}</div>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#D9F7E8] text-[#4AD991] w-fit text-xl flex-shrink-0">
                <AiOutlineStock />
              </div>
            </div>
          </div>

          {/* Total Pending */}
          <div className="rounded-xl p-5 sm:p-6 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">
                  Total Pending
                </span>
                <p className="text-xl sm:text-2xl font-bold text-[#202224]">
                  {dashboardData.totalPendingOrders?.toLocaleString()}
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#FFDED1] text-[#FF9066] w-fit text-xl flex-shrink-0">
                <FaClockRotateLeft />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="overflow-x-auto">
          <div className="min-w-0">
            <Charts data={data} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
