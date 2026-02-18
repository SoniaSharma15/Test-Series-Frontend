import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import StudentSidebar from "../../components/student/StudentSidebar";
import { AuthContext } from "../../context/AuthContext";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Globe,
  Zap
} from "lucide-react";

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

  // 🔥 ENROLL LOGIC
  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (series.isEnrolled) {
      navigate("/student/my-tests");
      return;
    }

    try {
      setProcessing(true);

      const orderRes = await axios.post("/payment/create-order", {
        testSeriesId: series._id,
      });

      const options = {
        key: orderRes.data.key,
        amount: orderRes.data.amount,
        order_id: orderRes.data.orderId,
           name:"Brilliant Bihar Test Series",
          description: "Payment for Test Series",
        handler: async function (response) {
          await axios.post("/payment/verify", {
            ...response,
            testSeriesId: series._id,
          });

          navigate("/student/my-tests");
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Enrollment failed", error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!series)
    return (
      <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest">
        Series not found
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {user && <StudentSidebar />}

      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-6">

          {/* Navigation */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT CONTENT */}
            <div className="lg:col-span-8 space-y-6">

              {/* Hero Section */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                    Secure Module
                  </span>
                </div>

                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4 italic leading-tight">
                  {series.title}
                </h1>

                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                  {series.description}
                </p>

                <div className="flex flex-wrap gap-6 border-t border-slate-50 pt-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Clock size={16} className="text-blue-600" />
                    {series.duration} Days Access
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Globe size={16} className="text-blue-600" />
                    {series.language}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                  <Zap size={14} className="text-blue-600" /> Key Features
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {series.features?.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-blue-50 transition-all group"
                    >
                      <CheckCircle
                        size={16}
                        className="text-blue-600 mt-0.5 group-hover:scale-110 transition-transform"
                      />
                      <p className="text-slate-700 text-xs font-bold leading-relaxed">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subjects */}
              {series.subjects?.length > 0 && (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                    Subjects Covered
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {series.subjects.map((sub, index) => (
                      <span
                        key={index}
                        className="bg-blue-50/50 border border-blue-100 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT ACTION CARD */}
            <aside className="lg:col-span-4 sticky top-6 space-y-4">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg shadow-slate-100">

                <div className="mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Fee Structure
                  </p>

                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic">
                      ₹{series.price}
                    </h3>

                    {series.originalPrice && (
                      <span className="text-xs font-bold text-slate-300 line-through">
                        ₹{series.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={processing || series.isEnrolled}
                  className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95
                    ${
                      series.isEnrolled
                        ? "bg-emerald-500 text-white cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                    }`}
                >
                  {processing
                    ? "Processing..."
                    : series.isEnrolled
                    ? "Already Enrolled"
                    : "Enroll Series"}
                </button>

                <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-widest mt-4">
                  Tax inclusive and instant activation
                </p>
              </div>
            </aside>

          </div>
        </div>
      </main>
    </div>
  );
}
