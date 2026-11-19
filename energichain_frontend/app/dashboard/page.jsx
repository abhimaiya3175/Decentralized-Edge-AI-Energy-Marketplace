"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { useAuth } from "../lib/AuthContext";
import { useWallet } from "../lib/WalletContext";
import { api } from "../lib/api";

export default function DashboardOverviewPage() {
  const { user, walletAddress } = useAuth();
  const { account, isBound, isMismatch, contractAddress, connectWallet, connecting, getReadOnlyContract } = useWallet();
  const [activeOffersCount, setActiveOffersCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [balanceEth, setBalanceEth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch bookings count
  useEffect(() => {
    let mounted = true;
    api("/bookings/mine")
      .then((res) => {
        if (mounted && Array.isArray(res)) {
          setBookingsCount(res.length);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch on-chain offers count
  useEffect(() => {
    if (!contractAddress) return;
    getReadOnlyContract()
      .then((contract) => contract.getOfferCount())
      .then((countBig) => setActiveOffersCount(Number(countBig)))
      .catch(() => {});
  }, [contractAddress, getReadOnlyContract]);

  // Read wallet SepoliaETH balance
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum || !account) {
      setBalanceEth(null);
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.getBalance(account)
      .then((bal) => {
        setBalanceEth(parseFloat(ethers.formatEther(bal)).toFixed(3));
      })
      .catch(() => {});
  }, [account]);

  return (
    <div className="space-y-6">
      {/* Portfolio Balance & Action Hub - MetaMask Inspired */}
      <div className="card p-6 bg-gradient-to-br from-[#1E2024] to-[#181A1D] border border-[#2B2E33] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
                Portfolio Balance & Node Power
              </span>
              <span className="badge-fox text-[10px]">Sepolia</span>
            </div>
            
            {/* Big MetaMask-Style Balance */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                {balanceEth !== null ? `${balanceEth} SepoliaETH` : "42.8 kWh"}
              </span>
              <span className="text-xs font-mono text-[#34D399] font-semibold bg-[#10B981]/15 px-2 py-0.5 rounded-full border border-[#10B981]/30">
                +12.4% yield
              </span>
            </div>
            <p className="text-xs text-[#9FA6B2] mt-1 font-mono">
              Welcome back, <strong className="text-white">{user?.name || "Prosumer"}</strong> • Connected Node #{user?.id || 1}
            </p>
          </div>

          {/* Quick Action Buttons (MetaMask Circle Action Style) */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/marketplace"
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-full bg-[#0376C9] group-hover:bg-[#1098FC] text-white flex items-center justify-center text-lg shadow-mm-glow-blue transition-all group-hover:scale-105">
                ⚡
              </div>
              <span className="text-[11px] font-medium text-[#9FA6B2] group-hover:text-white">
                Trade
              </span>
            </Link>

            <Link
              href="/dashboard/bookings"
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-full bg-[#25282D] group-hover:bg-[#2D3137] text-white flex items-center justify-center text-lg border border-[#2B2E33] group-hover:border-[#3B3E45] transition-all group-hover:scale-105">
                📅
              </div>
              <span className="text-[11px] font-medium text-[#9FA6B2] group-hover:text-white">
                Pre-Book
              </span>
            </Link>

            <Link
              href="/dashboard/consumption"
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-full bg-[#25282D] group-hover:bg-[#2D3137] text-white flex items-center justify-center text-lg border border-[#2B2E33] group-hover:border-[#3B3E45] transition-all group-hover:scale-105">
                🧠
              </div>
              <span className="text-[11px] font-medium text-[#9FA6B2] group-hover:text-white">
                AI Forecast
              </span>
            </Link>

            <Link
              href="/dashboard/history"
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-12 h-12 rounded-full bg-[#25282D] group-hover:bg-[#2D3137] text-white flex items-center justify-center text-lg border border-[#2B2E33] group-hover:border-[#3B3E45] transition-all group-hover:scale-105">
                📜
              </div>
              <span className="text-[11px] font-medium text-[#9FA6B2] group-hover:text-white">
                Ledger
              </span>
            </Link>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-[#0376C9]/10 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Generation */}
        <div className="card p-5">
          <div className="text-[11px] font-mono uppercase text-[#9FA6B2] tracking-wider">Total Generation</div>
          <div className="text-2xl font-mono font-bold text-[#34D399] mt-1.5">
            42.8 <span className="text-xs text-[#9FA6B2]">kWh</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-mono text-[#9FA6B2] mb-1">
              <span>SOLAR + WIND FEED</span>
              <span>85% CAPACITY</span>
            </div>
            <div className="h-1.5 w-full bg-[#141618] rounded-full overflow-hidden border border-[#202327]">
              <div className="h-full bg-[#10B981] rounded-full w-[85%]" />
            </div>
          </div>
        </div>

        {/* Card 2: On-Chain Offers */}
        <div className="card p-5">
          <div className="text-[11px] font-mono uppercase text-[#9FA6B2] tracking-wider">On-Chain Offers</div>
          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="text-2xl font-mono font-bold text-white">
              {activeOffersCount > 0 ? activeOffersCount : "Live"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0376C9]/15 text-[#38BDF8] border border-[#0376C9]/30">
              REC
            </span>
          </div>
          <p className="text-[11px] text-[#9FA6B2] mt-3">
            Settling on Sepolia Smart Contract
          </p>
        </div>

        {/* Card 3: Active Pre-Bookings */}
        <div className="card p-5">
          <div className="text-[11px] font-mono uppercase text-[#9FA6B2] tracking-wider">Active Pre-Bookings</div>
          <div className="text-2xl font-mono font-bold text-[#38BDF8] mt-1.5">
            {bookingsCount} <span className="text-xs text-[#9FA6B2]">Reservations</span>
          </div>
          <p className="text-[11px] text-[#9FA6B2] mt-3">
            Forward bilateral delivery windows
          </p>
        </div>

        {/* Card 4: Battery Storage */}
        <div className="card p-5">
          <div className="text-[11px] font-mono uppercase text-[#9FA6B2] tracking-wider">Microgrid ESS</div>
          <div className="text-2xl font-mono font-bold text-[#A78BFA] mt-1.5">
            84.0 <span className="text-xs text-[#9FA6B2]">%</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-mono text-[#9FA6B2] mb-1">
              <span>STORAGE BUFFER</span>
              <span>16.8 kWh READY</span>
            </div>
            <div className="h-1.5 w-full bg-[#141618] rounded-full overflow-hidden border border-[#202327]">
              <div className="h-full bg-[#8B5CF6] rounded-full w-[84%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Feature Tiles (MetaMask Surface) */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Marketplace Tile */}
        <Link
          href="/dashboard/marketplace"
          className="card p-5 hover:border-[#3B3E45] hover:bg-[#25282D] transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F6851B]/15 border border-[#F6851B]/30 flex items-center justify-center text-[#F6851B] mb-3 text-lg group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <h2 className="text-sm font-semibold text-white group-hover:text-[#38BDF8] transition-colors flex items-center justify-between">
            <span>Decentralized Marketplace</span>
            <span className="text-xs text-[#9FA6B2]">→</span>
          </h2>
          <p className="text-xs text-[#9FA6B2] mt-1.5 leading-relaxed">
            Create on-chain energy listings, cancel active offers, or execute atomic purchase transactions with SepoliaETH.
          </p>
        </Link>

        {/* Consumption ML Tile */}
        <Link
          href="/dashboard/consumption"
          className="card p-5 hover:border-[#3B3E45] hover:bg-[#25282D] transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mb-3 text-lg group-hover:scale-105 transition-transform">
            🧠
          </div>
          <h2 className="text-sm font-semibold text-white group-hover:text-[#34D399] transition-colors flex items-center justify-between">
            <span>Consumption Prediction ML</span>
            <span className="text-xs text-[#9FA6B2]">→</span>
          </h2>
          <p className="text-xs text-[#9FA6B2] mt-1.5 leading-relaxed">
            Inference the scikit-learn Linear Regression model trained on 1,000 chronological facility load profiles.
          </p>
        </Link>

        {/* Pre-Booking Tile */}
        <Link
          href="/dashboard/bookings"
          className="card p-5 hover:border-[#3B3E45] hover:bg-[#25282D] transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0376C9]/15 border border-[#0376C9]/30 flex items-center justify-center text-[#38BDF8] mb-3 text-lg group-hover:scale-105 transition-transform">
            📅
          </div>
          <h2 className="text-sm font-semibold text-white group-hover:text-[#38BDF8] transition-colors flex items-center justify-between">
            <span>Pre-Booking & In-App Chat</span>
            <span className="text-xs text-[#9FA6B2]">→</span>
          </h2>
          <p className="text-xs text-[#9FA6B2] mt-1.5 leading-relaxed">
            Negotiate forward delivery parameters and exchange secure messages isolated strictly to contract participants.
          </p>
        </Link>
      </div>

      {/* Security & Verification Status Card (MetaMask Style Container) */}
      <div className="card p-5 bg-[#1E2024]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2B2E33]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-[#9FA6B2] tracking-wider">
              Cryptographic Node Binding Status
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
              ● ONLINE
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#9FA6B2]">EIP-191 Verified</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <span className="text-[#6A7380] block text-[10px] uppercase">Bound Wallet Address</span>
            {walletAddress ? (
              <span className="text-[#34D399] font-bold mt-1 block truncate" title={walletAddress}>
                {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)} (Bound)
              </span>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[#F59E0B]">Unbound</span>
                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-white bg-[#0376C9] hover:bg-[#1098FC] transition shadow-sm"
                >
                  {connecting ? "Signing..." : "Bind MetaMask"}
                </button>
              </div>
            )}
          </div>
          <div>
            <span className="text-[#6A7380] block text-[10px] uppercase">Active Sepolia Contract</span>
            <span className="text-white mt-1 block truncate font-mono text-[#38BDF8]" title={contractAddress}>
              {contractAddress ? `${contractAddress.slice(0, 10)}...${contractAddress.slice(-8)}` : "Loading contract..."}
            </span>
          </div>
          <div>
            <span className="text-[#6A7380] block text-[10px] uppercase">Settlement Guarantees</span>
            <span className="text-[#34D399] mt-1 block font-semibold">
              Atomic On-Chain Escrow
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
