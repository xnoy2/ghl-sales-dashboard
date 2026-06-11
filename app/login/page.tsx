"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, BarChart3, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password: pass, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden px-4
                     bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* Animated aurora background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-300/30 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-indigo-300/30 blur-3xl animate-blob [animation-delay:6s]" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-violet-300/30 blur-3xl animate-blob [animation-delay:12s]" />
      </div>

      <div className="relative w-full max-w-sm animate-scale-in">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8 animate-slide-up stagger-1">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center
                          shadow-lg shadow-blue-600/30 animate-float">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900">GHL SalesPipeline</span>
        </div>

        <div className="card p-8 bg-white/80 backdrop-blur-sm shadow-xl shadow-slate-200/60">
          <div className="text-center mb-6 animate-slide-up stagger-2">
            <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your sales pipeline</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-slide-up stagger-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="juan@bcf.com"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                           bg-white text-slate-900 placeholder-slate-400"
              />
            </div>

            <div className="animate-slide-up stagger-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                             bg-white text-slate-900 placeholder-slate-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 animate-fade-in">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-lg
                         text-white font-medium text-sm
                         bg-gradient-to-r from-blue-600 to-indigo-600
                         hover:from-blue-700 hover:to-indigo-700
                         shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40
                         transition-all active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100
                         animate-slide-up stagger-5"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
