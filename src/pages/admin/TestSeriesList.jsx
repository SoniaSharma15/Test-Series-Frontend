import { useEffect, useMemo, useRef, useState, useContext } from "react";
import axios from "../../services/axiosInstance";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Layers,
  MoreHorizontal,
  Tag,
  AlertCircle,
  ClipboardList,
  X,
  Globe,
  Home,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

function useDebounce(value, delay = 350) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

function formatMoney(n) {
  const num = Number(n || 0);
  return `₹${Number.isFinite(num) ? num.toLocaleString("en-IN") : "0"}`;
}

export default function TestSeriesList() {
  const hasFetched = useRef(false);
  const { user } = useContext(AuthContext) || {};
  const role = user?.role || localStorage.getItem("userRole") || "student";
  const canDelete = role === "admin";

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const q = useDebounce(query, 300);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const buttonRefs = useRef({});
  const menuRefs = useRef({});
  const itemRefs = useRef([]);
  const confirmCancelRef = useRef(null);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/test-series");
      const payload = res?.data;
      setSeries(Array.isArray(payload) ? payload : payload?.data || []);
    } catch (err) {
      setError("Failed to retrieve system test series records.");
      toast.error("Data Fetch Error ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onDocPointerDown = (e) => {
      if (!openMenuId) return;
      const btn = buttonRefs.current[openMenuId];
      const menu = menuRefs.current[openMenuId];
      if (btn && !btn.contains(e.target) && menu && !menu.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [openMenuId]);

  const filteredSeries = useMemo(() => {
    const qq = query.trim().toLowerCase();
    if (!qq) return series;
    return series.filter(x => 
      x.title?.toLowerCase().includes(qq) || x.description?.toLowerCase().includes(qq)
    );
  }, [series, query]);

  const getMenuActions = (item) => [
    { key: "manage", label: "Manage Modules", icon: ClipboardList, to: `/admin/tests?seriesId=${item._id}`, tone: "blue" },
    { key: "edit", label: "Edit Nomenclature", icon: Edit3, to: `/admin/test-series/edit/${item._id}`, tone: "blue" },
    { key: "delete", label: "Delete Archive", icon: Trash2, danger: true, show: canDelete },
  ].filter(a => a.show !== false);

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleteLoading(true);
      await axios.delete(`/test-series/${deleteTarget.id}`);
      toast.success("Record Deleted ✅");
      setConfirmOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Deletetion Failed ❌");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <AdminSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        {/* 1. TOP UTILITY BAR */}
        <div className="bg-[#1e3a8a] text-white px-6 py-2 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider sticky top-0 z-30">
          <span className="flex items-center gap-2"><Globe size={12}/> Official Product Inventory Console</span>
          <div className="flex gap-4">
            <span>Server Time: {new Date().toLocaleTimeString()}</span>
            <span className="text-emerald-400">● SECURE ACCESS</span>
          </div>
        </div>

        {/* 2. HEADER & BREADCRUMBS */}
        <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-6">
          <div className="max-w-[1400px] mx-auto">
            <nav className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-4">
              <Home size={12} />
              <ChevronRight size={10} />
              <span>Catalog</span>
              <ChevronRight size={10} />
              <span className="text-[#1e3a8a]">Test Series Ledger</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-tight">
                  Test Series <span className="text-[#1e3a8a]">Directory</span>
                </h1>
                <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-tighter">
                  Total Managed Records: {filteredSeries.length}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by Title..."
                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold outline-none focus:border-[#1e3a8a]"
                  />
                </div>
                <Link
                  to="/admin/test-series/create"
                  className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-900 transition-all shadow-md"
                >
                  <Plus size={16} /> Create New Series
                </Link>
                <button onClick={fetchData} className="p-2 border border-slate-300 rounded hover:bg-slate-100"><RefreshCcw size={16}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT */}
        <div className="max-w-[1400px] mx-auto p-6 md:p-10">
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
               <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2">
                 <Layers size={16} className="text-[#1e3a8a]" /> Master Inventory Table
               </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-white text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">S.No.</th>
                    <th className="px-6 py-4">Nomenclature / Description</th>
                    <th className="px-6 py-4">Base Pricing</th>
                    <th className="px-6 py-4">Rebate (%)</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="5" className="p-10 text-center animate-pulse text-xs font-bold text-slate-400">SYNCING REPOSITORY...</td></tr>
                  ) : filteredSeries.length === 0 ? (
                    <tr><td colSpan="5" className="p-10 text-center text-xs font-bold text-slate-400 uppercase">No matching records found.</td></tr>
                  ) : (
                    filteredSeries.map((item, index) => (
                      <tr key={item._id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-5 font-mono text-xs text-slate-400">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-800 uppercase tracking-tight group-hover:text-[#1e3a8a]">{item.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.description || "No official description provided."}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-black text-slate-900">{formatMoney(item.price)}</p>
                          {item.originalPrice > item.price && (
                            <p className="text-[10px] text-slate-400 line-through">₹{item.originalPrice}</p>
                          )}
                        </td>
                        <td className="px-6 py-5">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.discount > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                             {item.discount}% OFF
                           </span>
                        </td>
                        <td className="px-6 py-5 text-right relative">
                          <button
                            ref={el => buttonRefs.current[item._id] = el}
                            onClick={() => toggleMenu(item._id)}
                            className="p-2 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {openMenuId === item._id && (
                            <div 
                              ref={el => menuRefs.current[item._id] = el}
                              className="absolute right-6 top-12 z-50 w-48 bg-white border border-slate-200 rounded shadow-xl py-1 overflow-hidden"
                            >
                              {getMenuActions(item).map(action => (
                                action.to ? (
                                  <Link key={action.key} to={action.to} className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase text-slate-600 hover:bg-blue-50 hover:text-[#1e3a8a]">
                                    <action.icon size={14}/> {action.label}
                                  </Link>
                                ) : (
                                  <button 
                                    key={action.key} 
                                    onClick={() => { setDeleteTarget({id: item._id, title: item.title}); setConfirmOpen(true); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase text-red-600 hover:bg-red-50"
                                  >
                                    <action.icon size={14}/> {action.label}
                                  </button>
                                )
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        

        {/* DELETE MODAL */}
        {confirmOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded w-full max-w-md overflow-hidden">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest">Authorize Record Deletion</h3>
                <button onClick={() => setConfirmOpen(false)}><X size={16} className="text-slate-400"/></button>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  Are you sure you want to permanently remove <span className="text-slate-900 font-black">"{deleteTarget?.title}"</span> from the system archive?
                </p>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setConfirmOpen(false)} className="flex-1 py-2 rounded border border-slate-300 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">Cancel</button>
                  <button onClick={confirmDelete} disabled={deleteLoading} className="flex-1 py-2 bg-red-600 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-md">
                    {deleteLoading ? "SYNCING..." : "CONFIRM DELETE"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}