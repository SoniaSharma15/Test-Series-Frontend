import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import StudentSidebar from "../../components/student/StudentSidebar";
import toast from "react-hot-toast";
import { 
  ShieldCheck, AlertCircle, FileText, CheckSquare, 
  Monitor, Info, Home, ChevronRight, Clock, BookOpen 
} from "lucide-react";
import Loader from "../../components/common/Loader";

export default function AttemptInstruction() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState("");
  const integrityIntervalRef = useRef(null);
  const toastShownRef = useRef(false);

  useEffect(() => {
    fetchTest();
    // Prevent Back Navigation
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, "", window.location.href);
    };
    return () => {
      window.onpopstate = null;
      stopIntegrityMonitor();
    };
  }, []);

  const fetchTest = async () => {
    try {
      const res = await axios.get(`/attempts/public/${testId}`);
      if (res.data?.success && res.data?.data) {
        setTest(res.data.data);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load test details.";
      setError(message);
      toast.error(message);
    }
  };

  const detectDevTools = () => {
    const threshold = 160;
    if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
      return true;
    }
    return false;
  };

  const startIntegrityMonitor = () => {
    integrityIntervalRef.current = setInterval(() => {
      if (document.hidden || detectDevTools()) {
        const message = "Security violation detected. Please stay on this tab with tools closed.";
        setError(message);
        if (!toastShownRef.current) {
          toast.error(message);
          toastShownRef.current = true;
        }
        stopIntegrityMonitor();
      }
    }, 1000);
  };

  const stopIntegrityMonitor = () => {
    if (integrityIntervalRef.current) clearInterval(integrityIntervalRef.current);
  };

  const handleStart = async () => {
    if (!agree) return;
    if (detectDevTools()) {
      setError("Please close Developer Tools before proceeding.");
      return;
    }

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      if (!document.fullscreenElement) {
        setError("Fullscreen mode is required to maintain examination integrity.");
        return;
      }
      startIntegrityMonitor();
      setCountdown(5);
    } catch (err) {
      setError("Fullscreen permission is mandatory for this session.");
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { launchExam(); return; }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const launchExam = async () => {
    try {
      stopIntegrityMonitor();
      setLoading(true);
      const res = await axios.post("/attempts/start", { testId });
      navigate(`/student/exam/${res.data.attemptId}`);
    } catch (err) {
      setError("System failed to initialize the examination node.");
      setLoading(false);
      setCountdown(null);
    }
  };

  if (!test) return <Loader />;

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
          
          
          <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
             Candidate <span className="text-[#1e3a8a]">Pre-Examination Guidelines</span>
          </h1>
        </div>

        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-6">

          {/* WARNING BLOCK */}
          <div className="bg-red-50 border border-red-200 p-4 rounded flex gap-4 items-start shadow-sm">
            <AlertCircle className="text-red-600 shrink-0" size={20} />
            <div className="space-y-1">
              <p className="text-[11px] text-red-900 font-bold uppercase tracking-tight">Proctoring Notice:</p>
              <p className="text-[11px] text-red-800 leading-relaxed font-medium">
                This examination is monitored. Tab switching, screen exiting, or using developer tools will result in <strong>immediate automatic submission</strong> of your attempt.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT: INFORMATION DENSITY */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* TEST SPECIFICATIONS */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                   <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2">
                     <FileText size={16} className="text-[#1e3a8a]" /> Examination Nomenclature
                   </h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-y-4">
                  <SpecTile label="MODULE NAME" value={test.name} />
                  <SpecTile label="ALLOCATED TIME" value={`${test.duration} Minutes`} />
                  <SpecTile label="TOTAL SCORE" value={`${test.totalMarks} Points`} />
                  <SpecTile label="QUALIFYING" value={`${test.passingMarks} Points`} />
                </div>
              </div>

              {/* INTEGRITY PROTOCOLS */}
              <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                   <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2">
                     <ShieldCheck size={16} className="text-[#1e3a8a]" /> Integrity Protocols
                   </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProtocolItem text="Fullscreen Mode is strictly mandatory." />
                  <ProtocolItem text="Do not refresh or navigate backward." />
                  <ProtocolItem text="System logs all tab switch attempts." />
                  <ProtocolItem text="Timer continues during disconnection." />
                </div>
              </div>
            </div>

            {/* RIGHT: ACTIONS & DECLARATION */}
            <aside className="lg:col-span-4 space-y-6 sticky top-20">
              <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase mb-4 border-b border-slate-100 pb-2">
                  Launch Console
                </h3>

                {countdown !== null ? (
                  <div className="py-10 text-center space-y-2">
                    <div className="text-4xl font-bold text-[#1e3a8a] animate-bounce">{countdown}</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initializing Node...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex gap-3 items-start cursor-pointer select-none" onClick={() => setAgree(!agree)}>
                      <div className={`mt-0.5 shrink-0 rounded border-2 p-1 transition-colors ${agree ? 'bg-[#1e3a8a] border-[#1e3a8a]' : 'border-red-800'}`}>
                        {agree && <CheckSquare size={15} className="text-white" />}
                      </div>
                      <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-tight">
                        I hereby declare that I have read the guidelines and will adhere to the examination rules.
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-50 text-red-600 p-2 rounded border border-red-100 text-[10px] font-bold text-center uppercase">
                        {error}
                      </div>
                    )}

                    <button
                      disabled={!agree || loading}
                      onClick={handleStart}
                      className={`w-full py-4 rounded font-bold text-xs uppercase tracking-widest transition-all
                        ${agree && !loading
                          ? "bg-[#1e3a8a] text-white hover:bg-blue-900 shadow-lg shadow-blue-100"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                      {loading ? "ESTABLISHING..." : "START EXAMINATION"}
                    </button>
                  </div>
                )}
              </div>

              {/* SYSTEM STATUS BADGE */}
              <div className="bg-slate-800 p-5 rounded text-white flex items-center gap-4 shadow-md">
                 <div className="bg-white/10 p-2 rounded">
                    <Monitor size={20} className="text-blue-300" />
                 </div>
                 <div>
                   <p className="text-[9px] font-bold uppercase opacity-60">System Readiness</p>
                   <p className="text-xs font-bold text-emerald-400 uppercase">Verified Stable</p>
                 </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

/* HELPER COMPONENTS */

function SpecTile({ label, value }) {
  return (
    <div className="border-l-2 border-slate-100 pl-4">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800 uppercase truncate">{value}</p>
    </div>
  );
}

function ProtocolItem({ text }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
      <div className="h-1.5 w-1.5 rounded-full bg-[#1e3a8a]" />
      {text}
    </div>
  );
}