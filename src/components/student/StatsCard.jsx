export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100">
      <p className="text-gray-500 text-sm font-medium mb-2">
        {title}
      </p>

      <h2 className="text-3xl font-bold text-gray-800">
        {value}
      </h2>
    </div>
  );
}
