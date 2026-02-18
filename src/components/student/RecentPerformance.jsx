export default function RecentPerformance({ lastScore }) {
  const percentage = lastScore ?? 0;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg font-medium mb-2">
        Last Test Score
      </h3>

      <div className="text-4xl font-bold">
        {percentage}%
      </div>

      <p className="text-sm mt-2 opacity-80">
        Keep improving! 🚀
      </p>
    </div>
  );
}
