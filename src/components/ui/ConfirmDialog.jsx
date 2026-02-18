import React from "react";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  description = "Are you sure?",
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={loading ? undefined : onCancel}
      />

      {/* modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200">
        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 pb-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
