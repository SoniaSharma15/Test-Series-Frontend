import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import { Link } from "react-router-dom";
import {
  BookOpen,
  PlayCircle,
  Trophy,
  Layers,
  ArrowRight,
  Info
} from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";

export default function MyTests() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyTests();
  }, []);

  const fetchMyTests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/enrollments/my");
      setData(res.data || []);
    } catch (err) {
      setError("Failed to load your tests");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StudentSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">

          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <BookOpen size={14} />
              <span>Enrolled Content</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              My Learning <span className="text-blue-600">Library</span>
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3">
              <Info size={18} />
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && data.length === 0 && (
            <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200/60 shadow-sm text-center">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Layers className="text-blue-300" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                No active enrollments
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">
                You haven't enrolled in any test series yet. Start your journey by exploring our available courses.
              </p>
              <Link
                to="/student/test-series"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Browse Test Series <ArrowRight size={18} />
              </Link>
            </div>
          )}

          {/* Test Series Sections */}
          <div className="space-y-12">
            {data.map((seriesItem) => (
              <section key={seriesItem.testSeries._id} className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-1.5 bg-blue-600 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {seriesItem.testSeries.title}
                  </h2>
                  <span className="bg-white border border-slate-200 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    {seriesItem.tests.length} Modules
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {seriesItem.tests.map((testItem) => (
                    <div
                      key={testItem.test._id}
                      className="group bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <PlayCircle size={24} />
                          </div>
                          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 shadow-inner">
                            <Trophy size={14} />
                            <span className="text-xs font-black uppercase tracking-tighter">
                              Best: {testItem.bestScore ?? 0}%
                            </span>
                          </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {testItem.test.name}
                        </h3>

                        <p className="text-slate-400 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">
                          Ready to practice? This module contains high-quality questions to sharpen your skills.
                        </p>
                      </div>

                      {testItem.alreadyAttempted ? (
                        <button
                          disabled
                          className="w-full py-3.5 bg-gray-100 text-gray-400 rounded-2xl font-bold text-sm cursor-not-allowed border border-gray-200"
                        >
                          Already Attempted
                        </button>
                      ) : (
                        <Link
                          to={`/student/attempt/${testItem.test._id}`}
                          className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98] shadow-inner border border-slate-100 hover:border-blue-500"
                        >
                          Attempt Module <ArrowRight size={16} />
                        </Link>
                      )}

                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
