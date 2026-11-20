"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useAuth } from "../../lib/AuthContext";
import { useWallet } from "../../lib/WalletContext";

export default function MarketplacePage() {
  const { user } = useAuth();
  const {
    account,
    boundWallet,
    isBound,
    isMismatch,
    isSepolia,
    contractAddress,
    connectWallet,
    getSignerContract,
    getReadOnlyContract,
  } = useWallet();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMyOffers, setFilterMyOffers] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [txMessage, setTxMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Create offer form
  const [offerPrice, setOfferPrice] = useState("0.01");

  // User hash for contract
  const userHash = React.useMemo(() => {
    if (!user?.email) return ethers.ZeroHash;
    return ethers.keccak256(ethers.toUtf8Bytes(user.email));
  }, [user]);

  // Fetch offers
  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const contract = await getReadOnlyContract();
      const countBig = await contract.getOfferCount();
      const count = Number(countBig);

      const items = [];
      for (let i = 0; i < count; i++) {
        try {
          const [uHash, priceBig, timestampBig, active] = await contract.getOffer(i);
          const owner = await contract.getOwnerAddress(i);
          items.push({
            id: i,
            userHash: uHash,
            priceWei: priceBig,
            priceEth: ethers.formatEther(priceBig),
            timestamp: Number(timestampBig) * 1000,
            active,
            owner,
          });
        } catch (itemErr) {
          console.warn(`Failed reading offer ${i}:`, itemErr);
        }
      }
      setOffers(items.reverse()); // latest first
    } catch (err) {
      console.warn("Unable to read on-chain offers directly:", err.message);
      setErrorMessage(
        "Could not load live on-chain offers directly. Ensure MetaMask is connected to Sepolia or network is reachable."
      );
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  useEffect(() => {
    if (contractAddress) {
      fetchOffers();
    }
  }, [contractAddress, fetchOffers]);

  // Handle Create Offer
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setTxMessage("");

    const priceNum = parseFloat(offerPrice);
    if (isNaN(priceNum) || priceNum < 0.01) {
      setErrorMessage("Minimum offer price on Sepolia contract is 0.01 ETH.");
      return;
    }

    if (!account) {
      setErrorMessage("Please connect your MetaMask wallet first.");
      return;
    }
    if (!boundWallet) {
      setErrorMessage("Please bind your wallet to your account using 'Click to Bind' in the top bar before creating listings.");
      return;
    }
    if (isMismatch) {
      setErrorMessage("Wallet mismatch! Connect your permanently bound wallet.");
      return;
    }
    if (!isSepolia) {
      setErrorMessage("Please switch MetaMask network to Sepolia.");
      return;
    }

    try {
      setTxPending(true);
      setTxMessage("Preparing transaction...");
      const contract = await getSignerContract();

      const priceWei = ethers.parseEther(offerPrice.toString());
      setTxMessage("Please confirm transaction in MetaMask...");

      // Support legacy active Sepolia contract while providing forward-compatible escrow calls
      const createFn = contract["createOffer(bytes32,uint256)"] || contract.createOffer;
      const tx = await createFn(userHash, priceWei);
      setTxMessage(`Transaction submitted: ${tx.hash.slice(0, 10)}... Waiting for block confirmation...`);
      await tx.wait(1);

      setTxMessage("Offer successfully published to Sepolia blockchain!");
      fetchOffers();
    } catch (err) {
      console.error("Create offer error:", err);
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setErrorMessage("Transaction rejected by user in MetaMask.");
      } else {
        setErrorMessage(err.reason || err.message || "Failed to create offer.");
      }
    } finally {
      setTxPending(false);
    }
  };

  // Handle Accept (Buy) Offer
  const handleAcceptOffer = async (offer) => {
    setErrorMessage("");
    setTxMessage("");

    if (!account) {
      setErrorMessage("Please connect your MetaMask wallet to buy energy.");
      return;
    }
    if (!boundWallet) {
      setErrorMessage("Please bind your wallet using 'Click to Bind' before buying energy.");
      return;
    }
    if (isMismatch) {
      setErrorMessage("Wallet mismatch! Switch to your permanently bound account.");
      return;
    }
    if (!isSepolia) {
      setErrorMessage("Please switch MetaMask to Sepolia testnet.");
      return;
    }

    try {
      setTxPending(true);
      setTxMessage(`Simulating purchase for Offer #${offer.id}...`);

      const contract = await getSignerContract();
      const provider = contract.runner.provider;
      const balance = await provider.getBalance(account);

      if (balance < offer.priceWei) {
        throw new Error(
          `Insufficient Sepolia ETH. Required: ${offer.priceEth} ETH, Available: ${parseFloat(ethers.formatEther(balance)).toFixed(4)} ETH`
        );
      }

      // Pre-flight simulation
      try {
        await contract.acceptOffer.staticCall(offer.id, { value: offer.priceWei });
      } catch (simErr) {
        throw new Error(`Simulation failed: ${simErr.reason || simErr.message || "Offer not purchasable"}`);
      }

      setTxMessage("Please confirm purchase in MetaMask...");
      const tx = await contract.acceptOffer(offer.id, { value: offer.priceWei });
      setTxMessage(`Transaction sent: ${tx.hash.slice(0, 10)}... Confirming...`);
      await tx.wait(1);

      setTxMessage(`Purchased Offer #${offer.id} for ${offer.priceEth} ETH!`);
      fetchOffers();
    } catch (err) {
      console.error("Accept offer error:", err);
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setErrorMessage("Transaction was cancelled in MetaMask.");
      } else {
        setErrorMessage(err.reason || err.message || "Purchase failed.");
      }
    } finally {
      setTxPending(false);
    }
  };

  // Handle Cancel Offer
  const handleCancelOffer = async (offerId) => {
    setErrorMessage("");
    setTxMessage("");

    try {
      setTxPending(true);
      setTxMessage(`Cancelling Offer #${offerId}... Confirm in MetaMask.`);

      const contract = await getSignerContract();
      const tx = await contract.cancelOffer(offerId);
      setTxMessage(`Cancellation broadcast: ${tx.hash.slice(0, 10)}...`);
      await tx.wait(1);

      setTxMessage(`Offer #${offerId} cancelled.`);
      fetchOffers();
    } catch (err) {
      console.error("Cancel offer error:", err);
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setErrorMessage("Cancellation rejected in MetaMask.");
      } else {
        setErrorMessage(err.reason || err.message || "Failed to cancel offer.");
      }
    } finally {
      setTxPending(false);
    }
  };

  const displayedOffers = offers.filter((o) => {
    if (!filterMyOffers) return true;
    if (!account) return false;
    return o.owner.toLowerCase() === account.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header - MetaMask Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2B2E33]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>⚡</span> P2P Energy Marketplace
            </h1>
            <span className="badge-fox text-[11px]">Sepolia Testnet</span>
          </div>
          <p className="text-xs sm:text-sm text-[#9FA6B2] mt-1">
            Trustless on-chain trading of decentralized solar and wind energy directly through smart contracts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#1E2024] border border-[#2B2E33] px-3.5 py-2 rounded-xl shadow-sm">
          <span className="text-[#9FA6B2]">Contract:</span>
          <span className="text-[#38BDF8] font-semibold" title={contractAddress || "Loading..."}>
            {contractAddress ? `${contractAddress.slice(0, 10)}...${contractAddress.slice(-6)}` : "Loading..."}
          </span>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3.5 bg-[#EF4444]/15 border border-[#EF4444]/35 rounded-xl text-xs text-[#F87171] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="text-[#9FA6B2] hover:text-white font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {txMessage && (
        <div className="p-3.5 bg-[#10B981]/15 border border-[#10B981]/35 rounded-xl text-xs text-[#34D399] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{txMessage}</span>
          </div>
          <button onClick={() => setTxMessage("")} className="text-[#9FA6B2] hover:text-white font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* Grid: Create Offer + Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Offer Panel - MetaMask Card */}
        <div className="lg:col-span-1 card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
                Create Energy Listing
              </h3>
              <span className="text-sm">⚡</span>
            </div>
            <p className="text-xs text-[#9FA6B2] mb-4">
              Publish an active offer on Sepolia. Buyers settle atomically in ETH via smart contract.
            </p>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                  Producer Hash (Auto-derived)
                </label>
                <div className="font-mono text-xs text-[#9FA6B2] bg-[#121416] px-3.5 py-2.5 rounded-xl border border-[#2B2E33] truncate">
                  {userHash}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                  Price (ETH) — Min: 0.01 ETH
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.005"
                    min="0.01"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    required
                    className="w-full bg-[#121416] border border-[#2B2E33] text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0376C9] font-mono"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-[#9FA6B2] font-mono">ETH</span>
                </div>

                {/* MetaMask Style Quick Amount Pills */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-[#6A7380] uppercase font-mono mr-1">Presets:</span>
                  {["0.01", "0.02", "0.05", "0.10"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setOfferPrice(preset)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition ${
                        offerPrice === preset
                          ? "bg-[#0376C9]/25 border-[#0376C9] text-white font-bold"
                          : "bg-[#141618] border-[#2B2E33] text-[#9FA6B2] hover:text-white"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={txPending || !account || isMismatch || !isSepolia}
                className="w-full btn btn-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl shadow-mm-glow-blue disabled:opacity-50"
              >
                {txPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Broadcasting...
                  </>
                ) : (
                  "Publish Offer to Chain"
                )}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-4 border-t border-[#2B2E33] text-xs font-mono">
            {!account ? (
              <p className="text-[#F59E0B]">MetaMask not connected. Connect wallet in top right to list energy.</p>
            ) : !boundWallet ? (
              <p className="text-[#0376C9]">Click 'Click to Bind' in the top bar to verify wallet identity.</p>
            ) : isMismatch ? (
              <p className="text-[#EF4444]">Switch MetaMask to your bound wallet to create offers.</p>
            ) : !isSepolia ? (
              <p className="text-[#F59E0B]">Switch MetaMask network to Ethereum Sepolia.</p>
            ) : (
              <p className="text-[#34D399]">Ready to broadcast on Sepolia with verified wallet.</p>
            )}
          </div>
        </div>

        {/* Market Stats & Protocol Rules */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
              Marketplace Integrity & Safety
            </h3>
            <span className="text-xs font-mono text-white bg-[#141618] px-2.5 py-1 rounded-full border border-[#2B2E33]">
              {offers.length} Total Offers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <div className="p-4 bg-[#141618] rounded-xl border border-[#202327]">
              <span className="text-[11px] font-mono text-[#9FA6B2] block uppercase">Active Listings</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">
                {offers.filter((o) => o.active).length}
              </span>
            </div>
            <div className="p-4 bg-[#141618] rounded-xl border border-[#202327]">
              <span className="text-[11px] font-mono text-[#9FA6B2] block uppercase">Minimum Ticket</span>
              <span className="text-2xl font-bold font-mono text-[#38BDF8] mt-1 block">0.010 ETH</span>
            </div>
            <div className="p-4 bg-[#141618] rounded-xl border border-[#202327]">
              <span className="text-[11px] font-mono text-[#9FA6B2] block uppercase">Settlement</span>
              <span className="text-2xl font-bold font-mono text-[#34D399] mt-1 block">Non-Reentrant</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#9FA6B2] bg-[#141618] p-4 rounded-xl border border-[#202327]">
            <p className="flex items-start gap-2.5">
              <span className="text-[#0376C9] font-bold font-mono">01.</span>
              <span><strong>Atomic Settlement:</strong> When a buyer accepts an offer, ETH is transferred directly to the seller address in the same EVM transaction.</span>
            </p>
            <p className="flex items-start gap-2.5">
              <span className="text-[#0376C9] font-bold font-mono">02.</span>
              <span><strong>Pre-flight Simulation:</strong> Before broadcasting, client simulates execution via <code className="text-[#38BDF8] bg-black/30 px-1 py-0.5 rounded">eth_call (staticCall)</code> to ensure funds and state validity.</span>
            </p>
            <p className="flex items-start gap-2.5">
              <span className="text-[#0376C9] font-bold font-mono">03.</span>
              <span><strong>Seller Protection:</strong> Only the original offer creator address may cancel active listings.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Orderbook Table - MetaMask Style */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
              Orderbook & Active Offers
            </h3>
            <button
              onClick={fetchOffers}
              disabled={loading}
              className="text-xs font-mono text-[#38BDF8] hover:underline disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-[#9FA6B2] flex items-center gap-2 cursor-pointer bg-[#141618] px-3 py-1.5 rounded-full border border-[#2B2E33]">
              <input
                type="checkbox"
                checked={filterMyOffers}
                onChange={(e) => setFilterMyOffers(e.target.checked)}
                className="rounded border-[#2B2E33] bg-[#141618] text-[#0376C9]"
              />
              Show only my offers
            </label>
          </div>
        </div>

        {displayedOffers.length === 0 ? (
          <div className="text-center py-16 text-[#9FA6B2] border border-dashed border-[#2B2E33] rounded-xl bg-[#141618]/50">
            {loading ? "Loading on-chain offers..." : "No offers found matching current filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Seller Address</th>
                  <th>User Hash</th>
                  <th>Price</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedOffers.map((offer) => {
                  const isOwner =
                    account && offer.owner.toLowerCase() === account.toLowerCase();

                  return (
                    <tr key={offer.id}>
                      <td className="font-mono text-xs font-bold text-white">
                        #{offer.id}
                      </td>
                      <td className="font-mono text-xs text-[#9FA6B2]">
                        <span title={offer.owner} className="text-white">
                          {offer.owner.slice(0, 6)}...{offer.owner.slice(-4)}
                        </span>
                        {isOwner && (
                          <span className="ml-2 px-1.5 py-0.2 rounded-full bg-[#0376C9]/20 text-[#38BDF8] border border-[#0376C9]/30 text-[10px] font-bold">
                            You
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-xs text-[#6A7380]">
                        <span title={offer.userHash}>
                          {offer.userHash.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="font-mono text-xs font-bold text-[#38BDF8]">
                        {offer.priceEth} ETH
                      </td>
                      <td className="text-xs text-[#9FA6B2] font-mono">
                        {offer.timestamp > 0
                          ? new Date(offer.timestamp).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </td>
                      <td>
                        {offer.active ? (
                          <span className="badge-success">● Active</span>
                        ) : (
                          <span className="badge-neutral">Settled</span>
                        )}
                      </td>
                      <td className="text-right">
                        {offer.active ? (
                          isOwner ? (
                            <button
                              onClick={() => handleCancelOffer(offer.id)}
                              disabled={txPending}
                              className="btn btn-danger py-1 px-3 text-xs rounded-full"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAcceptOffer(offer)}
                              disabled={txPending || !account || isMismatch || !isSepolia}
                              className="btn btn-primary py-1 px-3.5 text-xs rounded-full shadow-mm-glow-blue disabled:opacity-50"
                            >
                              Buy Energy
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-[#6A7380] font-mono italic">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
