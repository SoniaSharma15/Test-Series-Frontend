import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { 
  Home, BookOpen, FileText, User, Bell, 
  Search, ExternalLink, ChevronRight, LogOut 
} from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import Loader from "../../components/common/Loader";

export default function GovDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/student/dashboard");
      setData(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <main className="flex-1 overflow-y-auto h-screen">
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
        {/* 2. SUB-HEADER / BREADCRUMBS */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between ">
          <div>
            
            <h1 className="text-2xl font-bold text-slate-600  tracking-tight">
              Welcome, {user?.name}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs text-slate-400 font-bold">LAST LOGIN</p>
              <p className="text-xs text-slate-700">{new Date().toLocaleDateString('en-GB')}</p>
            </div>
           
          </div>
        </div>

        {/* 3. MAIN CONTENT AREA */}
        <div className="max-w-[1200px] mx-auto p-6 space-y-6">
          
          {/* ANNOUNCEMENT SCROLLER */}
          <div className="bg-white border-l-4 border-red-600 shadow-sm p-3 flex items-center gap-4">
            <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold rounded animate-pulse">LATEST</span>
            <marquee className="text-sm text-slate-700 font-medium">
              New UPSC Mock Test Series 2026 is now live. Please check the 'Active Batches' section for enrollment.
            </marquee>
          </div>

          {/* METRIC TILES (FLAT GOV STYLE) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GovStat label="Enrolled Courses" value={data?.enrolledSeries?.length || 0} color="bg-[#7AAACE]" />
            <GovStat label="Tests Attempted" value={data?.testsTakenCount || 0} color="bg-[#7AAACE]" />
            <GovStat label="Success Rate" value={`${Number(data?.avgAccuracy || 0).toFixed(0)}%`} color="bg-[#7AAACE]" />
            <GovStat label="Global Rank" value="#124" color="bg-[#7AAACE]" />
          </div>

         {/* DATA TABLES (RESPONSIVE) */}
<div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">

  <div className="bg-[#f8fafc] px-4 md:px-6 py-4 border-b border-slate-200 flex justify-between items-center">
    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm md:text-base">
      <BookOpen size={18} className="text-blue-700" />
      ACTIVE SCHEMES & BATCHES
    </h3>
  </div>

  {/* DESKTOP TABLE */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
          <th className="px-6 py-3 font-bold">Batch Name</th>
          <th className="px-6 py-3 font-bold">Progress</th>
          <th className="px-6 py-3 font-bold">Valid Upto</th>
          <th className="px-6 py-3 font-bold text-center">Action</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {data?.enrolledSeries?.map((series) => (
          <tr key={series._id} className="hover:bg-blue-50/50 transition-colors">

            <td className="px-6 py-4">
              <p className="font-bold text-slate-800">{series.title}</p>
              <p className="text-[10px] text-slate-400">
                ID: {series._id.substring(0, 8)}
              </p>
            </td>

            <td className="px-6 py-4">
              <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1">
                <div
                  className="bg-blue-600 h-full"
                  style={{ width: `${series.progress || 0}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                {series.progress || 0}% Complete
              </span>
            </td>

            <td className="px-6 py-4 text-xs font-medium text-slate-600">
              {series.expiryDate
                ? new Date(series.expiryDate).toLocaleDateString("en-GB")
                : "Lifetime"}
            </td>

            <td className="px-6 py-4 text-center">
              <button
                onClick={() =>
                  navigate(`/student/my-tests?series=${series._id}`)
                }
                className="text-blue-700 hover:text-blue-900 font-bold text-xs flex items-center gap-1 justify-center mx-auto uppercase"
              >
                Access <ExternalLink size={12} />
              </button>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* MOBILE CARD VIEW */}
  <div className="md:hidden p-4 space-y-4">
    {data?.enrolledSeries?.map((series) => (
      <div
        key={series._id}
        className="border rounded-xl p-4 shadow-sm bg-white"
      >
        <p className="font-bold text-slate-800 text-sm">
          {series.title}
        </p>

        <p className="text-[10px] text-slate-400 mb-2">
          ID: {series._id.substring(0, 8)}
        </p>

        <div className="mb-2">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full"
              style={{ width: `${series.progress || 0}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-500">
            {series.progress || 0}% Complete
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-3">
          Valid Upto:{" "}
          {series.expiryDate
            ? new Date(series.expiryDate).toLocaleDateString("en-GB")
            : "Lifetime"}
        </p>

        <button
          onClick={() =>
            navigate(`/student/my-tests?series=${series._id}`)
          }
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-[11px] font-bold uppercase"
        >
          Access Batch
        </button>
      </div>
    ))}
  </div>

</div>
        </div>
      </main>
    </div>
  );
}

/* ================= HELPERS ================= */

function GovStat({ label, value, color }) {
  return (
    <div className={`${color} p-5 rounded-sm shadow-sm flex flex-col justify-between h-28 text-white relative overflow-hidden group`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</p>
      <h4 className="text-3xl font-bold">{value}</h4>
      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
        <FileText size={80} />
      </div>
    </div>
  );
}