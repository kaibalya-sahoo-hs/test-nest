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
import { FaClockRotateLeft } from "react-icons/fa6";

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
  const BASE_URL = "";

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
      const res = await fetch(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");

      const allData = await res.json();

      setUsers(allData.filter((user) => user.role === "guest"));
      setMembers(allData.filter((user) => user.role === "member"));
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
                  40,689
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-purple-200 text-[#8280FF] w-fit text-xl flex-shrink-0">
                <LuUsers />
              </div>
            </div>
            <div className="flex text-sm mt-4 gap-1 items-center">
              <span className="text-[#00B69B] font-bold flex gap-1 items-center">
                <IoMdTrendingUp />
                <span>8.5%</span>{" "}
              </span>
              <span className="text-gray-400 font-medium">
                up from yesterday
              </span>
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
                  10,293
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#FFF3D6] text-[#FEC53D] w-fit text-xl flex-shrink-0">
                <GoPackage />
              </div>
            </div>
            <div className="flex text-sm mt-4 gap-1 items-center">
              <span className="text-[#00B69B] font-bold flex gap-1 items-center">
                <IoMdTrendingUp />
                <span>1.3%</span>{" "}
              </span>
              <span className="text-gray-400 font-medium">
                up from past week
              </span>
            </div>
          </div>

          {/* Total Sales */}
          <div className="rounded-xl p-5 sm:p-6 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-[#202224] font-semibold opacity-70">
                  Total Sales
                </span>
                <p className="text-xl sm:text-2xl font-bold text-[#202224]">
                  $89,000
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#D9F7E8] text-[#4AD991] w-fit text-xl flex-shrink-0">
                <AiOutlineStock />
              </div>
            </div>
            <div className="flex text-sm mt-4 gap-1 items-center">
              <span className="text-[#F93C65] font-bold flex gap-1 items-center">
                <IoMdTrendingDown />
                <span>4.3%</span>{" "}
              </span>
              <span className="text-gray-400 font-medium">
                down from yesterday
              </span>
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
                  2,040
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#FFDED1] text-[#FF9066] w-fit text-xl flex-shrink-0">
                <FaClockRotateLeft />
              </div>
            </div>
            <div className="flex text-sm mt-4 gap-1 items-center">
              <span className="text-[#00B69B] font-bold flex gap-1 items-center">
                <IoMdTrendingUp />
                <span>1.8%</span>{" "}
              </span>
              <span className="text-gray-400 font-medium">
                up from yesterday
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="overflow-x-auto">
          <div className="min-w-0">
            <Charts data={data} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-50 mt-6 sm:mt-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#202224]">
              Deals Details
            </h2>
            <select className="bg-gray-50 border border-gray-200 text-gray-400 text-xs rounded-lg px-2 py-1 outline-none">
              <option>October</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F1F4F9] text-[#202224]">
                  <th className="p-4 font-bold text-sm rounded-l-xl">
                    Product Name
                  </th>
                  <th className="p-4 font-bold text-sm">Location</th>
                  <th className="p-4 font-bold text-sm">Date - Time</th>
                  <th className="p-4 font-bold text-sm">Piece</th>
                  <th className="p-4 font-bold text-sm">Amount</th>
                  <th className="p-4 font-bold text-sm rounded-r-xl text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src="https://llounge.in/wp-content/uploads/2024/09/MC7J4ref_FV99_VW_34FRwatch-case-46-titanium-natural-cell-s10_VW_34FRwatch-face-46-titanium-natural-s10_VW_34FR.jfif-removebg-preview.webp"
                      className="w-8 h-8 rounded-md"
                      alt="Watch"
                    />
                    <span className="text-sm font-semibold text-[#202224]">
                      Apple Watch
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    6096 Marjory Landing
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    12.09.2026 - 12.53 PM
                  </td>
                  <td className="p-4 text-sm text-gray-600">423</td>
                  <td className="p-4 text-sm font-bold text-[#202224]">
                    $34,295
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-[#00B69B] text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase">
                      Delivered
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src="https://llounge.in/wp-content/uploads/2024/09/MC7J4ref_FV99_VW_34FRwatch-case-46-titanium-natural-cell-s10_VW_34FRwatch-face-46-titanium-natural-s10_VW_34FR.jfif-removebg-preview.webp"
                      className="w-8 h-8 rounded-md"
                      alt="Watch"
                    />
                    <span className="text-sm font-semibold text-[#202224]">
                      Apple Watch
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    6096 Marjory Landing
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    12.09.2026 - 12.53 PM
                  </td>
                  <td className="p-4 text-sm text-gray-600">423</td>
                  <td className="p-4 text-sm font-bold text-[#202224]">
                    $34,295
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-[#00B69B] text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase">
                      Delivered
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src="https://llounge.in/wp-content/uploads/2024/09/MC7J4ref_FV99_VW_34FRwatch-case-46-titanium-natural-cell-s10_VW_34FRwatch-face-46-titanium-natural-s10_VW_34FR.jfif-removebg-preview.webp"
                      className="w-8 h-8 rounded-md"
                      alt="Watch"
                    />
                    <span className="text-sm font-semibold text-[#202224]">
                      Apple Watch
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    6096 Marjory Landing
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    12.09.2026 - 12.53 PM
                  </td>
                  <td className="p-4 text-sm text-gray-600">423</td>
                  <td className="p-4 text-sm font-bold text-[#202224]">
                    $34,295
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-[#00B69B] text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase">
                      Delivered
                    </span>
                  </td>
                </tr>
                {/* Repeat for other rows */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
