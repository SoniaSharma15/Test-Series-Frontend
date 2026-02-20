import { useState } from "react";
import axios from "../../services/axiosInstance";
import { UserCog, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateUserAssignCourse({ seriesList }) {
  /* ---------------- STATE ---------------- */
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",   // ✅ added
    password: "",
    role: "student",
    testSeriesId: "",
  });


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* ---------------- HANDLE INPUT ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.mobile.trim() ||
      !form.password.trim()
    ) {
      return "All fields are required";
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      return "Invalid 10-digit mobile number";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return null;
  };


  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
  const validationError = validateForm();

  if (validationError) {
    setError(validationError);
    toast.error(validationError);
    return;
  }

  let loadingToast;

  try {
    setLoading(true);
    setError("");
    setMessage("");

    loadingToast = toast.loading("Creating user account...");

    await axios.post("/user/create-user", {
      name: form.name,
      email: form.email,
      mobile: form.mobile,
      password: form.password,
      role: form.role,
      testSeriesId:
        form.role === "student" ? form.testSeriesId : null,
    });

    toast.dismiss(loadingToast);
    toast.success("User created successfully 🎉");

    setMessage("User created successfully");

    // Reset form
    setForm({
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "student",
      testSeriesId: "",
    });

  } catch (err) {
    toast.dismiss(loadingToast);

    const errorMessage =
      err.response?.data?.message || "Failed to create user ❌";

    setError(errorMessage);
    toast.error(errorMessage);

  } finally {
    setLoading(false);
  }
};

  return (
  <section className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col
                      w-full max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto">
    {/* Header */}
    <div className="px-6 py-6 sm:px-8 sm:py-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
      <div className="bg-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-purple-200">
        <UserCog size={20} />
      </div>
      <h2 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-widest">
        Create User & Assign Course
      </h2>
    </div>

    {/* Body */}
    <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-5 sm:space-y-6">
      {error && <div className="text-red-600 text-xs font-bold">{error}</div>}
      {message && <div className="text-green-600 text-xs font-bold">{message}</div>}

      {/* ✅ Desktop: split into 2 columns, mobile: single */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600 transition-all"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600 transition-all"
        />

        {/* Mobile */}
        <input
          type="tel"
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600 transition-all"
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Secure Password"
          value={form.password}
          onChange={handleChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600 transition-all"
        />

        {/* Role */}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600 transition-all"
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        {/* Course */}
        {form.role === "student" ? (
          <select
            name="testSeriesId"
            value={form.testSeriesId}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600 transition-all"
          >
            <option value="">Assign Course (Optional)</option>
            {seriesList?.map((series) => (
              <option key={series._id} value={series._id}>
                {series.title}
              </option>
            ))}
          </select>
        ) : (
          <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-400">
            No Course Required
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading ? <RefreshCw size={18} className="animate-spin" /> : "Create Account"}
      </button>
    </div>
  </section>
);
}
