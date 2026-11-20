"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";

const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=]).{8,}$/;

export default function AuthForm({ mode }) {
  const router = useRouter();
  const { login } = useAuth();
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (isSignup && !PASSWORD_POLICY_REGEX.test(password)) {
        throw new Error(
          "Password must be at least 8 characters and include uppercase, lowercase, a digit, and a special character"
        );
      }

      const payload = isSignup
        ? { name: name.trim(), email: normalizedEmail, password }
        : { email: normalizedEmail, password };

      const response = await fetch(`/backend/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.token) {
        throw new Error(data.msg || (isSignup ? "Account creation failed." : "Authentication failed."));
      }

      login(data.token, data.user, data.user?.walletAddress || null);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#141618] text-[#FFFFFF] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0376C9]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-[#9FA6B2] hover:text-white transition"
          >
            <span>←</span> Back to EnergyChain
          </Link>
          <span className="badge-fox text-[10px]">Sepolia Network</span>
        </div>

        {/* Auth Card - MetaMask Container */}
        <div className="card p-7 sm:p-8 shadow-mm-hover bg-[#1E2024] border border-[#2B2E33]">
          {/* Logo icon header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F6851B] to-[#E2761B] flex items-center justify-center text-white text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {isSignup ? "Create EnergyChain Account" : "Sign in to EnergyChain"}
              </h1>
              <p className="text-xs text-[#9FA6B2]">
                {isSignup
                  ? "Register your node with 1:1 cryptographic wallet binding."
                  : "Access telemetry, bilateral agreements & P2P marketplace."}
              </p>
            </div>
          </div>

          {/* Mode Switch Pills */}
          <div className="flex bg-[#141618] p-1 rounded-full border border-[#2B2E33] mb-6">
            <Link
              href="/login"
              className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-full transition ${
                !isSignup
                  ? "bg-[#25282D] text-white shadow-sm border border-[#3B3E45]"
                  : "text-[#9FA6B2] hover:text-white"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-full transition ${
                isSignup
                  ? "bg-[#0376C9] text-white shadow-mm-glow-blue"
                  : "text-[#9FA6B2] hover:text-white"
              }`}
            >
              Create Account
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-[#EF4444]/15 border border-[#EF4444]/35 rounded-xl text-xs text-[#F87171] shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-xs font-medium text-[#9FA6B2] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121416] border border-[#2B2E33] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0376C9] transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#9FA6B2] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@energychain.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121416] border border-[#2B2E33] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0376C9] transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#9FA6B2]">Password</label>
                {isSignup && (
                  <span className="text-[10px] text-[#6A7380] font-mono">Min 8 characters</span>
                )}
              </div>
              <input
                type="password"
                required
                minLength={isSignup ? 8 : 1}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121416] border border-[#2B2E33] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0376C9] transition"
              />
              {isSignup && (
                <p className="text-[11px] text-[#9FA6B2] mt-1.5">
                  Must be at least 8 characters and include uppercase, lowercase, a digit, and a special character.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full btn btn-primary py-3 text-sm font-semibold rounded-xl shadow-mm-glow-blue flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {pending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Authenticating...
                </>
              ) : isSignup ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Micro footer */}
        <p className="text-center text-[11px] text-[#6A7380] mt-6 font-mono">
          EnergyChain Protocol • Verified Smart Contract 0x1fD069...18DA7
        </p>
      </div>
    </main>
  );
}
