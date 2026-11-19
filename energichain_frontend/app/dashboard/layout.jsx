"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import { useWallet } from "../lib/WalletContext";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/solar", label: "Solar Power", icon: "☀️" },
  { href: "/dashboard/wind", label: "Wind Telemetry", icon: "💨", badge: "Simulated" },
  { href: "/dashboard/consumption", label: "Consumption ML", icon: "🧠" },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: "⚡" },
  { href: "/dashboard/bookings", label: "Pre-Bookings", icon: "📅" },
  { href: "/dashboard/history", label: "History & Events", icon: "📜" },
];

function shortAddr(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, walletAddress: boundWallet, isAuthenticated, authInitialized, logout } = useAuth();
  const { account, isMismatch, isSepolia, connectWallet, connecting, walletError, setWalletError } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (authInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authInitialized, isAuthenticated, router]);

  if (!authInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141618] text-[#9FA6B2] flex items-center justify-center font-mono text-sm">
        <div className="flex items-center space-x-3 bg-[#1E2024] border border-[#2B2E33] px-5 py-3 rounded-2xl shadow-mm-card">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-white font-medium">Hydrating EnergyChain Session…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141618] text-[#FFFFFF] flex">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/75 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 240px Fixed Sidebar - MetaMask Inspired Dark Slate */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#181A1D] border-r border-[#2B2E33] flex flex-col transition-transform duration-200 md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-5 border-b border-[#202327] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F6851B] to-[#E2761B] flex items-center justify-center text-white text-base shadow-sm group-hover:scale-105 transition-transform">
              ⚡
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                EnergyChain
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              </span>
              <span className="text-[10px] font-mono text-[#9FA6B2] uppercase tracking-wider">
                Web3 Protocol
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-[#9FA6B2] hover:text-white text-sm p-1"
          >
            ✕
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#25282D] text-white font-semibold border border-[#2B2E33] shadow-sm"
                    : "text-[#9FA6B2] hover:bg-[#1E2024] hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[#0376C9]/15 text-[#38BDF8] border border-[#0376C9]/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card - MetaMask Profile Style */}
        <div className="p-3 border-t border-[#202327]">
          <div className="p-3 rounded-xl bg-[#1E2024] border border-[#2B2E33] space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0376C9] to-[#10B981] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {user?.name?.[0] || "U"}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || "Prosumer"}
                </p>
                <p className="text-[10px] font-mono text-[#9FA6B2] truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full text-center py-1.5 text-[11px] font-semibold text-[#F87171] hover:bg-[#EF4444]/15 rounded-lg border border-transparent hover:border-[#EF4444]/30 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-60 flex flex-col min-h-screen">
        {/* Sticky Top Bar - MetaMask Style */}
        <header className="h-16 sticky top-0 z-30 bg-[#181A1D]/90 backdrop-blur-md border-b border-[#2B2E33] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#9FA6B2] hover:text-white border border-[#2B2E33]"
              aria-label="Toggle Navigation"
            >
              ☰
            </button>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#9FA6B2]">
              <span className="text-[#6A7380]">WORKSPACE</span>
              <span className="text-[#6A7380]">/</span>
              <span className="text-white font-medium capitalize">
                {pathname.replace("/dashboard", "").replace("/", "") || "Overview"}
              </span>
            </div>
          </div>

          {/* Right Action Controls: MetaMask Pills */}
          <div className="flex items-center space-x-2.5">
            {/* Network Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#1E2024] border border-[#2B2E33] text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="hidden sm:inline font-medium">Sepolia Testnet</span>
              <span className="sm:hidden font-medium">Sepolia</span>
            </div>

            {/* Wallet Pill - MetaMask Inspired */}
            {account ? (
              boundWallet ? (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border shadow-sm transition ${
                    isMismatch
                      ? "bg-[#EF4444]/15 border-[#EF4444]/40 text-[#F87171]"
                      : "bg-[#1E2024] border-[#2B2E33] text-white hover:border-[#3B3E45]"
                  }`}
                  title={isMismatch ? `Bound to ${boundWallet}` : `Verified 1:1 bound wallet: ${boundWallet}`}
                >
                  <span className="text-sm">🦊</span>
                  <span className="font-semibold">{shortAddr(account)}</span>
                  {isMismatch ? (
                    <span className="text-[10px] font-sans font-bold uppercase text-[#F87171] px-1.5 py-0.2 rounded bg-[#EF4444]/20">
                      Mismatch
                    </span>
                  ) : (
                    <span className="text-[10px] font-sans font-bold uppercase text-[#34D399] px-1.5 py-0.2 rounded bg-[#10B981]/20">
                      Bound
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="px-3.5 py-1 rounded-full text-xs font-semibold text-white bg-[#0376C9] hover:bg-[#1098FC] border border-white/20 transition-all flex items-center gap-1.5 shadow-mm-glow-blue"
                  title="Click to sign challenge and bind this wallet to your account"
                >
                  <span className="text-sm">🦊</span>
                  <span className="font-mono">{shortAddr(account)}</span>
                  <span className="text-[10px] font-mono bg-white/25 px-2 py-0.5 rounded-full font-bold">
                    {connecting ? "Signing..." : "Click to Bind"}
                  </span>
                </button>
              )
            ) : (
              <button
                onClick={connectWallet}
                disabled={connecting}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#F6851B] hover:bg-[#E2761B] border border-white/20 transition-all flex items-center gap-1.5 shadow-mm-glow"
              >
                <span className="text-sm">🦊</span>
                <span>{connecting ? "Connecting…" : "Connect MetaMask"}</span>
              </button>
            )}
          </div>
        </header>

        {/* Wallet Error Alert Banner */}
        {walletError && (
          <div className="bg-[#EF4444]/15 border-b border-[#EF4444]/35 px-6 py-2.5 text-xs text-[#F87171] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold">⚠️ Notice:</span>
              <span>{walletError}</span>
            </div>
            <button
              onClick={() => setWalletError("")}
              className="text-xs text-[#9FA6B2] hover:text-white ml-3 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Mismatch Warning Alert Banner */}
        {isMismatch && (
          <div className="bg-[#EF4444]/15 border-b border-[#EF4444]/35 px-6 py-2.5 text-xs text-[#F87171] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold">⚠️ Security Notice:</span>
              <span>
                MetaMask is set to <span className="font-mono font-bold text-white">{shortAddr(account)}</span>, but this account is bound to <span className="font-mono font-bold text-white">{shortAddr(boundWallet)}</span>.
              </span>
            </div>
            <button
              onClick={connectWallet}
              className="text-xs underline font-semibold text-white hover:text-[#38BDF8] ml-3"
            >
              Switch Account in MetaMask
            </button>
          </div>
        )}

        {/* Page View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
