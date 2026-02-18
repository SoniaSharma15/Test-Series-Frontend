import { useState, useContext } from "react";
import axios from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  KeyRound 
} from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full identity required";
    if (!form.email) newErrors.email = "Uplink ID required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid protocol";
    if (!form.password) newErrors.password = "Access Key required";
    else if (form.password.length < 6) newErrors.password = "Min 6 characters required";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Mismatch detected";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) return setErrors(valErrors);

    try {
      setLoading(true);
      const res = await axios.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });

      login(res.data);
      const role = res.data?.user?.role;
      navigate(role ? `/${role}/dashboard` : "/");
    } catch (err) {
      setServerError(err.response?.data?.message || "Node Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-100/40 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[100px]" />

      <div className="w-full max-w-[460px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Branding Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-blue-100 shadow-2xl transition-transform hover:rotate-3 duration-500">
               <Zap size={28} className="text-blue-600 fill-blue-600/10" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center leading-tight">
            The Brilliant <span className="text-blue-600 italic underline decoration-blue-200 underline-offset-8">Bihar</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
            <ShieldCheck size={12} className="text-blue-600" />
            Enrollment Center
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 md:p-10 relative overflow-hidden">
          
          {serverError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 mb-6">
              <div className="w-1 h-1 rounded-full bg-rose-600" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div className="space-y-1.5 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">
                Candidate Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all ${
                    errors.name ? "border-rose-300 ring-4 ring-rose-50" : "border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                  }`}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">
                Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="rollnumber@brilliant.in"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all ${
                    errors.email ? "border-rose-300 ring-4 ring-rose-50" : "border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                  }`}
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                  <input
                    type="password"
                    placeholder="••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all ${
                      errors.password ? "border-rose-300 ring-4 ring-rose-50" : "border-slate-200 focus:border-blue-600 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-blue-600 transition-colors">
                  Verify Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                  <input
                    type="password"
                    placeholder="••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all ${
                      errors.confirmPassword ? "border-rose-300 ring-4 ring-rose-50" : "border-slate-200 focus:border-blue-600 focus:bg-white"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>Register now <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Existing Candidate?{" "}
              <Link to="/login" className="text-blue-600 font-black hover:underline underline-offset-4">
                Login
              </Link>
            </p>
          </div>
        </div>
        
        {/* Localization Footer */}
        <div className="flex justify-between items-center mt-8 px-4 opacity-50">
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.5em]">
            Status: Open Enrollment
          </p>
          <div className="flex gap-2 text-[8px] font-black text-slate-400 uppercase">
             V2.0.4
          </div>
        </div>
      </div>
    </div>
  );
}