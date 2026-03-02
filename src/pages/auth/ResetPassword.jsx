import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../services/axiosInstance";
import { 
  Lock, 
  KeyRound, 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Info,
  LockKeyhole,
  Home,
  BookOpen,
  Fingerprint,
  Eye,
  EyeOff
} from "lucide-react";
import logo from "../../assets/logo.png";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());

  // --- AUTO UPDATING SYSTEM TIMER ---
  useEffect(() => {
    const clock = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  // --- PASSWORD STRENGTH CALCULATION ---
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 10) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return Math.min(strength, 4); // Max 4 levels
  };

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];
  const currentStrength = getStrength(form.password);

  const validate = () => {
    if (!form.password) return "New Security Key required";
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

      setSuccess("Credential Override Successful! Redirecting to login console...");
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired security token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#E2E8F0] font-sans border-t-[6px] border-[#1e3a8a]">
      
      {/* --- EXAM PORTAL HEADER --- */}
      <div className="w-full max-w-[900px] flex flex-col md:flex-row justify-between items-center mb-6 px-2 gap-4 md:gap-0">
        <div className="flex items-center gap-3 md:gap-4">
          <img src={logo} alt="The Brilliant Bihar" className="h-12 md:h-20 w-auto object-contain bg-white p-1 rounded border shadow-sm" />
          <div className="text-left">
            <h1 className="text-lg md:text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
              The Brilliant <span className="text-[#1e3a8a]">Bihar</span>
            </h1>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Credential Management System</p>
          </div>
        </div>
        
        <div className="flex md:block items-center gap-2 text-right">
          <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest md:mb-1">System Time:</p>
          <p className="text-xs md:text-sm font-mono font-bold text-slate-700 bg-white px-2 md:px-3 py-1 rounded border border-slate-300 shadow-sm">
            {systemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      {/* --- MAIN RESET CONSOLE CARD --- */}
      <div className="w-full max-w-[900px] bg-white shadow-xl rounded-sm border border-slate-300 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL: RESET FORM */}
        <div className="w-full md:w-[55%] p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200">
          <div className="flex items-center gap-2 mb-6 md:mb-8 pb-2 border-b-2 border-[#1e3a8a] w-fit">
            <Fingerprint size={18} className="text-[#1e3a8a]" />
            <h2 className="text-xs md:text-sm font-black text-slate-700 uppercase tracking-tight">Security Key Override</h2>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1">
              <label className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-sm text-sm outline-none transition-all focus:bg-white focus:border-[#1e3a8a]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1e3a8a] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level}
                        className={`h-full flex-1 rounded-full transition-all duration-500 ${
                          currentStrength >= level ? strengthColors[currentStrength - 1] : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-tighter text-right text-slate-500">
                    Security Level: <span className={currentStrength > 0 ? "text-slate-800" : ""}>{strengthLabels[currentStrength - 1] || "Weak"}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Confirm New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter to confirm"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-sm text-sm outline-none transition-all focus:bg-white focus:border-[#1e3a8a]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1e3a8a] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a8a] text-white py-3.5 rounded-sm font-bold text-xs uppercase tracking-[0.2em] shadow-md transition-all flex items-center justify-center gap-2 hover:bg-blue-900 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Credentials"}
              </button>

              <button
                type="button"
                onClick={() => window.location.replace("https://thebrilliantbihar.com")}
                className="w-full bg-white text-slate-600 border border-slate-300 py-3 rounded-sm font-bold text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-[#1e3a8a] transition-all flex items-center justify-center gap-2"
              >
                <Home size={14} /> Return to Homepage
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: SECURITY GUIDELINES */}
        <div className="w-full md:w-[45%] bg-slate-50 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen size={18} className="text-slate-600" />
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-tight">Security Protocols</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white border-l-4 border-blue-600 shadow-sm rounded-sm">
              <h3 className="text-[10px] font-black text-slate-800 uppercase mb-1">Key Complexity</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Ensure your new security key contains at least 6 characters. Use alphanumeric values for better security.</p>
            </div>

            <div className="p-4 bg-white border-l-4 border-orange-500 shadow-sm rounded-sm">
              <h3 className="text-[10px] font-black text-slate-800 uppercase mb-1">Session Termination</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Updating your key will invalidate all previous active sessions on other devices.</p>
            </div>

            <div className="p-4 bg-white border-l-4 border-green-600 shadow-sm rounded-sm text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mb-3">Remembered your key?</p>
              <Link to="/login" className="inline-block w-full text-center py-2.5 bg-slate-100 text-[#1e3a8a] font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-[#1e3a8a] hover:text-white transition-all">
                Return to Login
              </Link>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-2 text-slate-400">
            <Info size={14} />
            <p className="text-[9px] font-bold uppercase tracking-widest">Digital Audit Log is active for this session.</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 text-slate-400 text-center">
        <div className="hidden md:block h-4 w-px bg-slate-300"></div>
        <p className="text-[9px] font-bold uppercase tracking-widest">© 2026 The Brilliant Bihar • Secure Portal</p>
      </div>
    </div>
  );
}