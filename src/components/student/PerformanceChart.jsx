import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function labelDate(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function PerformanceChart({ data = [] }) {
  const rows = Array.isArray(data) ? data : [];

  if (!rows.length) {
    return (
      <div className="h-full w-full flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 font-black text-sm">No chart data</p>
          <p className="text-slate-400 text-xs font-semibold mt-1">Attempts required to plot trend.</p>
        </div>
      </div>
    );
  }

const formatted = rows
  .map((x) => ({
    ...x,
    xLabel: labelDate(x.date),
    yVal: Number(x.score).toFixed(2) // keeps two decimal places
  }))
  .filter((x) => x.xLabel && Number.isFinite(Number(x.yVal)));
  return (
    <ResponsiveContainer>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="xLabel" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line type="monotone" dataKey="yVal" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
