import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#141618] text-[#FFFFFF] selection:bg-[#0376C9] selection:text-white relative overflow-hidden">
      {/* Ambient MetaMask Glow Backgrounds */}
      <div className="absolute top-[-10rem] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#0376C9]/20 via-[#F6851B]/10 to-transparent blur-[120px] pointer-events-none -z-0" />
      <div className="absolute top-[35rem] right-[-10rem] w-[500px] h-[500px] bg-[#10B981]/10 blur-[130px] pointer-events-none -z-0" />

      {/* Top Navbar */}
      <nav className="border-b border-[#2B2E33] bg-[#181A1D]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F6851B] to-[#E2761B] flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-orange-500/20">
              ⚡
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                EnergyChain
              </span>
              <span className="badge badge-fox text-[10px] font-mono">
                Sepolia Testnet
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-[#9FA6B2]">
            <Link href="#features" className="hover:text-white transition">
              Protocol
            </Link>
            <Link href="#architecture" className="hover:text-white transition">
              Architecture
            </Link>
            <Link href="#security" className="hover:text-white transition">
              Security
            </Link>
            <a
              href="https://sepolia.etherscan.io/address/0x1fD069E2a2eF49EE4FAf2c5C168c92f938118DA7"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#38BDF8] transition font-mono text-xs flex items-center gap-1"
            >
              Contract ↗
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#9FA6B2] hover:text-white px-3 py-2 rounded-full hover:bg-[#1E2024] transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn btn-primary btn-pill text-xs py-2 px-4 shadow-lg shadow-blue-500/20"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#2B2E33] bg-[#1E2024] text-xs font-mono text-[#38BDF8] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              MetaMask Web3 Escrow • Ethereum Sepolia
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Decentralized Clean Energy. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#FFFFFF] via-[#38BDF8] to-[#10B981] bg-clip-text text-transparent">
                Settled Directly with MetaMask.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#9FA6B2] max-w-2xl leading-relaxed">
              EnergyChain bridges physical microgrid telemetry, edge AI load forecasting, and bilateral forward delivery agreements with atomic on-chain settlement on Ethereum.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/signup"
                className="btn btn-primary btn-pill text-sm py-3 px-6 shadow-xl shadow-blue-600/25 flex items-center gap-2 font-bold"
              >
                <span>Connect & Trade</span>
                <span>→</span>
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-secondary btn-pill text-sm py-3 px-6 text-white hover:bg-[#2D3137]"
              >
                Explore Live Dashboard
              </Link>
            </div>

            {/* Architecture Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#2B2E33]">
              <div>
                <span className="block text-2xl font-bold font-mono text-white">
                  1:1
                </span>
                <span className="text-xs text-[#9FA6B2]">
                  EIP-191 Wallet Identity
                </span>
              </div>
              <div>
                <span className="block text-2xl font-bold font-mono text-[#10B981]">
                  0.010 ETH
                </span>
                <span className="text-xs text-[#9FA6B2]">
                  Min Verified Ticket
                </span>
              </div>
              <div>
                <span className="block text-2xl font-bold font-mono text-[#38BDF8]">
                  &lt; 15s
                </span>
                <span className="text-xs text-[#9FA6B2]">
                  Sepolia Escrow Finality
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: MetaMask Portfolio-Style Live Energy Widget */}
          <div className="lg:col-span-5">
            <div className="card p-6 bg-[#1E2024] border border-[#2B2E33] shadow-2xl relative rounded-2xl">
              {/* Card Header with Network Pill */}
              <div className="flex items-center justify-between pb-4 border-b border-[#2B2E33]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#F6851B]/20 border border-[#F6851B]/40 flex items-center justify-center text-xs">
                    🦊
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Node 0xda32...B0F5</span>
                    <span className="text-[10px] text-[#9FA6B2] block">Verified Microgrid Node</span>
                  </div>
                </div>
                <span className="badge badge-success text-[10px] font-mono">
                  ● Sepolia Live
                </span>
              </div>

              {/* Big Portfolio Balance Readout */}
              <div className="py-6 text-center">
                <span className="text-xs uppercase tracking-wider text-[#9FA6B2] font-semibold block mb-1">
                  Active Energy Reserve
                </span>
                <div className="text-4xl font-extrabold font-mono tracking-tight text-white">
                  42.8 <span className="text-xl text-[#34D399]">kWh</span>
                </div>
                <span className="text-xs text-[#9FA6B2] font-mono mt-1 block">
                  ≈ 0.0428 SepoliaETH ($142.10)
                </span>
              </div>

              {/* 4 Circular Action Buttons (MetaMask Portfolio Style) */}
              <div className="grid grid-cols-4 gap-2 pb-6 border-b border-[#2B2E33]">
                <Link
                  href="/dashboard/marketplace"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-11 h-11 rounded-full bg-[#25282D] border border-[#2B2E33] group-hover:border-[#0376C9] group-hover:bg-[#0376C9] group-hover:text-white text-[#9FA6B2] flex items-center justify-center transition shadow-sm">
                    ⚡
                  </div>
                  <span className="text-[11px] font-semibold text-[#9FA6B2] group-hover:text-white">
                    Trade
                  </span>
                </Link>

                <Link
                  href="/dashboard/bookings"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-11 h-11 rounded-full bg-[#25282D] border border-[#2B2E33] group-hover:border-[#F6851B] group-hover:bg-[#F6851B] group-hover:text-white text-[#9FA6B2] flex items-center justify-center transition shadow-sm">
                    📅
                  </div>
                  <span className="text-[11px] font-semibold text-[#9FA6B2] group-hover:text-white">
                    Pre-Book
                  </span>
                </Link>

                <Link
                  href="/dashboard/consumption"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-11 h-11 rounded-full bg-[#25282D] border border-[#2B2E33] group-hover:border-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white text-[#9FA6B2] flex items-center justify-center transition shadow-sm">
                    🧠
                  </div>
                  <span className="text-[11px] font-semibold text-[#9FA6B2] group-hover:text-white">
                    AI Predict
                  </span>
                </Link>

                <Link
                  href="/dashboard/history"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-11 h-11 rounded-full bg-[#25282D] border border-[#2B2E33] group-hover:border-[#10B981] group-hover:bg-[#10B981] group-hover:text-white text-[#9FA6B2] flex items-center justify-center transition shadow-sm">
                    📜
                  </div>
                  <span className="text-[11px] font-semibold text-[#9FA6B2] group-hover:text-white">
                    Ledger
                  </span>
                </Link>
              </div>

              {/* Protocol Spec Rows */}
              <div className="space-y-2 pt-4 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141618] border border-[#2B2E33]">
                  <span className="text-[#9FA6B2] text-[11px]">Smart Contract:</span>
                  <span className="text-[#38BDF8] text-[11px]">0x1fD0...18DA7</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141618] border border-[#2B2E33]">
                  <span className="text-[#9FA6B2] text-[11px]">Escrow Mode:</span>
                  <span className="text-white text-[11px] font-semibold">Non-Reentrant Atomic</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141618] border border-[#2B2E33]">
                  <span className="text-[#9FA6B2] text-[11px]">AI Forecasting:</span>
                  <span className="text-[#FBBF24] text-[11px]">Scikit-Learn (1k Profiles)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="border-t border-[#2B2E33] bg-[#181A1D]/60 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge badge-fox text-[11px] mb-3">
              Web3 Decentralized Architecture
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Engineered for Trustless Edge Energy
            </h2>
            <p className="text-sm text-[#9FA6B2] mt-3 leading-relaxed">
              Eliminate centralized energy broker fees with atomic smart contracts, machine learning demand forecasts, and cryptographic wallet binding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 bg-[#1E2024] border border-[#2B2E33] rounded-2xl hover:border-[#0376C9] transition">
              <div className="w-10 h-10 rounded-xl bg-[#0376C9]/15 border border-[#0376C9]/30 flex items-center justify-center text-lg mb-4 text-[#38BDF8]">
                🔒
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                EIP-191 Wallet Identity
              </h3>
              <p className="text-xs text-[#9FA6B2] leading-relaxed">
                PostgreSQL accounts are bound to MetaMask addresses through server-verified cryptographic signatures. Account swapping and Sybil listing are blocked at the middleware layer.
              </p>
            </div>

            <div className="card p-6 bg-[#1E2024] border border-[#2B2E33] rounded-2xl hover:border-[#10B981] transition">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-lg mb-4 text-[#34D399]">
                ⚡
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                On-Chain P2P Orderbook
              </h3>
              <p className="text-xs text-[#9FA6B2] leading-relaxed">
                Energy offers live directly on Ethereum Sepolia. Pre-flight static calls simulate every trade in MetaMask before broadcast to eliminate failed transactions and gas waste.
              </p>
            </div>

            <div className="card p-6 bg-[#1E2024] border border-[#2B2E33] rounded-2xl hover:border-[#F6851B] transition">
              <div className="w-10 h-10 rounded-xl bg-[#F6851B]/15 border border-[#F6851B]/30 flex items-center justify-center text-lg mb-4 text-[#FFA959]">
                🧠
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Predictive Consumption ML
              </h3>
              <p className="text-xs text-[#9FA6B2] leading-relaxed">
                Pre-trained Linear Regression and Random Forest models forecast facility consumption and flag grid overload warnings in real time, with explicit physical fallback estimation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contract & Security Callout */}
      <section id="security" className="py-20 border-t border-[#2B2E33]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 bg-[#1E2024] border border-[#2B2E33] rounded-2xl text-center space-y-4">
            <span className="badge badge-success text-xs font-mono">
              Verified Solidity Contract
            </span>
            <h2 className="text-2xl font-bold text-white">
              Non-Reentrant Escrow on Ethereum Sepolia
            </h2>
            <p className="text-xs sm:text-sm text-[#9FA6B2] max-w-xl mx-auto leading-relaxed">
              Energy listings and ETH escrow are executed by <code className="text-[#38BDF8] font-mono">EnergyOffer.sol</code> at address <code className="text-[#38BDF8] font-mono">0x1fD069E2a2eF49EE4FAf2c5C168c92f938118DA7</code>.
            </p>
            <div className="pt-2">
              <a
                href="https://sepolia.etherscan.io/address/0x1fD069E2a2eF49EE4FAf2c5C168c92f938118DA7"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-pill text-xs py-2.5 px-5 font-mono text-white inline-flex items-center gap-2"
              >
                <span>View on Etherscan</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2B2E33] py-8 text-center text-xs text-[#9FA6B2] bg-[#141618]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 EnergyChain Protocol • Inspired by MetaMask Web3 Design Language.</span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/dashboard/marketplace" className="hover:text-white transition">
              Marketplace
            </Link>
            <Link href="/dashboard/bookings" className="hover:text-white transition">
              Bookings
            </Link>
            <Link href="/dashboard/history" className="hover:text-white transition">
              Audit Trail
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
