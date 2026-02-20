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
  Receipt
} from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import Loader from "../../components/common/Loader";

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
      setData(res.data || []);
    } catch (err) {
      setError("Unable to sync transaction records.");
    } finally {
      setLoading(false);
    }
  };
if(loading){
  return <Loader></Loader>
}
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return { 
          style: "bg-emerald-50 text-emerald-600 border-emerald-100", 
          icon: <CheckCircle2 size={12} />,
          label: "SUCCESS"
        };
      case "failed":
        return { 
          style: "bg-red-50 text-red-600 border-red-100", 
          icon: <XCircle size={12} />,
          label: "FAILED"
        };
      case "pending":
        return { 
          style: "bg-amber-50 text-amber-600 border-amber-100", 
          icon: <Clock size={12} />,
          label: "PROCESSING"
        };
      default:
        return { 
          style: "bg-slate-50 text-slate-600 border-slate-100", 
          icon: <AlertCircle size={12} />,
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
      link.download = `receipt-${paymentId}.pdf`;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StudentSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar font-sans">
        <div className="max-w-[1200px] mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
          
          {/* HEADER CONSOLE */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em]">
                <History size={14} />
                <span>Transaction Log</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">
                Purchase <span className="text-blue-600">History</span>
              </h1>
            </div>
            
            <div className="hidden md:flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
               <Receipt className="text-blue-600" size={20} />
               <div className="text-right leading-none">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Logs</p>
                  <p className="text-sm font-black text-slate-900 italic mt-1">{data.length} Records</p>
               </div>
            </div>
          </header>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl animate-shake">
              <AlertCircle size={18} />
              <p className="font-black text-[10px] uppercase tracking-widest">{error}</p>
            </div>
          )}

          {/* MAIN LEDGER TABLE */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
            {loading ? (
              <div className="p-12 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : data.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4 border border-slate-100">
                   <CreditCard size={32} />
                </div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">No Transaction Nodes Detected</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Module / Identification</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Value</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Invoices</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.map((item) => {
                      const status = getStatusConfig(item.status);
                      return (
                        <tr key={item.paymentId} className="group hover:bg-blue-50/30 transition-all duration-300">
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900 italic tracking-tight group-hover:text-blue-600 transition-colors">
                                {item.courseName || "Test Series Module"}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase opacity-60">
                                TXID: {item.transactionId || item.paymentId}
                              </span>
                            </div>
                          </td>

                          <td className="px-8 py-5">
                            <span className="text-sm font-black text-slate-900 tracking-tighter italic">
                              ₹{item.amount}
                            </span>
                          </td>

                          <td className="px-8 py-5">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black tracking-widest ${status.style}`}>
                              {status.icon}
                              {status.label}
                            </div>
                          </td>

                          <td className="px-8 py-5">
                            <div className="flex flex-col leading-none">
                               <span className="text-[11px] font-black text-slate-500 uppercase">{new Date(item.date).toLocaleDateString()}</span>
                               <span className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">Authorized</span>
                            </div>
                          </td>

                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => handleDownload(item.paymentId)}
                              className="p-3 bg-slate-50 text-slate-400 hover:text-white hover:bg-blue-600 rounded-xl transition-all shadow-sm border border-slate-100 group-hover:scale-110 active:scale-95"
                              title="Download Receipt"
                            >
                              <Download size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SYSTEM FOOTER */}
          <footer className="flex items-center justify-between px-2 pt-2 opacity-50">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                Secure SSL Encrypted Ledger
             </p>
             <div className="flex gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600" />
                <div className="h-1 w-1 rounded-full bg-blue-300" />
             </div>
          </footer>

        </div>
      </main>
    </div>
  );
}