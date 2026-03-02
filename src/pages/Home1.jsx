import { useEffect, useState } from "react";
import axios from "axios";
import {
  Zap, Globe, Calendar, Clock,
  Star, Info, X, CheckCircle, ChevronDown, ChevronRight
} from "lucide-react";


const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL

export default function TestSeriesCardImageStyle1() {
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeSeries, setActiveSeries] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch all test series
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/test-series`)
      .then(res => {
        setSeriesList(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);

  // Fetch individual details for popup
  const openDetails = async (id) => {
    setShowModal(true);
    setDetailsLoading(true);
    setActiveSeries(null); 
    try {
      const res = await axios.get(`${API_BASE_URL}/test-series/${id}`);
      setActiveSeries(res.data);
    } catch (err) {
      console.error("Details fetch failed", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEnroll = (link) => {
    window.location.href = link || "https://your-enrollment-link.com";
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 bg-slate-50 min-h-screen">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {seriesList.map(series => (
          <div key={series._id} className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img 
                src={series.thumbnail} 
                className="w-full h-full object-cover" 
                alt={series.title} 
              />
              
              <div className="absolute top-3 left-3 bg-white px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 shadow-sm border border-slate-100 uppercase">
                Foundation
              </div>

              <div className="absolute top-3 right-3 bg-slate-900/80 text-white px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold">
                <Star size={10} className="fill-yellow-400 text-yellow-400" /> 4.8
              </div>

              {series.discount > 0 && (
                <div className="absolute bottom-3 left-3 bg-[#4ade80] text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-tight">
                  {series.discount}% OFF
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-[17px] font-bold text-slate-800 mb-1 leading-tight line-clamp-1">
                {series.title}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">
                General Studies Sampoorna Course (GSSC)
              </p>
              
              <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2 mb-5">
                {series.description || "Structured syllabus coverage with mentorship for exam readiness."}
              </p>

              <div className="flex items-center gap-4 text-slate-600 mb-5 text-[11px] font-medium border-b border-slate-100 pb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} className="text-blue-500" />
                  <span>{series.duration} Mo</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} className="text-blue-500" />
                  <span>
                    {series.startDate ? new Date(series.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Ready'}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Globe size={14} className="text-blue-500" />
                  <span>{series.language || 'Hindi'}</span>
                </div>
              </div>

              <button 
                onClick={() => openDetails(series._id)}
                className="flex items-center justify-center gap-1 w-full py-2 text-[11px] font-bold text-blue-600 uppercase mb-5 hover:bg-slate-50 transition-colors"
              >
                Show Course Features <ChevronDown size={14} />
              </button>

              <div className="mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[26px] font-black text-slate-900">₹{series.price}</span>
                    {series.originalPrice && (
                      <span className="text-xs font-bold text-slate-300 line-through">₹{series.originalPrice}</span>
                    )}
                  </div>
                  <div className="bg-red-50 text-red-500 px-2 py-0.5 rounded text-[10px] font-black border border-red-100">
                    +18% GST
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => openDetails(series._id)}
                    className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-600 font-bold text-[11px] uppercase flex items-center justify-center gap-2 hover:bg-slate-50"
                  >
                    <Info size={14} /> Details
                  </button>
                  <button
                    onClick={() => handleEnroll(series.enrollLink)}
                    className="flex-[1.6] py-3 rounded-lg bg-blue-600 text-white font-bold text-[11px] uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
                  >
                    <Zap size={14} className="fill-white" /> Enroll
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all z-10"
            >
              <X size={20} />
            </button>

            {detailsLoading ? (
              <div className="p-24 flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Details</p>
              </div>
            ) : activeSeries && (
              <div className="max-h-[90vh] overflow-y-auto">
                <div className="bg-slate-900 text-white p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-black leading-tight mb-2 uppercase">{activeSeries.title}</h2>
                  <div className="flex gap-4 text-[11px] uppercase font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={14}/> {activeSeries.duration} Days</span>
                    <span className="flex items-center gap-1"><Globe size={14}/> {activeSeries.language}</span>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                  <div>
                    <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-wider mb-3">About This Course</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{activeSeries.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-wider mb-4">Course Features</h4>
                      <div className="space-y-3">
                        {activeSeries.features?.map((feature, idx) => (
                          <div key={idx} className="flex gap-3 text-sm text-slate-700 items-start">
                            <CheckCircle size={18} className="text-green-500 shrink-0" /> {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {activeSeries.subjects?.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-wider mb-4">Syllabus Coverage</h4>
                        <div className="flex gap-2 flex-wrap">
                          {activeSeries.subjects.map((sub, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded text-[11px] font-bold text-blue-600 uppercase tracking-tight">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Grand Total</span>
                        <div className="text-4xl font-black text-slate-900">₹{activeSeries.price}</div>
                    </div>
                    <button 
                      onClick={() => handleEnroll(activeSeries.enrollLink)}
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100"
                    >
                      Complete Enrollment <ChevronRight size={18}/>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}