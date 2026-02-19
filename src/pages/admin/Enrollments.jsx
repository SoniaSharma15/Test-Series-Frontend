import { useEffect, useMemo, useState } from "react";
import { getEnrollments } from "../../services/enrollmentService";
import {
  Users,
  CheckCircle2,
  RefreshCcw,
  IndianRupee,
  Search,
  Filter,
  Calendar,
  BadgeCheck,
  BadgeDollarSign,
  X,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import toast from "react-hot-toast";
import EnrollmentTable from "../../components/admin/EnrollmentTable";

function useDebounce(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Enrollments() {
  const [data, setData] = useState([]);
  const [revenue, setRevenue] = useState(0);

  // stats (from backend)
  const [statsByStatus, setStatsByStatus] = useState([]);
  const [statsBySource, setStatsBySource] = useState([]);

  // filters
  const [statusFilter, setStatusFilter] = useState("all"); // all|active|cancelled|refunded
  const [sourceFilter, setSourceFilter] = useState("all"); // all|admin|payment
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 450);

  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getEnrollments({
        status: statusFilter,
        source: sourceFilter,
        search: debouncedSearch,
        startDate,
        endDate,
        // ✅ expired removed
      });

      const payload = res?.data;

      setData(Array.isArray(payload?.enrollments) ? payload.enrollments : []);
      setRevenue(Number(payload?.totalRevenue || 0));

      const s = payload?.stats || {};
      setStatsByStatus(Array.isArray(s?.byStatus) ? s.byStatus : []);
      setStatsBySource(Array.isArray(s?.bySource) ? s.bySource : []);
    } catch (error) {
      console.error("Failed to fetch enrollments", error);
      toast.error("Failed to fetch enrollments");
      setData([]);
      setRevenue(0);
      setStatsByStatus([]);
      setStatsBySource([]);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sourceFilter, debouncedSearch, startDate, endDate]);

  const getStatusCount = (status) =>
    statsByStatus.find((s) => s._id === status)?.count || 0;

  const getSourceCount = (source) =>
    statsBySource.find((s) => s._id === source)?.count || 0;

  const total = useMemo(
    () => getStatusCount("active") + getStatusCount("cancelled") + getStatusCount("refunded"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statsByStatus]
  );

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-100",
      cancelled: "bg-red-50 text-red-700 border-red-100",
      refunded: "bg-amber-50 text-amber-700 border-amber-100",
    };
    return styles[status] || "bg-slate-50 text-slate-600 border-slate-100";
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setSourceFilter("all");
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  // ✅ Clickable stat cards (apply filters)
  const onCardClick = (kind) => {
    if (kind === "total") {
      clearAllFilters();
      return;
    }
    if (kind === "active") {
      setStatusFilter("active");
      return;
    }
    if (kind === "admin") {
      setSourceFilter("admin");
      return;
    }
    if (kind === "payment") {
      setSourceFilter("payment");
      return;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Enrollment <span className="text-blue-600">Ledger</span>
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Monitor enrollments, source & date based performance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                title="Refresh"
              >
                <RefreshCcw size={20} />
              </button>
              <div className="h-10 w-px bg-slate-200 mx-2" />
              <div className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 cursor-default">
                <IndianRupee size={16} />
                <span>Revenue: {revenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid (clickable) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            <StatSmallCard
              label="Total Enrollments"
              value={total}
              icon={<Users size={20} />}
              color="blue"
              onClick={() => onCardClick("total")}
              active={statusFilter === "all" && sourceFilter === "all"}
            />
            <StatSmallCard
              label="Active"
              value={getStatusCount("active")}
              icon={<CheckCircle2 size={20} />}
              color="emerald"
              onClick={() => onCardClick("active")}
              active={statusFilter === "active"}
            />
            <StatSmallCard
              label="Admin Enrollments"
              value={getSourceCount("admin")}
              icon={<BadgeCheck size={20} />}
              color="blue"
              onClick={() => onCardClick("admin")}
              active={sourceFilter === "admin"}
            />
            <StatSmallCard
              label="Payment Enrollments"
              value={getSourceCount("payment")}
              icon={<BadgeDollarSign size={20} />}
              color="amber"
              onClick={() => onCardClick("payment")}
              active={sourceFilter === "payment"}
            />
          </div>

          {/* Filters & Table Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
            {/* Filter Bar */}
            <div className="px-6 sm:px-8 py-6 border-b border-slate-50 flex flex-col gap-4 bg-slate-50/30">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by student name/email or series title..."
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 ring-blue-500/20 outline-none transition-all"
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {/* Source (admin/payment) */}
                <div className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-slate-400" />
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="all">All Sources</option>
                    <option value="admin">Admin</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>

                {/* Clear all */}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50"
                >
                  Clear All
                </button>
              </div>

              {/* Date range */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Calendar size={16} className="text-slate-400" />
                  Date Range
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">From</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">To</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  {(startDate || endDate) ? (
                    <button
                      type="button"
                      onClick={clearDates}
                      className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-xs hover:bg-slate-50"
                    >
                      Clear Dates
                    </button>
                  ) : null}
                </div>

                <div className="text-xs font-semibold text-slate-400">
                  Filters auto-apply
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="p-4 sm:p-6">
              <EnrollmentTable
                enrollments={data}
                getStatusBadge={getStatusBadge}
              />
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-5 bg-slate-50/30 border-t border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
              <span>Total Records: {data.length}</span>
              <div className="flex items-center gap-3">
                <Calendar size={14} className="text-slate-300" />
                <span>Latest first</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Stats Card (clickable)
function StatSmallCard({ label, value, icon, color, onClick, active, danger }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative overflow-hidden text-left transition-all duration-200",
        "bg-white/70 backdrop-blur-xl border border-slate-200/60",
        "shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)]",
        "rounded-2xl p-3 sm:rounded-3xl sm:p-6 sm:hover:-translate-y-1",
        active ? "ring-2 ring-blue-500/30 border-blue-300" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={[
              "shrink-0 flex items-center justify-center text-white shadow-md",
              "h-9 w-9 rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl",
              `bg-gradient-to-br ${colors[color]}`,
            ].join(" ")}
          >
            <span className="scale-[0.85] sm:scale-100">{icon}</span>
          </div>

          <div className="min-w-0">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-tight sm:text-[11px]">
              {label}
            </p>
            <h3
              className={[
                "mt-1 font-extrabold tracking-tight leading-none",
                "text-2xl sm:text-3xl",
                danger ? "text-red-600" : "text-slate-900",
              ].join(" ")}
            >
              {value}
            </h3>
          </div>
        </div>

        {active ? (
          <span
            className="
              hidden sm:inline-flex
              absolute top-3 right-3
              text-[10px] font-black uppercase tracking-widest
              text-blue-600 bg-blue-50
              border border-blue-100
              px-2 py-1 rounded-full
              z-10
            "
          >
            Active Filter
          </span>
        ) : null}
      </div>

      {active ? (
        <div className="mt-2 sm:hidden">
          <span className="inline-flex text-[9px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full">
            Active
          </span>
        </div>
      ) : null}

      <div
        className={[
          "absolute bottom-0 left-0 w-full opacity-70",
          "h-0.5 sm:h-1",
          `bg-gradient-to-r ${colors[color]}`,
        ].join(" ")}
      />
    </button>
  );
}
