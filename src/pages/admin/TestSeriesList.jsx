// src/pages/admin/TestSeriesList.jsx
import { useEffect, useMemo, useRef, useState, useContext } from "react";
import axios from "../../services/axiosInstance";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

/**
 * ✅ UI upgrades:
 * - Fully responsive (mobile-first)
 * - Mobile search always visible
 * - Card view on small screens, table on lg+
 * - Sticky action menu with keyboard support
 * - Better empty/loading states
 */

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
  const { user } = useContext(AuthContext) || {};
  const role = user?.role || localStorage.getItem("userRole") || "student";
  const canDelete = role === "admin";

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // search
  const [query, setQuery] = useState("");
  const q = useDebounce(query, 300);

  // dropdown menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // {id,title}
  const [deleteLoading, setDeleteLoading] = useState(false);

  // refs
  const buttonRefs = useRef({});
  const menuRefs = useRef({});
  const itemRefs = useRef([]);
  const confirmCancelRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/test-series");
      const payload = res?.data;
      setSeries(Array.isArray(payload) ? payload : payload?.data && Array.isArray(payload.data) ? payload.data : []);
    } catch {
      setError("Failed to load test series");
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!openMenuId) return;
      const btn = buttonRefs.current[openMenuId];
      const menu = menuRefs.current[openMenuId];
      const inside = (btn && btn.contains(e.target)) || (menu && menu.contains(e.target));
      if (!inside) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openMenuId]);

  // ✅ escape closes menu / modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (confirmOpen) setConfirmOpen(false);
      if (openMenuId) setOpenMenuId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openMenuId, confirmOpen]);

  const filteredSeries = useMemo(() => {
    const s = Array.isArray(series) ? series : [];
    const qq = String(q || "").trim().toLowerCase();
    if (!qq) return s;
    return s.filter((x) => {
      const title = String(x?.title || "").toLowerCase();
      const desc = String(x?.description || "").toLowerCase();
      return title.includes(qq) || desc.includes(qq);
    });
  }, [series, q]);

  const getMenuActions = (item) =>
    [
      {
        key: "manage-tests",
        label: "Manage Tests",
        icon: ClipboardList,
        to: `/admin/tests?seriesId=${item._id}`,
        tone: "indigo",
        show: true,
      },
      {
        key: "edit",
        label: "Edit Series",
        icon: Edit3,
        to: `/admin/test-series/edit/${item._id}`,
        tone: "blue",
        show: true,
      },
      {
        key: "delete",
        label: "Delete Series",
        icon: Trash2,
        danger: true,
        show: canDelete,
      },
    ].filter((a) => a.show);

  const openMenu = (id) => {
    setOpenMenuId(id);
    setActiveIndex(0);
    setTimeout(() => itemRefs.current?.[0]?.focus?.(), 0);
  };

  const closeMenu = () => {
    const id = openMenuId;
    setOpenMenuId(null);
    setActiveIndex(0);
    if (id && buttonRefs.current[id]) setTimeout(() => buttonRefs.current[id]?.focus?.(), 0);
  };

  const toggleMenu = (id) => {
    if (openMenuId === id) closeMenu();
    else openMenu(id);
  };

  const onMenuKeyDown = (e, actions, itemId) => {
    const max = actions.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = activeIndex >= max ? 0 : activeIndex + 1;
      setActiveIndex(next);
      itemRefs.current[next]?.focus?.();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = activeIndex <= 0 ? max : activeIndex - 1;
      setActiveIndex(prev);
      itemRefs.current[prev]?.focus?.();
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      itemRefs.current[0]?.focus?.();
    }
    if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(max);
      itemRefs.current[max]?.focus?.();
    }
    if (e.key === "Tab") closeMenu();
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const action = actions[activeIndex];
      if (!action) return;
      if (action.key === "delete") {
        closeMenu();
        openConfirm(itemId);
        return;
      }
      itemRefs.current[activeIndex]?.click?.();
    }
  };

  const openConfirm = (seriesId) => {
    const item = series.find((s) => s._id === seriesId);
    setDeleteTarget({ id: seriesId, title: item?.title || "this series" });
    setConfirmOpen(true);
    setTimeout(() => confirmCancelRef.current?.focus?.(), 0);
  };

  const closeConfirm = () => {
    if (deleteLoading) return;
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    if (!canDelete) return;

    setDeleteLoading(true);
    try {
      await axios.delete(`/test-series/${deleteTarget.id}`);
      setConfirmOpen(false);
      setDeleteTarget(null);
      await fetchData();
    } catch {
      alert("Delete failed");
      setConfirmOpen(false);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6 lg:mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.22em] mb-2">
                <Layers size={14} />
                <span>Product Management</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Test <span className="text-blue-600">Series</span>
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>
                  Role: <span className="font-bold text-slate-700">{role}</span>
                </span>
                {!canDelete && (
                  <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full">
                    Delete disabled
                  </span>
                )}
                <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full">
                  Total: {filteredSeries.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Search (always visible on all sizes) */}
              <div className="relative w-full sm:w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search series title/description…"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none shadow-sm"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Clear"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>

              <Link
                to="/admin/test-series/create"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] w-full sm:w-auto"
              >
                <Plus size={18} />
                Create New
              </Link>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 sm:p-20 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                  Fetching series…
                </p>
              </div>
            ) : filteredSeries.length === 0 ? (
              <div className="p-14 sm:p-20 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Layers className="text-slate-200" size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-900">No test series found</h3>
                <p className="text-slate-500 mt-2 text-sm">
                  Try a different keyword or create a new series.
                </p>
              </div>
            ) : (
              <>
                {/* ✅ Mobile / Tablet: Card view */}
                <div className="block lg:hidden">
                  <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredSeries?.map((item) => {
                      const actions = getMenuActions(item);

                      return (
                        <div
                          key={item._id}
                          className="group bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Layers size={18} />
                              </div>

                              <div className="min-w-0">
                                <p className="font-black text-slate-900 truncate">{item.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                  {item.description || "—"}
                                </p>
                              </div>
                            </div>

                            {/* Actions button */}
                            <div className="relative">
                              <button
                                ref={(el) => (buttonRefs.current[item._id] = el)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMenu(item._id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                                    e.preventDefault();
                                    openMenu(item._id);
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                aria-haspopup="menu"
                                aria-expanded={openMenuId === item._id}
                                aria-controls={`menu-${item._id}`}
                                title="More actions"
                              >
                                <MoreHorizontal size={18} />
                              </button>

                              {openMenuId === item._id && (
                                <div
                                  id={`menu-${item._id}`}
                                  ref={(el) => (menuRefs.current[item._id] = el)}
                                  role="menu"
                                  aria-label="Actions"
                                  className="absolute right-0 top-11 z-50 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                                  onKeyDown={(e) => onMenuKeyDown(e, actions, item._id)}
                                >
                                  {actions.map((a, idx) => {
                                    const Icon = a.icon;
                                    const base =
                                      "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500/30";

                                    if (a.key === "delete") {
                                      return (
                                        <button
                                          key={a.key}
                                          ref={(el) => (itemRefs.current[idx] = el)}
                                          role="menuitem"
                                          tabIndex={idx === 0 ? 0 : -1}
                                          onFocus={() => setActiveIndex(idx)}
                                          onClick={() => {
                                            closeMenu();
                                            openConfirm(item._id);
                                          }}
                                          className={`${base} text-red-600 hover:bg-red-50`}
                                        >
                                          <Icon size={16} />
                                          {a.label}
                                        </button>
                                      );
                                    }

                                    const tone =
                                      a.tone === "indigo"
                                        ? "hover:bg-indigo-50 hover:text-indigo-700 text-slate-700"
                                        : "hover:bg-blue-50 hover:text-blue-700 text-slate-700";

                                    return (
                                      <Link
                                        key={a.key}
                                        ref={(el) => (itemRefs.current[idx] = el)}
                                        role="menuitem"
                                        tabIndex={idx === 0 ? 0 : -1}
                                        onFocus={() => setActiveIndex(idx)}
                                        onClick={() => closeMenu()}
                                        to={a.to}
                                        className={`${base} ${tone}`}
                                      >
                                        <Icon size={16} />
                                        {a.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Price
                              </p>
                              <p className="text-sm font-black text-slate-900 mt-1">{formatMoney(item.price)}</p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Discount
                              </p>
                              <span
                                className={`mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                                  Number(item.discount || 0) > 0
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : "bg-white text-slate-500 border border-slate-200"
                                }`}
                              >
                                <Tag size={12} />
                                {Number(item.discount || 0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ✅ Desktop: Table view */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50/50">
                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          Title
                        </th>
                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          Pricing
                        </th>
                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          Discount
                        </th>
                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                      {filteredSeries?.map((item) => {
                        const actions = getMenuActions(item);
                        return (
                          <tr key={item._id} className="group hover:bg-blue-50/30 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                  <Layers size={18} />
                                </div>
                                <div className="min-w-0">
                                  <span className="block font-black text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                                    {item.title}
                                  </span>
                                  <span className="block text-xs text-slate-400 truncate max-w-[540px]">
                                    {item.description || "—"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-8 py-5">
                              <div className="font-black text-slate-900">
                                {formatMoney(item.price)}
                                {Number(item.originalPrice || 0) > Number(item.price || 0) ? (
                                  <span className="ml-2 text-xs text-slate-400 line-through font-bold">
                                    {formatMoney(item.originalPrice)}
                                  </span>
                                ) : null}
                              </div>
                            </td>

                            <td className="px-8 py-5">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                                  Number(item.discount || 0) > 0
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : "bg-slate-50 text-slate-400 border border-slate-200"
                                }`}
                              >
                                <Tag size={12} />
                                {Number(item.discount || 0)}%
                              </span>
                            </td>

                            <td className="px-8 py-5 text-right relative">
                              <button
                                ref={(el) => (buttonRefs.current[item._id] = el)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMenu(item._id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                                    e.preventDefault();
                                    openMenu(item._id);
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                aria-haspopup="menu"
                                aria-expanded={openMenuId === item._id}
                                aria-controls={`menu-${item._id}`}
                                title="More actions"
                              >
                                <MoreHorizontal size={18} />
                              </button>

                              {openMenuId === item._id && (
                                <div
                                  id={`menu-${item._id}`}
                                  ref={(el) => (menuRefs.current[item._id] = el)}
                                  role="menu"
                                  aria-label="Actions"
                                  className="absolute right-8 top-14 z-50 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                                  onKeyDown={(e) => onMenuKeyDown(e, actions, item._id)}
                                >
                                  {actions.map((a, idx) => {
                                    const Icon = a.icon;
                                    const base =
                                      "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500/30";

                                    if (a.key === "delete") {
                                      return (
                                        <button
                                          key={a.key}
                                          ref={(el) => (itemRefs.current[idx] = el)}
                                          role="menuitem"
                                          tabIndex={idx === 0 ? 0 : -1}
                                          onFocus={() => setActiveIndex(idx)}
                                          onClick={() => {
                                            closeMenu();
                                            openConfirm(item._id);
                                          }}
                                          className={`${base} text-red-600 hover:bg-red-50`}
                                        >
                                          <Icon size={16} />
                                          {a.label}
                                        </button>
                                      );
                                    }

                                    const tone =
                                      a.tone === "indigo"
                                        ? "hover:bg-indigo-50 hover:text-indigo-700 text-slate-700"
                                        : "hover:bg-blue-50 hover:text-blue-700 text-slate-700";

                                    return (
                                      <Link
                                        key={a.key}
                                        ref={(el) => (itemRefs.current[idx] = el)}
                                        role="menuitem"
                                        tabIndex={idx === 0 ? 0 : -1}
                                        onFocus={() => setActiveIndex(idx)}
                                        onClick={() => closeMenu()}
                                        to={a.to}
                                        className={`${base} ${tone}`}
                                      >
                                        <Icon size={16} />
                                        {a.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/30 text-[11px] font-black uppercase tracking-widest text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>Total Items: {filteredSeries.length}</span>
                  <span className="text-emerald-600">Product Status: All Live</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Confirm Modal */}
        {confirmOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeConfirm();
            }}
          >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 id="confirm-title" className="text-lg font-black text-slate-900">
                  Confirm Delete
                </h3>
                <button onClick={closeConfirm} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500" aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <div className="px-5 py-5">
                <p className="text-sm text-slate-600">
                  Are you sure you want to delete{" "}
                  <span className="font-black text-slate-900">{deleteTarget?.title}</span>? This action cannot be undone.
                </p>

                {!canDelete && (
                  <p className="mt-3 text-xs font-bold text-red-600">
                    You don't have permission to delete.
                  </p>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    ref={confirmCancelRef}
                    onClick={closeConfirm}
                    disabled={deleteLoading}
                    className="rounded-xl px-4 py-2.5 font-black text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmDelete}
                    disabled={!canDelete || deleteLoading}
                    className="rounded-xl px-4 py-2.5 font-black text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>

                <p className="mt-3 text-[11px] text-slate-400">
                  Tip: Press <span className="font-black">Esc</span> to close.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
