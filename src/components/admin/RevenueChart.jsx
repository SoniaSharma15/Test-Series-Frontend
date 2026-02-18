import { TrendingUp } from "lucide-react";

export default function RevenueChart({ revenue }) {
  const bars = [40, 70, 55, 90, 65];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-blue-800">Total Revenue</h3>
        <span className="text-blue-600 font-bold">
          ₹ {Number(revenue || 0).toLocaleString("en-IN")}
        </span>
      </div>

      <div className="flex items-end gap-2 h-20">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-4 rounded bg-blue-500/80"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-3">
        Monthly growth overview
      </p>
    </div>
  );
}
