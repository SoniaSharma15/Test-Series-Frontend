import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import StudentSidebar from "../../components/student/StudentSidebar";

export default function AttemptInstruction() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTest();
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, "", window.location.href);
    };
    return () => { window.onpopstate = null; };
  }, []);

  const fetchTest = async () => {
    try {
      const res = await axios.get(`/attempts/public/${testId}`);
      setTest(res.data);
    } catch (err) {
      setError("Unable to load test details.");
    }
  };

  const handleStart = async () => {
    if (!agree) return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setCountdown(5);
    } catch (err) {
      setError("Please allow fullscreen mode to start exam.");
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      launchExam();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const launchExam = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/attempts/start", { testId });
      navigate(`/student/exam/${res.data.attemptId}`);
    } catch (err) {
      setError("Unable to start attempt.");
      setLoading(false);
      setCountdown(null);
    }
  };

  if (!test)
    return (
      <div className="flex min-h-screen bg-gray-100 font-sans">
        <StudentSidebar />
        <div className="flex-1 flex items-center justify-center text-slate-500 font-bold">
          Loading Secure Lobby...
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <StudentSidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 flex justify-center items-start overflow-y-auto">
        {/* Compact Card Container */}
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

          {/* Header - Reduced height */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-5">
            <h1 className="text-xl font-black uppercase tracking-widest leading-tight">
              Secure Exam Launch
            </h1>
            <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">
              System readiness verification
            </p>
          </div>

          <div className="p-5 md:p-8 space-y-6">

            {/* Grid - Stacks on mobile, side-by-side on tablet+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Test Overview */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="font-black uppercase text-[10px] tracking-widest mb-3 text-slate-400">
                  Test Overview
                </h2>
                <div className="space-y-1.5 text-xs font-bold text-slate-700">
                  <p className="flex justify-between border-b border-slate-100 pb-1"><span>Name:</span> <span className="text-blue-600">{test.name}</span></p>
                  <p className="flex justify-between border-b border-slate-100 pb-1"><span>Duration:</span> <span>{test.duration} Min</span></p>
                  <p className="flex justify-between border-b border-slate-100 pb-1"><span>Total Marks:</span> <span>{test.totalMarks}</span></p>
                  <p className="flex justify-between border-b border-slate-100 pb-1"><span>Passing:</span> <span>{test.passingMarks}</span></p>
                  <p className="flex justify-between"><span>Neg. Marking:</span> <span className="text-red-500">Vary as per Question</span></p>
                </div>
              </div>

              {/* System Readiness */}
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm">
                <h2 className="font-black uppercase text-[10px] tracking-widest mb-3 text-emerald-800/60">
                  System Readiness
                </h2>
                <ul className="text-[11px] font-bold space-y-1.5 text-emerald-700">
                  <li className="flex items-center gap-2">✔ Stable Connectivity</li>
                  <li className="flex items-center gap-2">✔ Laptop Recommended</li>
                  <li className="flex items-center gap-2">✔ No Page Refresh</li>
                  <li className="flex items-center gap-2">✔ Fullscreen Mandatory</li>
                  <li className="flex items-center gap-2">✔ Tab Switch Logged</li>
                </ul>
              </div>

            </div>

            {/* Security Rules - Compact */}
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm">
              <h2 className="font-black uppercase text-[10px] tracking-widest mb-2 text-red-700/60">
                Security Policy
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-bold text-red-700">
                <li>• Tab switch monitoring active.</li>
                <li>• ESC / Exit logged instantly.</li>
                <li>• Violation leads to auto-submit.</li>
                <li>• Timer is non-pausable.</li>
              </ul>
            </div>

            {/* Declaration - Compact */}
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl shadow-sm">
              <p className="text-[10px] font-black uppercase text-amber-800/60 tracking-widest mb-1">
                Declaration
              </p>
              <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                I agree to follow all examination rules. Malpractice leads to immediate termination.
              </p>
            </div>

            {/* Actions Area */}
            <div className="space-y-4 pt-2">
              {error && (
                <div className="text-red-600 text-[10px] font-black uppercase text-center bg-red-50 p-2 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agree}
                  onChange={() => setAgree(!agree)}
                  className="w-4 h-4 cursor-pointer accent-blue-600 rounded"
                />
                <label htmlFor="agree" className="text-[10px] font-black uppercase text-slate-500 cursor-pointer select-none">
                  I agree to all secure examination protocols.
                </label>
              </div>

              {countdown !== null && (
                <div className="text-center text-xl font-black text-blue-600 animate-pulse">
                  Launching Exam in {countdown}...
                </div>
              )}

              <button
                disabled={!agree || loading || countdown !== null}
                onClick={handleStart}
                className={`w-full py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 ${
                  agree
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Establishing Node..." : "Start Secure Exam"}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}