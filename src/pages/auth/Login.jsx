import { useState, useContext, useEffect } from "react";
import axios from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, Lock, Loader2, Home, BookOpen, Fingerprint, 
  ShieldCheck, Info, Eye, EyeOff // Added Eye and EyeOff
} from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password toggle
  const [systemTime, setSystemTime] = useState(new Date());
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });
      toast.success("Identity Verified ✅");
      login(res.data);
      const role = res.data?.user?.role;
      navigate(role ? `/${role}/dashboard` : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#E2E8F0] p-4 font-sans">
      
      {/* HEADER SECTION */}
      <div className="w-full max-w-[850px] flex flex-col md:flex-row justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Test Series Portal" className="h-14 lg:h-20 w-auto object-contain bg-white p-1 rounded border shadow-sm" />
          <div className="text-left">
            <h1 className="text-xl lg:text-2xl font-black text-slate-800 uppercase tracking-tighter">
              Test Series <span className="text-[#1e3a8a]">Portal</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Digital Examination & Test Series Portal</p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Time</p>
          <p className="text-sm font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded border border-slate-300 shadow-sm">
            {systemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="w-full max-w-[850px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-sm border border-slate-300 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL: LOGIN FORM */}
        <div className="w-full md:w-[45%] p-8 border-b md:border-b-0 md:border-r border-slate-200">
          <div className="flex items-center gap-2 mb-8 pb-2 border-b-2 border-[#1e3a8a] w-fit">
            <Fingerprint size={18} className="text-[#1e3a8a]" />
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-tight">Candidate Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="Enter Email ID"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-sm text-sm focus:bg-white focus:border-[#1e3a8a] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? "text" : "password"} // Type toggles between text and password
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-sm text-sm focus:bg-white focus:border-[#1e3a8a] outline-none transition-all"
                />
                {/* --- PASSWORD TOGGLE BUTTON --- */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1e3a8a] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a8a] text-white py-3 font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-900 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
              </button>

              <button
                type="button"
                onClick={() => window.location.href = "/"}
                className="w-full bg-white text-slate-600 border border-slate-300 py-3 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-[#1e3a8a] hover:border-[#1e3a8a] transition-all flex items-center justify-center gap-2"
              >
                <Home size={14} /> Return to Homepage
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
              <Link to="/forgot-password" size={10} className="text-[10px] font-bold text-[#1e3a8a] uppercase hover:underline">Forgot Credentials?</Link>
              <Link to="/register" className="text-[10px] font-bold text-slate-500 uppercase hover:text-slate-800">New Candidate? Register Here</Link>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: EXAM INSTRUCTIONS/DETAILS */}
        <div className="w-full md:w-[55%] bg-slate-50 p-8">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen size={18} className="text-slate-600" />
            <h2 className="text-sm font-black text-slate-600 uppercase tracking-tight">Active Test Series</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white border-l-4 border-blue-600 shadow-sm rounded-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase mb-1">UPSC Civil Services 2026</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Comprehensive Prelims and Mains Test Series with detailed feedback and AIR ranking.</p>
            </div>

            <div className="p-4 bg-white border-l-4 border-orange-500 shadow-sm rounded-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase mb-1">BPSC 71st Integrated</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Specialized focus on Bihar Economic Survey, Budget, and Current Affairs modules.</p>
            </div>

            <div className="p-4 bg-white border-l-4 border-green-600 shadow-sm rounded-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase mb-1">State PCS Excellence</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Multi-state PCS coverage including UPPCS and JPSC previous year integrated mocks.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-slate-400">
            <Info size={14} />
            <p className="text-[9px] font-bold uppercase tracking-widest">Ensure your browser is up to date before starting.</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-8 flex items-center gap-4 text-slate-400">
        <p className="text-[10px] font-bold uppercase tracking-widest">© 2026 Test Series Portal</p>
      </div>
    </div>
  );
}