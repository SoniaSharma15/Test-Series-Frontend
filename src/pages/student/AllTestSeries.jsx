import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import { Sparkles } from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import TestSeriesCard from "../../components/student/TestSeriesCard";
import toast from "react-hot-toast";
import Loader from "../../components/common/Loader";

export default function AllTestSeries() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ add this

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
            setLoading(true); // ✅ start loader
      const res = await axios.get("/test-series");
      setSeries(res.data);
    } catch (error) {
      console.error(error);
    }
    finally{
            setLoading(false); // ✅ stop loader
    }
  };
if(loading) return <Loader/>
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StudentSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-[1200px] mx-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-700">

          <div className="border-b border-slate-200 pb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-8 bg-blue-600 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Library
                </span>
              </div>

              <h1 className="my-6 md:my-0 text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Explore{" "}
                <span className="text-blue-600 italic">
                  Test Series
                </span>
                <Sparkles
                  className="text-blue-500 fill-blue-500/10"
                  size={24}
                />
              </h1>
            </div>
          </div>

          {/* Grid Section */}
          <section className="md:space-y-6">
            <div className="flex items-center gap-3 px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Showing {series.length} Results
              </h3>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {series?.map((item) => (
                <div key={item._id} className="w-full flex justify-center">
                  <div className="w-full max-w-full">
                    <TestSeriesCard series={item} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
