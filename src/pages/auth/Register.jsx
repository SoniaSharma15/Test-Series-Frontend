import { useState, useContext, useEffect } from "react";
import axios from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, Mail, Lock, Loader2, ArrowRight, 
  KeyRound, Phone, Home, BookOpen, Info, Fingerprint,
  Eye, EyeOff, CheckCircle2, XCircle
} from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- PASSWORD STRENGTH LOGIC ---
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const currentStrength = getPasswordStrength(form.password);

  const validate = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Candidate name required";
    
    if (!form.email) newErrors.email = "Email Id required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    
    if (!form.mobile) newErrors.mobile = "Mobile number required";
    else if (!/^[6-9]\d{9}$/.test(form.mobile)) newErrors.mobile = "Invalid 10-digit number";
    
    if (!form.password) {
      newErrors.password = "Password required";
    } else {
      if (form.password.length < 8) newErrors.password = "Minimum 8 characters required";
      if (!/[A-Z]/.test(form.password)) newErrors.password = "Must contain one uppercase letter";
      if (!/[0-9]/.test(form.password)) newErrors.password = "Must contain one number";
      if (!/[^A-Za-z0-9]/.test(form.password)) newErrors.password = "Must contain one special character";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      toast.error(Object.values(valErrors)[0]);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
      });

      toast.success("Registration Successful ✅");
      login(res.data);
      const role = res.data?.user?.role;
      const customUrl = role === "admin" ? "/admin-portal/overview" : "/candidate-panel/dashboard";
      navigate(customUrl);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#E2E8F0] font-sans p-4">
      
      {/* HEADER */}
      <div className="w-full max-w-[950px] flex flex-col md:flex-row justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Test Series Portal" className="h-14 lg:h-20 w-auto object-contain bg-white p-1 rounded border shadow-sm" />
          <div className="text-left">
            <h1 className="text-xl lg:text-2xl font-black text-slate-800 uppercase tracking-tighter">
              Test Series <span className="text-[#1e3a8a]">Portal</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Candidate Enrollment Portal</p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Time</p>
          <p className="text-sm font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded border border-slate-300 shadow-sm">
            {systemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="w-full max-w-[950px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-sm border border-slate-300 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="w-full md:w-[60%] p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-[#1e3a8a] w-fit">
            <Fingerprint size={18} className="text-[#1e3a8a]" />
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-tight">New Candidate Registration</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={form.name}
                  placeholder="Enter full name"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-sm text-sm outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-[#1e3a8a]'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={form.email}
                    placeholder="email@example.com"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-sm text-sm outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-[#1e3a8a]'}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="tel"
                    value={form.mobile}
                    placeholder="10-digit number"
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-sm text-sm outline-none transition-all ${errors.mobile ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-[#1e3a8a]'}`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    placeholder="••••••••"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-sm text-sm outline-none transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-[#1e3a8a]'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1e3a8a]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                {/* Strength Meter */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold uppercase text-slate-400">Strength: {strengthLabels[currentStrength - 1] || "Very Weak"}</span>
                    </div>
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className={`flex-1 rounded-full transition-all duration-500 ${currentStrength >= step ? strengthColors[currentStrength - 1] : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Confirm Key</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    placeholder="••••••••"
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-sm text-sm outline-none transition-all ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-[#1e3a8a]'}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1e3a8a]">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirmPassword && (
                  <div className="mt-1 flex items-center gap-1">
                    {form.password === form.confirmPassword ? 
                      <CheckCircle2 size={10} className="text-green-500" /> : 
                      <XCircle size={10} className="text-red-500" />
                    }
                    <span className={`text-[9px] font-bold uppercase ${form.password === form.confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                      {form.password === form.confirmPassword ? "Match" : "No Match"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a8a] text-white py-3 font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-900 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Register as Candidate <ArrowRight size={14} /></>}
              </button>

              <button
                type="button"
                onClick={() => window.location.href = "/"}
                className="w-full bg-white text-slate-600 border border-slate-300 py-3 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-[#1e3a8a] transition-all flex items-center justify-center gap-2"
              >
                <Home size={14} /> Return to Homepage
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-[40%] bg-slate-50 p-8">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen size={18} className="text-slate-600" />
            <h2 className="text-sm font-black text-slate-600 uppercase tracking-tight">Security Standards</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white border-l-4 border-blue-600 shadow-sm rounded-sm">
              <h3 className="text-[10px] font-black text-slate-800 uppercase mb-2">Password Requirements:</h3>
              <ul className="space-y-1.5">
                <li className={`flex items-center gap-2 text-[10px] font-bold uppercase ${form.password.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>
                  <CheckCircle2 size={12} /> Min 8 Characters
                </li>
                <li className={`flex items-center gap-2 text-[10px] font-bold uppercase ${/[A-Z]/.test(form.password) ? 'text-green-600' : 'text-slate-400'}`}>
                  <CheckCircle2 size={12} /> One Uppercase Letter
                </li>
                <li className={`flex items-center gap-2 text-[10px] font-bold uppercase ${/[0-9]/.test(form.password) ? 'text-green-600' : 'text-slate-400'}`}>
                  <CheckCircle2 size={12} /> One Number (0-9)
                </li>
                <li className={`flex items-center gap-2 text-[10px] font-bold uppercase ${/[^A-Za-z0-9]/.test(form.password) ? 'text-green-600' : 'text-slate-400'}`}>
                  <CheckCircle2 size={12} /> One Special Character
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white border-l-4 border-orange-500 shadow-sm rounded-sm text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mb-3">Already registered?</p>
              <Link to="/login" className="inline-block w-full text-center py-2 bg-slate-100 text-[#1e3a8a] font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-[#1e3a8a] hover:text-white transition-all">
                Login to Portal
              </Link>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-2 text-slate-400">
            <Info size={14} />
            <p className="text-[9px] font-bold uppercase tracking-widest leading-tight">By enrolling, you agree to the portal terms and data policy.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4 text-slate-400">
        <p className="text-[10px] font-bold uppercase tracking-widest">© 2026 Test Series Portal</p>
      </div>
    </div>
  );
}