import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import { 
  Sparkles, 
  Home, 
  ChevronRight, 
  Search, 
  Filter, 
  Grid2X2, 
  List,
  Info
} from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import TestSeriesCard from "../../components/student/TestSeriesCard";
import Loader from "../../components/common/Loader";

export default function AllTestSeries() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/test-series");
      setSeries(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <StudentSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        {/* 1. TOP UTILITY BAR (VERY GOV STYLE) */}
<div className="sticky top-0 z-5 bg-[#355872] text-white px-6 py-6 flex justify-between items-center text-[11px] font-medium">
  <div className="flex gap-4">
    <span className="hover:underline cursor-pointer"></span>
    <span className="hover:underline cursor-pointer"></span>
  </div>
  <div className="flex gap-4 items-center">
    <span>
      Standard Time: {new Date().toLocaleTimeString()}
    </span>
   
  </div>
</div>

        {/* 2. BREADCRUMBS & TITLE */}
        <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-6">
          <div className="max-w-[1200px] mx-auto">
           

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight uppercase">
                  Examination <span className="text-[#1e3a8a]">Catalogue</span>
                </h1>
                <p className="text-slate-500 text-xs font-medium mt-1">
                  Browse and enroll in Our  Test Series and Programs.
                </p>
              </div>

             
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT */}
        <div className="max-w-[1200px] mx-auto p-6 md:p-10 space-y-8">
          
         

         

          {/* GRID SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {series?.map((item) => (
              <div key={item._id} className="flex justify-center transition-transform hover:-translate-y-1">
                <TestSeriesCard series={item} />
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}