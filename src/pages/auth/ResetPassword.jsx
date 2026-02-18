import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../services/axiosInstance";
import { Lock, KeyRound, Loader2, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.password) return "New Access Key required";
    if (form.password.length < 6) return "Key must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Security Keys do not match";
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
      await axios.post(`/auth/reset-password/${token}`, {
        password: form.password
      });

      setSuccess("Credential Override Successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired security token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans relative overflow-hidden">
      {/* Visual Background Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-100/40 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[100px]" />

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Branding Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 transition-opacity" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-blue-100 shadow-2xl transition-transform hover:rotate-3 duration-500">
               <KeyRound size={32} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center leading-tight">
             Brilliant <span className="text-blue-600 italic">Bihar</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
            <ShieldCheck size={12} className="text-blue-600" />
            Credential Recovery Center
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
            
            {/* Password Input */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">
                New Access Key
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">
                Verify New Key
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="Repeat Access Key"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Update Credentials"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors">
              <ArrowLeft size={14} /> Back to Entry Terminal
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <p className="text-center text-slate-300 text-[8px] font-black uppercase tracking-[0.5em] mt-10">
          Secure End-to-End Encryption Active
        </p>
      </div>
    </div>
  );
}