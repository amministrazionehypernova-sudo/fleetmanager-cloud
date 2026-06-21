"use client";

export default function AdminResetPasswordButton() {
  return (
    <button
      type="button"
      onClick={() => alert("TEST")}
      className="px-3 py-2 text-xs font-black border border-yellow-800 text-yellow-300"
    >
      RESET PASSWORD
    </button>
  );
}