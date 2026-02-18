import { TrendingUp } from "lucide-react";

export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100">

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
          <TrendingUp size={18} />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900">
        {value}
      </h2>

    </div>
  );
}
