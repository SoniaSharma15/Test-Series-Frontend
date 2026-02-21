import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Zap, Globe, Calendar, Clock, ChevronRight,
  Sparkles, CheckCircle, Star, ShieldCheck
} from "lucide-react";

export default function TestSeriesCard({ series }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to continue 🔐");
      navigate("/login");
      return;
    }

    if (series.isEnrolled) {
      toast.success("You are already enrolled ✅");
      return;
    }

    if (processing) return; // prevent double click

    let loadingToast;

    try {
      setProcessing(true);

      if (!window.Razorpay) {
        toast.error("Payment gateway not loaded. Please refresh.");
        return;
      }

      loadingToast = toast.loading("Creating secure payment session...");

      const orderRes = await axios.post("/payment/create-order", {
        testSeriesId: series._id,
      });

      toast.dismiss(loadingToast);

      const { key, amount, orderId } = orderRes.data?.data || orderRes.data;

      const options = {
        key,
        amount,
        order_id: orderId,
        name: "Brilliant Bihar Test Series",
        description: series.title,

        handler: async function (response) {
          let verifyToast;
          try {
            verifyToast = toast.loading("Verifying payment securely...");

            const verifyRes = await axios.post("/payment/verify", {
              ...response,
              testSeriesId: series._id,
            });

            toast.dismiss(verifyToast);

            toast.success(
              verifyRes.data?.message || "Enrollment Successful 🎉"
            );

            navigate("/student/my-tests");

          } catch (err) {
            toast.dismiss(verifyToast);

            const message =
              err.response?.data?.message ||
              "Payment verification failed ❌";

            toast.error(message);
          }
        },

        modal: {
          ondismiss: function () {
            toast("Payment cancelled.");
          }
        },

        theme: {
          color: "#2563eb"
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        const message =
          response.error?.description ||
          "Payment failed ❌";

        toast.error(message);
      });

      rzp.open();

    } catch (error) {
      toast.dismiss(loadingToast);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Enrollment failed. Please try again ❌";

      toast.error(message);

    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-[345px] rounded-[2.5rem] bg-white border border-slate-200 hover:border-blue-500 hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.12)] transition-all duration-500 flex flex-col group mx-auto overflow-hidden">

      {/* Banner Area */}
      <div className="relative h-44 overflow-hidden shrink-0">
        {series.thumbnail ? (
          <img
            src={series.thumbnail}
            alt={series.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center p-6 text-center">
            <h2 className="text-white text-xl font-black tracking-tighter uppercase italic leading-tight">
              {series.title}
            </h2>
          </div>
        )}

        {/* Floating Metadata */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {series.discount > 0 && (
            <div className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest border border-blue-400">
              {series.discount}% OFF
            </div>
          )}
          <div className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 shadow-sm w-fit">
            <Star size={10} className="fill-blue-600 text-blue-600" /> 4.8
          </div>
        </div>

        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-blue-600 text-[8px] font-black px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
          <Sparkles size={10} /> LIMITED OFFER
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-6 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={14} className="text-blue-600" />
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] italic">Official Curriculum</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-3 group-hover:text-blue-600 transition-colors">
            {series.title}
          </h3>
          <p className="text-slate-400 text-xs font-bold leading-relaxed line-clamp-2 opacity-80">
            {series.description}
          </p>
        </div>

        {/* Technical Specs Well */}
        <div className="flex items-center justify-between px-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
          <div className="flex flex-col items-center gap-1">
            <Clock size={14} className="text-blue-600" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{series.duration} Days</span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex flex-col items-center gap-1">
            <Globe size={14} className="text-blue-600" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[50px]">{series.language}</span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex flex-col items-center gap-1">
            <Calendar size={14} className="text-blue-600" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
              {series.startDate ? new Date(series.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Ready'}
            </span>
          </div>
        </div>

        {/* Pricing Hub */}
        <div className="flex items-end justify-between mb-6 px-1">
          <div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Access Fee</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none">₹{series.price}</span>
              <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">+ GST</span>
            </div>
          </div>
          {series.originalPrice && (
            <span className="text-slate-300 line-through text-xs font-black italic mb-0.5">₹{series.originalPrice}</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-auto">
          <button
            onClick={() => navigate(`/student/test-series/${series._id}`)}
            className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95"
          >
            Details
          </button>

          <button
            onClick={handleEnroll}
            disabled={series.isEnrolled}
            className={`flex-[1.8] py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95 flex items-center justify-center gap-2
              ${series.isEnrolled
                ? "bg-emerald-500 text-white cursor-not-allowed shadow-none"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-[0_15px_30px_-5px_rgba(37,99,235,0.3)] group/btn"
              }`}
          >
            {series.isEnrolled ? (
              <><CheckCircle size={14} /> Already Enrolled</>
            ) : (
              <><Zap size={14} className="fill-white" /> Enroll Now</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}