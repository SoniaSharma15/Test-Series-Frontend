export const pickTextObj = (v, prefer = "EN") => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (prefer === "HI") return String(v.hindi || v.english || "").trim();
  return String(v.english || v.hindi || "").trim();
};

export const pickTextStrict = (v, lang = "EN") => {
  if (!v) return "";
  if (typeof v === "string") return v.trim();
  if (lang === "HI") return String(v.hindi || "").trim();
  return String(v.english || "").trim();
};

export const pickOptionStrict = (opt, lang = "EN") => {
  if (!opt) return "";
  if (typeof opt === "string") return opt.trim();
  if (lang === "HI") return String(opt.hindi || "").trim();
  return String(opt.english || "").trim();
};

export const normalizeOptions4 = (opts, prefer = "EN") => {
  const arr = Array.isArray(opts) ? opts : [];
  const out = arr.slice(0, 4).map((x) => {
    if (!x) return "";
    if (typeof x === "string") return x;
    return prefer === "HI"
      ? String(x.hindi || x.english || "").trim()
      : String(x.english || x.hindi || "").trim();
  });
  while (out.length < 4) out.push("");
  return out;
};

export const normalizeOptions4Strict = (opts, lang = "EN") => {
  const arr = Array.isArray(opts) ? opts : [];
  const out = arr.slice(0, 4).map((x) => pickOptionStrict(x, lang));
  while (out.length < 4) out.push("");
  return out;
};
