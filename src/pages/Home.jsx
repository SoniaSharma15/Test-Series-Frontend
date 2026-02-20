import { useEffect, useState } from "react";
import axios from "../services/axiosInstance";
import TestSeriesCard from "../components/student/TestSeriesCard";
import Loader from "../components/common/Loader";

export default function Home() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ loading state

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/test-series");
      setSeries(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-20 px-6">
      <h1 className="text-3xl font-bold mb-10 text-center">
        Available Test Series
      </h1>

      {loading ? (
                  <Loader />
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {series?.map((item) => (
            <TestSeriesCard key={item._id} series={item} />
          ))}
        </div>
      )}
    </div>
  );
}