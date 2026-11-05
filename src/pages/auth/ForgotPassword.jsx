import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../services/axiosInstance";
import { 
  Mail, 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Timer,
  Info,
  LockKeyhole,
  BookOpen,
  Fingerprint,
  Home
} from "lucide-react";
import logo from "../../assets/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [systemTime, setSystemTime] = useState(new Date());
  const navigate = useNavigate();

  // --- AUTO UPDATING SYSTEM TIMER ---
  useEffect(() => {
    const clock = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const validate = () => {
    if (!email) return "Registered Email ID required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Invalid protocol format";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) return setError(validationError);

    try {
      setLoading(true);
      await axios.post("/auth/forgot-password", { email: email.trim() });
      setSuccess("Recovery link dispatched to your registered email.");
      setCooldown(60); 
    } catch (err) {
      setError(err.response?.data?.message || "Internal verification system timeout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#E2E8F0] font-sans  ">
      
      {/* --- EXAM PORTAL HEADER --- */}
      <div className="w-full max-w-[900px] flex flex-col md:flex-row justify-between items-center mb-6 px-2 gap-4 md:gap-0">
        <div className="flex items-center gap-3 md:gap-4">
          <img src={logo} alt="Test Series Portal" className="h-12 md:h-20 w-auto object-contain bg-white p-1 rounded border shadow-sm" />
          <div className="text-left">
            <h1 className="text-lg md:text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
              Test Series <span className="text-[#1e3a8a]">Portal</span>
            </h1>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Candidate Recovery System</p>
          </div>
        </div>
        
        <div className="flex md:block items-center gap-2 text-right">
          <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest md:mb-1">System Time:</p>
          <p className="text-xs md:text-sm font-mono font-bold text-slate-700 bg-white px-2 md:px-3 py-1 rounded border border-slate-300 shadow-sm">
            {systemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      {/* --- MAIN RECOVERY CONSOLE CARD --- */}
      <div className="w-full max-w-[900px] bg-white shadow-xl rounded-sm border border-slate-300 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL: RECOVERY FORM */}
        <div className="w-full md:w-[55%] p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200">
          <div className="flex items-center gap-2 mb-6 md:mb-8 pb-2 border-b-2 border-[#1e3a8a] w-fit">
            <Fingerprint size={18} className="text-[#1e3a8a]" />
            <h2 className="text-xs md:text-sm font-black text-slate-700 uppercase tracking-tight">Account Recovery</h2>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-sm mb-6 flex items-start gap-3">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold uppercase tracking-tight leading-relaxed">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-sm mb-6 flex items-start gap-3">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold uppercase tracking-tight leading-relaxed">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Registered Email ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  value={email}
                  placeholder="e.g., aspirant@bihar.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-sm text-sm outline-none transition-all focus:bg-white focus:border-[#1e3a8a]"
                  required
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className={`w-full py-3.5 rounded-sm font-bold text-xs uppercase tracking-[0.2em] shadow-md transition-all flex items-center justify-center gap-2 ${
                  cooldown > 0 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
                  : "bg-[#1e3a8a] text-white hover:bg-blue-900 active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : cooldown > 0 ? (
                  <>
                    <Timer size={16} className="animate-pulse" /> Resend Locked ({cooldown}s)
                  </>
                ) : (
                  "Send Recovery Link"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full bg-white text-slate-600 border border-slate-300 py-3 rounded-sm font-bold text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-[#1e3a8a] transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} /> Back to Login
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: RECOVERY GUIDELINES */}
        <div className="w-full md:w-[45%] bg-slate-50 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen size={18} className="text-slate-600" />
            <h2 className="text-sm font-black text-slate-600 uppercase tracking-tight">System Notice</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white border-l-4 border-blue-600 shadow-sm rounded-sm">
              <h3 className="text-[10px] font-black text-slate-800 uppercase mb-1">Link Expiry</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">The security reset link will remain active for exactly 15 minutes for security reasons.</p>
            </div>

            <div className="p-4 bg-white border-l-4 border-orange-500 shadow-sm rounded-sm">
              <h3 className="text-[10px] font-black text-slate-800 uppercase mb-1">Spam Detection</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">If the recovery dispatch is not visible in your Inbox, please inspect your Junk or Spam directory.</p>
            </div>

            <div className="p-4 bg-white border-l-4 border-green-600 shadow-sm rounded-sm text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mb-3">Forgot Email ID?</p>
              <button className="inline-block w-full text-center py-2.5 bg-slate-100 text-[#1e3a8a] font-black text-[10px] uppercase tracking-widest border border-slate-200 cursor-not-allowed opacity-60">
                Contact Technical Support
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-slate-400">
            <Info size={14} />
            <p className="text-[9px] font-bold uppercase tracking-widest">Portal secured under Indian IT Act 2000.</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 text-slate-400 text-center">
      
        <div className="hidden md:block h-4 w-px bg-slate-300"></div>
        <p className="text-[9px] font-bold uppercase tracking-widest">© 2026 Test Series Portal </p>
      </div>
    </div>
  );
}