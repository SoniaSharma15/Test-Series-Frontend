import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { 
  Plus, X, UploadCloud, IndianRupee, 
  CheckCircle2, Clock, Zap, ShieldCheck, 
  Sparkles, BookOpen 
} from "lucide-react";

export default function CreateTestSeries() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    duration: "",
    startDate: "",
    language: "",
    features: [],
    subjects: [],
  });

  const [featureInput, setFeatureInput] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(""); // For image preview
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // Fetch data if editing
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await axios.get(`/test-series/${id}`);
        const data = res.data?.data || res.data || {}; // Handle nested data if present
        setForm({
          title: data.title || "",
          description: data.description || "",
          price: data.price || "",
          originalPrice: data.originalPrice || "",
          discount: data.discount || "",
          duration: data.duration || "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          language: data.language || "",
          features: Array.isArray(data.features) ? data.features : [],
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
        });
        if (data.thumbnail) setPreviewUrl(data.thumbnail);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Show local preview
    }
  };

  const addTag = (field, input, setInput) => {
    const v = input.trim();
    if (!v || form[field].includes(v)) return;
    setForm((prev) => ({ ...prev, [field]: [...prev[field], v] }));
    setInput("");
  };

  const removeTag = (field, idx) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  };

/* ================= AUTO PRICE CALCULATION ================= */

useEffect(() => {
  const mrp = Number(form.originalPrice);
  let discount = Number(form.discount);

  if (discount > 100) discount = 100;
  if (discount < 0) discount = 0;

  if (!isNaN(mrp) && mrp > 0) {
    const sellingPrice = mrp - (mrp * discount) / 100;

    setForm((prev) => ({
      ...prev,
      discount,
      price: Math.round(sellingPrice), // 👈 round off
    }));
  } else {
    setForm((prev) => ({
      ...prev,
      price: "",
    }));
  }
}, [form.originalPrice, form.discount]);


  const handleChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      
      // Append basic fields
      Object.keys(form).forEach((key) => {
        if (key === "features" || key === "subjects") {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      });

      // Append file if selected
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      if (isEdit) {
        await axios.put(`/test-series/${id}`, formData);
      } else {
        await axios.post("/test-series", formData);
      }

      navigate("/admin/test-series");
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Failed to save. Check console.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Initializing Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
                <ShieldCheck size={14} />
                <span>Academic Asset Management</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {isEdit ? "Refine" : "Create"} <span className="text-blue-600 italic">Series</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate("/admin/test-series")} className="px-6 py-3 text-xs font-black text-slate-400 hover:text-slate-800 uppercase tracking-widest transition-all">Discard</button>
              <button form="ts-form" disabled={submitting} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                {submitting ? "Processing..." : isEdit ? "Sync Changes" : "Deploy Asset"}
                <Zap size={16} className="fill-current" />
              </button>
            </div>
          </header>

          <form id="ts-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 space-y-8">
              <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                <div className="flex items-center gap-3"><div className="bg-blue-50 p-2 rounded-xl text-blue-600"><Sparkles size={18}/></div><h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">General Identity</h3></div>
                <input value={form.title} onChange={handleChange("title")} placeholder="Series Headline" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-blue-600 transition-all" required />
                <textarea value={form.description} onChange={handleChange("description")} placeholder="Detailed Context..." rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-blue-600 transition-all" required />
              </section>

              <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3 mb-6"><div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><BookOpen size={18}/></div><h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Target Subjects</h3></div>
                <div className="flex gap-3 mb-4">
                  <input value={subjectInput} onChange={(e) => setSubjectInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('subjects', subjectInput, setSubjectInput))} placeholder="e.g. History" className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-blue-600 transition-all" />
                  <button type="button" onClick={() => addTag('subjects', subjectInput, setSubjectInput)} className="bg-indigo-600 text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.subjects.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                      {s} <X size={14} className="cursor-pointer" onClick={() => removeTag('subjects', i)} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-8"><div className="flex items-center gap-3"><div className="bg-emerald-50 p-2 rounded-xl text-emerald-600"><CheckCircle2 size={18}/></div><h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Course Deliverables</h3></div></div>
                <div className="flex gap-3 mb-4">
                  <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('features', featureInput, setFeatureInput))} placeholder="e.g. 50+ Mock Tests" className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-blue-600" />
                  <button type="button" onClick={() => addTag('features', featureInput, setFeatureInput)} className="bg-blue-600 text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest">Append</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      {f} <X size={14} className="cursor-pointer" onClick={() => removeTag('features', i)} />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 space-y-8">
              <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                <div className="flex items-center gap-3"><div className="bg-amber-50 p-2 rounded-xl text-amber-600"><IndianRupee size={18}/></div><h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Economics</h3></div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Selling Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input type="number" value={form.price} onChange={handleChange("price")} disabled readOnly className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-4 text-xl font-black text-slate-900 outline-none" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={form.originalPrice} onChange={handleChange("originalPrice")} placeholder="MRP" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-400 outline-none" />
                    <input type="number" value={form.discount} onChange={handleChange("discount")} placeholder="Disc %" className="w-full bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 text-sm font-black text-blue-600 outline-none" />
                  </div>
                </div>
              </section>

              <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
                <div className="flex items-center gap-3"><UploadCloud size={20} className="text-blue-400" /><h3 className="font-black uppercase tracking-widest text-sm">THUMBNAIL</h3></div>
                
                <div className="relative group cursor-pointer border-2 border-dashed border-white/20 rounded-2xl p-6 hover:border-blue-400 transition-all text-center">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  <div className="flex flex-col items-center gap-2">
                    <UploadCloud className="text-slate-400 group-hover:text-blue-400" size={30} />
                    <p className="text-[10px] font-black uppercase tracking-tighter">Click to Upload Thumbnail</p>
                  </div>
                </div>

                {previewUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/10 shadow-xl">
                    <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
                  </div>
                )}
              </section>

              <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                <div className="flex items-center gap-3"><div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><Clock size={18}/></div><h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Parameters</h3></div>
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <input type="number" value={form.duration} onChange={handleChange("duration")} placeholder="Days" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold outline-none" required />
                      <input value={form.language} onChange={handleChange("language")} placeholder="Lang" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold outline-none" required />
                   </div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Start Date</label>
                   <input type="date" value={form.startDate} onChange={handleChange("startDate")} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold outline-none" />
                </div>
              </section>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}