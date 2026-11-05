import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import StudentSidebar from "../../components/student/StudentSidebar";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  ArrowLeft, Clock, AlertCircle, Globe, Zap, Users, 
  Calendar, ShieldCheck, Tag, BookOpen, HelpCircle, 
  FileText, Star, Award, CheckCircle2, Home
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
  }, [id]);

  const fetchSeries = async () => {
    try {
      const res = await axios.get(`/test-series/${id}`);
      setSeries(res.data);
    } catch (err) {
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to continue 🔐");
      navigate("/login");
      return;
    }
    if (series?.isEnrolled) {
      navigate("/student/my-tests");
      return;
    }
    if (processing) return;

    try {
      setProcessing(true);
      if (Number(series?.price) === 0) {
        await axios.post("/payment/free-enroll", { testSeriesId: series._id });
        toast.success("Free enrollment successful 🎉");
        navigate("/student/my-tests");
        return;
      }

      if (!window.Razorpay) {
        toast.error("Payment gateway not loaded.");
        return;
      }
      const loadingToast = toast.loading("Initializing secure payment...");
      const orderRes = await axios.post("/payment/create-order", { testSeriesId: series._id });
      toast.dismiss(loadingToast);

      const { key, amount, orderId } = orderRes.data?.data || orderRes.data;

      const options = {
        key,
        amount,
        order_id: orderId,
        name: "Test Series Portal",
        description: series.title,
        handler: async function (response) {
          const verifyToast = toast.loading("Verifying transaction...");
          try {
            await axios.post("/payment/verify", { ...response, testSeriesId: series._id });
            toast.dismiss(verifyToast);
            toast.success("Enrollment Successful 🎉");
            navigate("/student/my-tests");
          } catch (err) {
            toast.dismiss(verifyToast);
            toast.error("Verification failed ❌");
          }
        },
        theme: { color: "#1e3a8a" }
      };
      new window.Razorpay(options).open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Enrollment failed.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {user && <StudentSidebar />}

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

        {/* BREADCRUMBS & NAVIGATION */}
        <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-4">
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#1e3a8a] text-xs font-bold hover:underline"
          >
            <ArrowLeft size={14} /> RETURN TO CATALOG
          </button>
        </div>

        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: INFORMATION DENSITY */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* MAIN SCHEME INFO */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="p-8">
                   <div className="flex items-center gap-3 mb-4">
                     <span className="bg-blue-50 text-[#1e3a8a] text-[10px] font-bold px-3 py-1 rounded border border-blue-100 uppercase">
                       Examination Batch 2026-27
                     </span>
                     {series.isEnrolled && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded border border-emerald-100 flex items-center gap-1 uppercase">
                          <CheckCircle2 size={12} /> Verified Enrolment
                        </span>
                     )}
                   </div>
                   
                   <h1 className="text-3xl font-bold text-slate-800 mb-4 uppercase tracking-tight">
                     {series.title}
                   </h1>
                   
                   <p className="text-slate-600 text-sm leading-relaxed mb-8 border-l-4 border-slate-200 pl-4 italic">
                     {series.description}
                   </p>

                   {/* META SPECS TABLE */}
                   <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-100 rounded bg-slate-50">
                     <GovMeta label="DURATION" value={`${series.duration} Days`} />
                     <GovMeta label="LANGUAGE" value={series.language} />
                     <GovMeta label="TEST COUNT" value="25 Full Length" />
                     <GovMeta label="VALIDITY" value="12 Months" />
                   </div>
                </div>
              </div>

              {/* CURRICULUM & FEATURES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 uppercase">
                    <BookOpen size={16} className="text-[#1e3a8a]" /> Course Deliverables
                  </h3>
                  <ul className="space-y-3">
                    {series.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-slate-700 font-medium">
                        <CheckCircle2 size={14} className="text-emerald-600 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-800 p-6 rounded text-white shadow-md">
                   <h3 className="text-sm font-bold border-b border-white/10 pb-3 mb-4 flex items-center gap-2 uppercase">
                    <ShieldCheck size={16} className="text-blue-400" /> Administrative Notice
                  </h3>
                  <div className="space-y-4">
                    <SpecRow label="EXAM MODE" value="Online Computer Based" />
                    <SpecRow label="NEG. MARKING" value="0.25 (One-Fourth)" />
                    <SpecRow label="ACCESSIBILITY" value="Multi-Device Support" />
                  </div>
                </div>
              </div>

              {/* OFFICIAL FAQ SECTION */}
              <div className="bg-white border border-slate-200 rounded overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase">
                    <HelpCircle size={18} className="text-[#1e3a8a]" /> Frequent Queries (Candidate Support)
                  </h3>
                </div>
                <div className="p-6 space-y-1">
  <GovFAQ 
    q="Are the UPSC and BPSC test series designed as per the latest exam pattern and syllabus?"
    a="Yes, all test series are strictly prepared according to the latest UPSC and BPSC syllabus, including recent pattern changes, current affairs integration, and updated weightage of subjects."
  />

  

  <GovFAQ 
  q="Can I reattempt the mock tests and track my performance over time?"
  a="No, reattempts are not allowed to maintain real exam discipline. However, you can view detailed performance analysis including rank, subject-wise scores, accuracy reports, and progress trends on your dashboard."
/>

  <GovFAQ 
    q="Does the test series include both Prelims and Mains practice?"
    a="Yes, the program covers Prelims objective mock tests along with Mains answer writing practice, evaluated by experts with feedback."
  />

  <GovFAQ 
    q="Are current affairs questions updated regularly?"
    a="Yes, current affairs sections are updated weekly based on national, international, economic, and Bihar-specific developments relevant to UPSC and BPSC."
  />
</div>
              </div>
            </div>

            {/* RIGHT COLUMN: FEE & ACTION */}
            <aside className="lg:col-span-4 sticky top-6 space-y-6">
              <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ENROLMENT FEE</span>
                  <Tag size={18} className="text-slate-300" />
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">₹{series.price}</span>
                    {series.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">₹{series.originalPrice}</span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-emerald-600 mt-1">
                    {Number(series.price) === 0 ? "FREE ENROLLMENT" : "INC. OF ALL APPLICABLE GOVT. TAXES"}
                  </p>
                </div>

                <div className="space-y-4 mb-8 bg-slate-50 p-4 rounded border border-slate-100">
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                    <ShieldCheck className="text-[#1e3a8a]" size={16} />
                    {Number(series.price) === 0 ? "NO PAYMENT REQUIRED" : "SECURE PAYMENT GATEWAY"}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                    <Users className="text-[#1e3a8a]" size={16} /> 5,000+ TOTAL CANDIDATES
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={processing || series.isEnrolled}
                  className={`w-full py-4 rounded font-bold text-xs uppercase tracking-widest transition-all
                    ${series.isEnrolled
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-[#1e3a8a] text-white hover:bg-blue-900 shadow-lg shadow-blue-100"
                    }`}
                >
                  {processing ? "PROCESSING..." : series.isEnrolled ? "ENROLLED" : Number(series.price) === 0 ? "ENROLL FOR FREE" : "CONFIRM ENROLMENT"}
                </button>
              </div>

              {/* VERIFICATION BADGE */}
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded flex items-center gap-4">
                 <div className="bg-emerald-600 text-white p-2 rounded">
                    <Award size={24} />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-emerald-800 uppercase leading-none mb-1">Board Certified</p>
                   <p className="text-[10px] text-emerald-700 leading-tight">Authentic test patterns verified by domain experts.</p>
                 </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

/* OFFICIAL UI HELPERS */

function GovMeta({ label, value }) {
  return (
    <div className="p-4 border-r border-slate-100 last:border-r-0 text-center">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{value}</p>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0">
      <span className="text-[10px] text-slate-400 font-bold">{label}</span>
      <span className="text-[10px] font-bold text-blue-200">{value}</span>
    </div>
  );
}

function GovFAQ({ q, a }) {
  return (
    <details className="group border-b border-slate-100 last:border-0">
      <summary className="flex items-center justify-between cursor-pointer py-4 list-none">
        <span className="text-xs font-bold text-slate-700 hover:text-[#1e3a8a] transition-colors uppercase tracking-tight">{q}</span>
        <ChevronRight size={14} className="text-slate-400 group-open:rotate-90 transition-transform" />
      </summary>
      <div className="pb-4 pl-4 border-l-2 border-[#1e3a8a] ml-1">
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{a}</p>
      </div>
    </details>
  );
}

function ChevronRight({ size, className }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>;
}