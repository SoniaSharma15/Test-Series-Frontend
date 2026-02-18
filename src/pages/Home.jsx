import { useEffect, useState } from "react";
import axios from "../services/axiosInstance";
import TestSeriesCard from "../components/student/TestSeriesCard";

export default function Home() {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    const res = await axios.get("/test-series");
    setSeries(res.data);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <h1 className="text-3xl font-bold mb-10 text-center">
        Available Test Series
      </h1>

      {/* GRID FIX - prevents stretch */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {series?.map((item) => (
          <TestSeriesCard key={item._id} series={item} />
        ))}
      </div>
    </div>
  );
}
