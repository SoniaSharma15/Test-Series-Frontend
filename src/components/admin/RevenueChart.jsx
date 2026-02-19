import { TrendingUp } from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function RevenueChart({ revenue, dailyRevenue = [] }) {
  const normalized = Array.isArray(dailyRevenue)
    ? dailyRevenue.map((d) => ({
        _id: d?._id || d?.date || "",
        total: Number(d?.total || 0),
      }))
    : [];

  if (!normalized.length) {
    return (
      <div className="bg-white rounded-xl p-6 border border-blue-100 text-center text-slate-400">
        No revenue data available
      </div>
    );
  }

  const max = Math.max(1, ...normalized.map((d) => d.total));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-blue-800 flex items-center gap-2">
          <TrendingUp size={16} />
          Revenue (Last 7 Days)
        </h3>
        <span className="text-blue-600 font-bold">
          ₹ {Number(revenue || 0).toLocaleString("en-IN")}
        </span>
      </div>

      {/* GRAPH */}
      <div className="flex items-end gap-4">
        {normalized.map((d, i) => {
          const heightPercent = Math.max(8, Math.round((d.total / max) * 100));

          return (
            <div key={d._id || i} className="flex flex-col items-center gap-2">
              {/* ✅ FIXED HEIGHT WRAPPER */}
              <div className="h-24 flex items-end">
                <div
                  title={`₹${d.total} on ${formatDate(d._id)}`}
                  className="w-6 rounded bg-blue-500/80 hover:bg-blue-600 transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* DATE */}
              <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                {formatDate(d._id)}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 mt-4">Day-wise revenue</p>
    </div>
  );
}
