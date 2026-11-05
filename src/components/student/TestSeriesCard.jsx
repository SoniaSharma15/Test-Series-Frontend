import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Zap, Globe, Calendar, Clock, ChevronDown,
  CheckCircle, Star
} from "lucide-react";

export default function TestSeriesCard({ series }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  // Constants to match image branding
  const rating = 4.8;

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to continue 🔐");
      navigate("/login");
      return;
    }
    if (series.isEnrolled || processing) return;

    try {
      setProcessing(true);
      if (Number(series.price) === 0) {
        await axios.post("/payment/free-enroll", { testSeriesId: series._id });
        toast.success("Free enrollment successful 🎉");
        navigate("/student/my-tests");
        return;
      }

      if (!window.Razorpay) {
        toast.error("Payment gateway not loaded.");
        return;
      }

      const loadingToast = toast.loading("Connecting...");
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
          try {
            await axios.post("/payment/verify", { ...response, testSeriesId: series._id });
            toast.success("Enrollment Successful 🎉");
            navigate("/student/my-tests");
          } catch (err) {
            toast.error("Verification failed");
          }
        },
        theme: { color: "#2563eb" }
      };

      new window.Razorpay(options).open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to initiate enrollment.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-[360px] sm:max-w-[340px] md:max-w-[360px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 mx-auto h-full">
      
      {/* 1. Thumbnail / Banner */}
      <div className="relative h-48 sm:h-44 md:h-48 shrink-0 overflow-hidden bg-slate-100">
        <img
          src={series.thumbnail || "https://via.placeholder.com/400x250"}
          alt={series.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {/* Category Badge (Top Left) */}
        <div className="absolute top-3 left-3 bg-white/95 px-2 py-1 rounded shadow-sm border border-slate-100">
          <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tighter">
            {series.category || "Test Series"}
          </span>
        </div>

        {/* Rating Badge (Top Right) */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded flex items-center gap-1 text-[11px] font-bold">
          <Star size={10} className="fill-yellow-400 text-yellow-400" /> {rating}
        </div>

        {/* Discount Ribbon (Bottom Left) */}
        {series.discount > 0 && (
          <div className="absolute bottom-4 left-0 bg-[#00d084] text-white text-[10px] font-bold px-3 py-1 uppercase shadow-md">
            {series.discount}% OFF
          </div>
        )}
      </div>

      {/* 2. Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Title and "New" Badge */}
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="text-[17px] font-bold text-slate-800 leading-tight line-clamp-2 min-h-[42px]">
            {series.title}
          </h3>
          <span className="bg-red-50 text-red-500 text-[9px] font-black px-1.5 py-0.5 rounded border border-red-100 shrink-0">
            NEW
          </span>
        </div>

        {/* Subtitle / Category */}
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">
          {series.subCategory || "GENERAL STUDIES (GS) + CSAT"}
        </p>

        {/* Description */}
        <p className="text-slate-600 text-[13px] leading-relaxed line-clamp-2 mb-4 h-10">
          {series.description}
        </p>

        {/* 3. Metadata Row (Responsive horizontal list) */}
        <div className="flex items-center gap-2 sm:gap-3 text-slate-600 mb-5 py-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock size={15} className="text-blue-600" />
            <span className="text-xs font-semibold">{series.duration || "12 Mo"} Days</span>
          </div>
          <div className="w-[1px] h-3 bg-slate-300 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar size={15} className="text-blue-600" />
            <span className="text-xs font-semibold">
              {series.startDate ? new Date(series.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "10 Mar 2026"}
            </span>
          </div>
          <div className="w-[1px] h-3 bg-slate-300 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <Globe size={15} className="text-blue-600" />
            <span className="text-xs font-semibold">{series.language || "Hindi/English"}</span>
          </div>
        </div>

    
        {/* 5. Footer (Price & Actions) */}
        <div className="mt-auto pt-4 border-t border-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">₹{series.price}</span>
              {series.originalPrice && (
                <span className="text-sm text-slate-400 line-through">₹{series.originalPrice}</span>
              )}
            </div>
            {Number(series.price) > 0 && (
              <div className="bg-red-50 text-red-600 text-[9px] font-bold px-2 py-1 rounded border border-red-100">
                + 18% GST
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate(`/student/test-series/${series._id}`)}
              className="py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-all active:scale-95"
            >
              Details
            </button>
            <button
              onClick={handleEnroll}
              disabled={series.isEnrolled || processing}
              className={`py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2
                ${series.isEnrolled 
                  ? "bg-emerald-500 text-white cursor-not-allowed shadow-none" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                }`}
            >
              {series.isEnrolled ? (
                <><CheckCircle size={14} /> Enrolled</>
              ) : (
                <><Zap size={14} className="fill-current" /> {Number(series.price) === 0 ? "Enroll Free" : "Enroll Now"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}