import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../services/axiosInstance";
import { 
  Mail, 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  Fingerprint, 
  CheckCircle2, 
  Timer 
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const validate = () => {
    if (!email) return "Uplink ID required";
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
      await axios.post("/auth/forgot-password", {
        email: email.trim()
      });

      setSuccess("Reset link dispatched to your uplink.");
      setCooldown(30); 

    } catch (err) {
      setError(err.response?.data?.message || "Unable to initialize recovery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans relative overflow-hidden">
      {/* Background Subtle Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-100/40 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[100px]" />

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Branding Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 transition-opacity" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-blue-100 shadow-2xl transition-transform hover:scale-105 duration-500">
               <Fingerprint size={32} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center leading-tight">
             Brilliant <span className="text-blue-600 italic">Bihar</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
            <ShieldCheck size={12} className="text-blue-600" />
            Identity Recovery Module
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 relative overflow-hidden">
          
          {/* Status Messages */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 mb-6">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="rollnumber@brilliant.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className={`w-full py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
                cooldown > 0 
                ? "bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed" 
                : "bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : cooldown > 0 ? (
                <>
                  <Timer size={16} /> Resend in {cooldown}s
                </>
              ) : (
                "Request Reset Link"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors">
              <ArrowLeft size={14} /> Back to Entry Terminal
            </Link>
          </div>
        </div>

        {/* System Footer */}
        <p className="text-center text-slate-300 text-[8px] font-black uppercase tracking-[0.5em] mt-10">
          Brilliant Bihar Digital Infrastructure
        </p>
      </div>
    </div>
  );
}