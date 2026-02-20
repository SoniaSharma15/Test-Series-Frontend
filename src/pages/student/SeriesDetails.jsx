import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import StudentSidebar from "../../components/student/StudentSidebar";
import { AuthContext } from "../../context/AuthContext";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  Globe,
  Zap,
  Users,
  Calendar,
  ShieldCheck,
  Tag,
  TrendingUp,
  BookOpen,
  HelpCircle,
  FileText,
  Star,
  Award
} from "lucide-react";
import Loader from "../../components/common/Loader";

export default function TestSeriesDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await axios.get(`/test-series/${id}`);
      setSeries(res.data);
    } catch (err) {
      console.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) { navigate("/login"); return; }
    if (series.isEnrolled) { navigate("/student/my-tests"); return; }
    // ... (Your existing Razorpay logic remains the same)
  };

  if (loading) return (
   <Loader/>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {user && <StudentSidebar />}

      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar pb-24 md:pb-10">
        {/* HERO SECTION WITH BACKGROUND OVERLAY */}
        <div className="relative h-[300px] w-full bg-slate-900 overflow-hidden">
          <img
            src={series.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070"}
            className="w-full h-full object-cover opacity-90 scale-105"
            alt="bg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent" />

          <div className="absolute top-10 left-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white hover:text-slate-900 transition-all"
            >
              <ArrowLeft size={14} /> Back to Catalog
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 -mt-32 relative z-10 space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT CONTENT */}
            <div className="lg:col-span-8 space-y-8">

              {/* Main Title Card */}
              <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    Official Series
                  </span>
                  <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Best Seller
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-6">
                  {series.title}
                </h1>

                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl mb-8">
                  {series.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-100">
                  <DetailItem icon={<Clock className="text-blue-600" />} label="Duration" value={`${series.duration} Days`} />
                  <DetailItem icon={<Globe className="text-emerald-600" />} label="Mode" value={series.language} />
                  <DetailItem icon={<FileText className="text-purple-600" />} label="Tests" value="25+ Mock Tests" />
                  <DetailItem icon={<Award className="text-amber-600" />} label="Certificate" value="Included" />
                </div>
              </div>

              {/* FEATURES (DYNAMIC) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-6 flex items-center gap-2">
                    <Zap size={16} /> Course Features
                  </h3>
                  <ul className="space-y-4">
                    {series.features?.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                        <div className="h-2 w-2 rounded-full bg-blue-600" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* STATIC DATA: EXAM PATTERN */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Exam Pattern</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-xs text-slate-400">Question Type</span>
                      <span className="text-xs font-bold">MCQ (Multiple Choice)</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-xs text-slate-400">Negative Marking</span>
                      <span className="text-xs font-bold text-rose-400">0.25 Marks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Difficulty Level</span>
                      <span className="text-xs font-bold text-emerald-400">Exam Standard</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STATIC DATA: FAQ SECTION */}
              <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-8">
                  Performance & Attempt FAQs
                </h3>

                <div className="space-y-6">
                  <FAQItem
                    q="How is my performance score calculated?"
                    a="Your score is calculated based on total marks obtained divided by total marks of the test. Negative marking is applied wherever applicable."
                  />

                  <FAQItem
                    q="Does attempting a test affect my analytics?"
                    a="Yes. Each completed attempt is recorded separately and reflected in your growth chart, accuracy rate, and overall performance metrics."
                  />

                  <FAQItem
                    q="What does 'Latest Session' represent?"
                    a="It displays your most recent completed or auto-submitted test including the batch name and examination details."
                  />

                  <FAQItem
                    q="How is average accuracy calculated?"
                    a="Average accuracy represents the mean percentage score across all your completed attempts in this test series."
                  />
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="lg:col-span-4 sticky top-6 space-y-6">

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-rose-100 text-rose-600 p-2 rounded-xl">
                    <Tag size={20} />
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Course Fee</p>
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter italic">₹{series.price}</span>
                    {series.originalPrice && (
                      <div className="flex flex-col leading-none">
                        <span className="text-sm font-bold text-slate-300 line-through tracking-tighter italic">₹{series.originalPrice}</span>
                        <span className="text-[10px] font-black text-emerald-500 uppercase">{series.discount}% OFF</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                    <ShieldCheck className="text-blue-600" size={18} /> Instant Content Unlock
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                    {/* <Users className="text-blue-600" size={18} /> {series.totalEnrollments}+ Students joined */}
                    <Users className="text-blue-600" size={18} /> 500+ Students joined
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={processing || series.isEnrolled}
                  className={`w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95
                    ${series.isEnrolled
                      ? "bg-emerald-500 text-white cursor-default"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"}`}
                >
                  {processing ? "Processing..." : series.isEnrolled ? "Already Enrolled" : "Get Instant Access"}
                </button>

                <p className="text-center text-[9px] font-bold text-slate-400 mt-6">
                  • Secure Payment
                </p>
              </div>

              {/* STATIC DATA: TRUST BADGE */}
{/* --- SECTION: WHY THIS SERIES? (Feature Comparison) --- */}
<div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 text-white shadow-2xl overflow-hidden relative">
  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-[80px]" />
  
  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-8">What makes us better?</h3>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="space-y-3">
      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
        <AlertCircle size={20} className="text-blue-400" />
      </div>
      <h5 className="text-sm font-black italic tracking-tight">Updated Content</h5>
      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Updated as per Feb 2026 exam changes and latest Bihar budget data.</p>
    </div>

    <div className="space-y-3">
      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
        <Award size={20} className="text-emerald-400" />
      </div>
      <h5 className="text-sm font-black italic tracking-tight">Expert Solutions</h5>
      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Video hints for tough Maths & Reasoning questions included.</p>
    </div>

    <div className="space-y-3">
      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
        <Zap size={20} className="text-amber-400" />
      </div>
      <h5 className="text-sm font-black italic tracking-tight">Offline Access</h5>
      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Downloadable PDF for revision even without internet.</p>
    </div>
  </div>
</div>
            </aside>
          </div>
        </div>

        {/* MOBILE STICKY ENROLL BUTTON */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-slate-200 z-[50] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Total Fee</p>
            <p className="text-xl font-black text-slate-900 leading-none italic">₹{series.price}</p>
          </div>
          <button
            onClick={handleEnroll}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
          >
            Enroll Now
          </button>
        </div>
      </main>
    </div>
  );
}

/* SUB-COMPONENTS */

function DetailItem({ icon, label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">{label}</span>
      </div>
      <p className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">{value}</p>
    </div>
  );
}

function FAQItem({ q, a }) {
  return (
    <div className="group border-b border-slate-100 pb-4">

      {/* Question Row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
        <span className="text-sm font-black text-slate-900">
          {q}
        </span>
      </div>

      {/* Answer */}
      <p className="text-xs font-medium text-slate-500 leading-relaxed ml-4 italic">
        {a}
      </p>

    </div>
  );
}
