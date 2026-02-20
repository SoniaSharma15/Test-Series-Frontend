import { useState, useContext } from "react";
import axios from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};
    if (!form.email) newErrors.email = "Uplink ID required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid protocol";
    if (!form.password) newErrors.password = "Access Key required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      toast.error("Please fill all required fields correctly ❌");
      return;
    }

    setErrors({});

    let toastId;

    try {
      setLoading(true);

      toastId = toast.loading("Authenticating...");

      const res = await axios.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      toast.dismiss(toastId);
      toast.success("Login Successful 🚀");

      login(res.data);

      const role = res.data?.user?.role;
      navigate(role ? `/${role}/dashboard` : "/");

    } catch (err) {
      toast.dismiss(toastId);

      const message =
        err.response?.data?.message ||
        "Authentication Failed: Credentials Mismatch ❌";

      toast.error(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans relative overflow-hidden py-8">
      
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-100/40 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[100px]" />

      <div className="w-full max-w-[440px] relative z-10">
        
        <div className="flex flex-col items-center mb-10">
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-blue-100 shadow-2xl">
               <Zap size={32} className="text-blue-600 fill-blue-600/10" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center leading-tight">
            The Brilliant <span className="text-blue-600 italic underline decoration-blue-200 underline-offset-8">Bihar</span>
          </h2>

          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
            <ShieldCheck size={12} className="text-blue-600" />
            Official Examination Portal
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl text-sm font-bold outline-none ${
                    errors.email
                      ? "border-rose-300 ring-4 ring-rose-50"
                      : "border-slate-200 focus:border-blue-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl text-sm font-bold outline-none ${
                    errors.password
                      ? "border-rose-300 ring-4 ring-rose-50"
                      : "border-slate-200 focus:border-blue-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>Login <ArrowRight size={16} /></>
              )}
            </button>

          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Unregistered Student?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}