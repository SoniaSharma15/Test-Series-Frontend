import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import {
  CreditCard,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  Receipt,
  Home,
  ChevronRight,
  FileText,
  ShieldCheck,
  IndianRupee,
  ReceiptIndianRupee
} from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

export default function PurchaseHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/payment/history");
      const payments = Array.isArray(res.data) 
        ? res.data 
        : res.data?.payments || res.data?.data || [];
      setData(payments);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to sync transaction records.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return {
          style: "bg-emerald-600 text-white",
         
          label: "SUCCESSFUL"
        };
      case "failed":
        return {
          style: "bg-red-600 text-white",
          icon: <XCircle size={10} />,
          label: "FAILED"
        };
      case "pending":
        return {
          style: "bg-amber-500 text-white",
          icon: <Clock size={10} />,
          label: "PROCESSING"
        };
      default:
        return {
          style: "bg-slate-500 text-white",
          icon: <AlertCircle size={10} />,
          label: status?.toUpperCase()
        };
    }
  };

  const handleDownload = async (paymentId) => {
    try {
      const response = await axios.get(`/payment/receipt/${paymentId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Receipt-${paymentId}.pdf`;
      link.click();
      toast.success("Official receipt downloaded ✅");
    } catch (error) {
      toast.error("Receipt generation failed.");
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

        {/* BREADCRUMBS & HEADER */}
        <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-5">
          
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
              Detailed <span className="text-[#1e3a8a]">Transaction History</span>
            </h1>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded flex items-center gap-3">
               <ReceiptIndianRupee size={16} className="text-blue-800" />
               <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Total Transactions: {data.length}</span>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto p-6 md:p-8 space-y-6">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* IMPORTANT NOTICE */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded flex gap-4 items-start">
            <FileText className="text-blue-800 shrink-0" size={20} />
            <div className="space-y-1">
              <p className="text-[11px] text-blue-900 font-bold uppercase tracking-tight">Financial Records Note:</p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Receipts are generated only for successful transactions. If your payment was deducted but shows as "FAILED" or "PROCESSING," please allow 24-48 hours for the gateway to reconcile with our servers.
              </p>
            </div>
          </div>

          {/* MAIN LEDGER TABLE */}
<div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">

  {data.length === 0 ? (
    <div className="p-20 text-center flex flex-col items-center">
      <CreditCard size={48} className="text-slate-200 mb-4" />
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
        No Electronic Payment Records Found
      </h3>
    </div>
  ) : (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
              <th className="px-6 py-4">S.No.</th>
              <th className="px-6 py-4">Examination / Item Name</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4 text-center">Receipt</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((item, index) => {
              const status = getStatusConfig(item.status);
              return (
                <tr
                  key={item.paymentId}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-5 text-xs font-mono text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </td>

                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-800 uppercase">
                      {item.courseName || "Educational Module"}
                    </span>
                    <p className="text-[9px] font-mono text-slate-400 mt-1">
                      REF: {item.transactionId || item.paymentId}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <span className="text-sm font-bold">₹{item.amount}</span>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold ${status.style}`}>
                      {status.icon} {status.label}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-xs text-slate-600">
                    {new Date(item.date).toLocaleString("en-GB")}
                  </td>

                  <td className="px-6 py-5 text-center">
                    {item.courseName ? (
                      <button
                        onClick={() => handleDownload(item.paymentId)}
                        className="text-[#1e3a8a] hover:text-blue-900 text-[10px] font-bold uppercase border-b"
                      >
                        Get Receipt
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-bold">NA</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden space-y-4 p-4">
        {data.map((item, index) => {
          const status = getStatusConfig(item.status);

          return (
            <div
              key={item.paymentId}
              className="border rounded-xl p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between mb-1">
                <p className="text-xs font-mono text-slate-400">
                  #{String(index + 1).padStart(2, "0")}
                </p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${status.style}`}>
                  {status.label}
                </span>
              </div>

              <p className="font-bold text-sm text-slate-800 uppercase">
                {item.courseName || "Educational Module"}
              </p>

              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                REF: {item.transactionId || item.paymentId}
              </p>

              <div className="flex justify-between items-center mt-3">
                <span className="text-sm font-bold">₹{item.amount}</span>
                <span className="text-xs text-slate-600">
                  {new Date(item.date).toLocaleString("en-GB")}
                </span>
              </div>

              {item.courseName && (
                <button
                  onClick={() => handleDownload(item.paymentId)}
                  className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase"
                >
                  Download Receipt
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  )}
</div>
          
          <div className="text-center pb-10">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] italic">
              Automated Digital Financial Ledger • Brilliant Bihar Official Portal
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}