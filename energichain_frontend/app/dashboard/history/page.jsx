"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "../../lib/WalletContext";

export default function HistoryPage() {
  const { contractAddress, getReadOnlyContract } = useWallet();

  const [activeTab, setActiveTab] = useState("live"); // 'live' | 'legacy'
  const [liveEvents, setLiveEvents] = useState([]);
  const [legacyOffers, setLegacyOffers] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [loadingLegacy, setLoadingLegacy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch Live On-Chain OfferAccepted Events
  const fetchLiveEvents = useCallback(async () => {
    setLoadingLive(true);
    setErrorMessage("");
    try {
      const contract = await getReadOnlyContract();
      const filter = contract.filters.OfferAccepted();
      const events = await contract.queryFilter(filter, -50000);

      const parsed = await Promise.all(
        events.map(async (ev) => {
          const block = await ev.getBlock();
          return {
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber,
            offerId: Number(ev.args[0]),
            buyer: ev.args[1],
            sellerHash: ev.args[2],
            priceEth: ethers.formatEther(ev.args[3]),
            timestamp: block ? block.timestamp * 1000 : Date.now(),
          };
        })
      );

      setLiveEvents(parsed.reverse());
    } catch (err) {
      console.warn("Could not query live on-chain events:", err.message);
      setErrorMessage(
        "Direct event logs query unavailable or RPC rate-limited. Switch to Legacy Snapshot to inspect verified testnet records."
      );
    } finally {
      setLoadingLive(false);
    }
  }, [getReadOnlyContract]);

  // Fetch Legacy Snapshot
  const fetchLegacySnapshot = useCallback(async () => {
    setLoadingLegacy(true);
    try {
      const res = await fetch("/config/legacy_sepolia_energyoffer_snapshot.json");
      if (res.ok) {
        const data = await res.json();
        setLegacyOffers(data);
      }
    } catch (err) {
      console.warn("Could not load legacy snapshot:", err);
    } finally {
      setLoadingLegacy(false);
    }
  }, []);

  useEffect(() => {
    if (contractAddress) {
      fetchLiveEvents();
    }
    fetchLegacySnapshot();
  }, [contractAddress, fetchLiveEvents, fetchLegacySnapshot]);

  return (
    <div className="space-y-6">
      {/* Header - MetaMask Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2E33]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>📜</span> Settlement Audit Trail
            </h1>
            <span className="badge-solar text-[11px]">Immutable Ledger</span>
          </div>
          <p className="text-xs sm:text-sm text-[#9FA6B2] mt-1">
            Complete cryptographic record of settled energy transactions, verified buyer addresses, and historical smart contracts.
          </p>
        </div>

        {/* Tab Switch Pills (MetaMask Portfolio Style) */}
        <div className="flex items-center bg-[#141618] p-1 rounded-full border border-[#2B2E33]">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              activeTab === "live"
                ? "bg-[#0376C9] text-white shadow-mm-glow-blue"
                : "text-[#9FA6B2] hover:text-white"
            }`}
          >
            Live Sepolia Events ({liveEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("legacy")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              activeTab === "legacy"
                ? "bg-[#25282D] text-white border border-[#3B3E45] shadow-sm"
                : "text-[#9FA6B2] hover:text-white"
            }`}
          >
            Legacy Snapshot ({legacyOffers.length})
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && activeTab === "live" && (
        <div className="p-3.5 bg-[#F59E0B]/15 border border-[#F59E0B]/35 rounded-xl text-xs text-[#FBBF24] flex items-center justify-between shadow-sm">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="text-[#9FA6B2] hover:text-white font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* Tab 1: Live On-Chain Events */}
      {activeTab === "live" && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
                Settled Trades (`OfferAccepted` Events)
              </h3>
              <p className="text-xs text-[#9FA6B2] mt-0.5 font-mono">
                Contract: <span className="text-[#38BDF8]">{contractAddress || "Sepolia"}</span>
              </p>
            </div>
            <button
              onClick={fetchLiveEvents}
              disabled={loadingLive}
              className="text-xs font-mono text-[#38BDF8] hover:underline disabled:opacity-50"
            >
              {loadingLive ? "Querying..." : "↻ Refresh Events"}
            </button>
          </div>

          {loadingLive ? (
            <div className="text-center py-20 text-[#9FA6B2]">Scanning Sepolia logs for settlement events...</div>
          ) : liveEvents.length === 0 ? (
            <div className="text-center py-20 text-[#9FA6B2] border border-dashed border-[#2B2E33] rounded-2xl bg-[#141618]/50">
              <p className="font-semibold text-white mb-1">No settled trades on current contract yet</p>
              <p className="text-xs max-w-md mx-auto">
                No <code className="text-[#38BDF8]">OfferAccepted</code> event has been indexed in recent blocks for contract <code className="text-[#38BDF8]">{contractAddress}</code>. You can switch to the Legacy Snapshot tab above to inspect verified historic transactions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Offer ID</th>
                    <th>Buyer Address</th>
                    <th>Seller Hash</th>
                    <th>Settlement Price</th>
                    <th>Date / Time</th>
                    <th>Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {liveEvents.map((ev, idx) => (
                    <tr key={idx}>
                      <td className="font-mono text-xs font-bold text-white">
                        #{ev.offerId}
                      </td>
                      <td className="font-mono text-xs text-[#38BDF8]">
                        <span title={ev.buyer}>
                          {ev.buyer.slice(0, 6)}...{ev.buyer.slice(-4)}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#6A7380]">
                        <span title={ev.sellerHash}>
                          {ev.sellerHash.slice(0, 10)}...
                        </span>
                      </td>
                      <td className="font-mono text-xs font-bold text-[#34D399]">
                        {ev.priceEth} ETH
                      </td>
                      <td className="text-xs text-[#9FA6B2] font-mono">
                        {new Date(ev.timestamp).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="font-mono text-xs text-[#9FA6B2]">
                        <a
                          href={`https://sepolia.etherscan.io/tx/${ev.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#38BDF8] hover:underline flex items-center gap-1"
                        >
                          <span>{ev.txHash.slice(0, 8)}...</span>
                          <span>↗</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Legacy Snapshot Archive */}
      {activeTab === "legacy" && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
                  Historical Smart Contract Snapshot
                </h3>
                <span className="badge-neutral text-[10px]">Read-Only Archive</span>
              </div>
              <p className="text-xs text-[#9FA6B2] mt-0.5 font-mono">
                Legacy Deployments: <span className="text-white">0xe026E90518516bDEb48c9F585c16a3FFBf21fDaE</span>
              </p>
            </div>
          </div>

          {loadingLegacy ? (
            <div className="text-center py-20 text-[#9FA6B2]">Loading archive...</div>
          ) : legacyOffers.length === 0 ? (
            <div className="text-center py-20 text-[#9FA6B2]">No historical records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Legacy Contract</th>
                    <th>Seller Address</th>
                    <th>Buyer Address</th>
                    <th>Settled Value</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {legacyOffers.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono text-xs font-bold text-white">
                        #{item.id}
                      </td>
                      <td className="font-mono text-xs text-[#6A7380]">
                        <span title={item.contract}>
                          {item.contract.slice(0, 6)}...{item.contract.slice(-4)}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#9FA6B2]">
                        <span title={item.seller}>
                          {item.seller.slice(0, 6)}...{item.seller.slice(-4)}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#38BDF8]">
                        <span title={item.buyer}>
                          {item.buyer.slice(0, 6)}...{item.buyer.slice(-4)}
                        </span>
                      </td>
                      <td className="font-mono text-xs font-bold text-[#34D399]">
                        {item.priceEth} ETH
                      </td>
                      <td className="text-xs text-[#9FA6B2] font-mono">
                        {new Date(item.timestamp * 1000).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <span className="badge-success text-[10px]">{item.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
