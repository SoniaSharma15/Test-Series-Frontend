import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import {
  Users,
  RefreshCw,
  ShieldCheck,
  User,
  Mail,
  CalendarDays,
  Circle,
  Phone,
  Search,
  FilterX
} from "lucide-react";

export default function AllUsersTable() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter logic whenever searchTerm or users list changes
  useEffect(() => {
    const filtered = users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.mobile?.includes(searchTerm)
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/user/all-users");
      const data = res.data.data || [];
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-3xl overflow-hidden col-span-1 lg:col-span-3 transition-all duration-500">
      {/* Premium Gradient Top Bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Header Section */}
      <div className="px-8 py-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                Users Management
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {filteredUsers.length} users found in the system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search name, email, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm w-full md:w-72 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none text-slate-700"
              />
            </div>

            <button
              onClick={fetchUsers}
              className="group bg-slate-900 text-white p-2.5 md:px-5 md:py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-indigo-300"
            >
              <RefreshCw
                size={16}
                className={`transition-transform duration-500 ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
              />
              <span className="hidden md:block">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-8 overflow-x-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="relative">
                <RefreshCw size={40} className="animate-spin text-indigo-500" />
                <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse"></div>
            </div>
            <p className="mt-4 font-bold text-slate-600">Syncing Database...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            {error}
          </div>
        )}

        {/* Table Content */}
        {!loading && filteredUsers.length > 0 && (
          <table className="min-w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-2 font-bold">User Details</th>
                <th className="px-4 py-2 font-bold">Contact</th>
                <th className="px-4 py-2 font-bold">Role</th>
                <th className="px-4 py-2 font-bold">Status</th>
                <th className="px-4 py-2 font-bold">Joined</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="group bg-white border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Name/ID */}
                  <td className="px-4 py-4 rounded-l-2xl border-y border-l border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-indigo-50 flex items-center justify-center border border-slate-200 group-hover:border-indigo-200 transition-colors">
                        <User size={18} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {user.name}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          #{user._id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email & Mobile */}
                  <td className="px-4 py-4 border-y border-slate-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail size={13} className="text-slate-400" />
                        <span className="text-xs">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={13} className="text-slate-400" />
                        <span className="text-xs">{user.mobile || "N/A"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-4 border-y border-slate-50">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-tight ${
                        user.role === "admin"
                          ? "bg-purple-50 text-purple-600 border border-purple-100"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}
                    >
                      <ShieldCheck size={12} />
                      {user.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 border-y border-slate-50">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold ${
                        user.isBlocked
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      <Circle size={6} fill="currentColor" className={user.isBlocked ? "" : "animate-pulse"} />
                      {user.isBlocked ? "Suspended" : "Active"}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-4 rounded-r-2xl border-y border-r border-slate-50 text-slate-500">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <CalendarDays size={14} className="text-slate-400" />
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Empty Search Result State */}
        {!loading && filteredUsers.length === 0 && users.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <FilterX size={48} className="mb-4 text-slate-300" />
            <p className="font-bold text-lg text-slate-600">No matches found</p>
            <p className="text-sm">Try adjusting your search terms.</p>
            <button 
                onClick={() => setSearchTerm("")}
                className="mt-4 text-indigo-600 font-semibold text-sm hover:underline"
            >
                Clear all filters
            </button>
          </div>
        )}

        {/* Truly Empty State */}
        {!loading && users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-lg">Database is empty</p>
            <p className="text-sm">New users will appear here automatically.</p>
          </div>
        )}
      </div>
    </section>
  );
}