"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../lib/AuthContext";
import { api } from "../../lib/api";

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create booking modal / form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    providerEmail: "",
    energyUnits: "50",
    scheduledFor: "",
    pricePerUnit: "0.001",
  });
  const [submitting, setSubmitting] = useState(false);

  // Active chat state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Set default scheduled time to 24 hours from now
  useEffect(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const isoString = tomorrow.toISOString().slice(0, 16);
    setCreateForm((prev) => ({ ...prev, scheduledFor: isoString }));
  }, []);

  // Fetch all user's bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api("/bookings");
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setError(err.message || "Failed to load pre-bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Load chat messages when a booking is selected
  const loadMessages = useCallback(async (bookingId) => {
    try {
      setLoadingChat(true);
      const res = await api(`/bookings/${bookingId}/messages`);
      setMessages(res.messages || []);
    } catch (err) {
      console.error("Failed loading chat messages:", err);
    } finally {
      setLoadingChat(false);
    }
  }, []);

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    loadMessages(booking.id);
  };

  // Submit Create Booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const units = parseFloat(createForm.energyUnits);
      const price = parseFloat(createForm.pricePerUnit);
      const date = new Date(createForm.scheduledFor);

      if (!createForm.providerEmail.trim()) {
        throw new Error("Provider email is required.");
      }
      if (isNaN(units) || units <= 0) {
        throw new Error("Energy units must be greater than zero.");
      }
      if (isNaN(price) || price < 0) {
        throw new Error("Price per unit must be non-negative.");
      }
      if (isNaN(date.getTime()) || date <= new Date()) {
        throw new Error("Scheduled delivery time must be in the future.");
      }

      const res = await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          providerEmail: createForm.providerEmail.trim().toLowerCase(),
          energyUnits: units,
          scheduledFor: date.toISOString(),
          pricePerUnit: price,
        }),
      });

      setSuccess("Pre-booking successfully created!");
      setShowCreateModal(false);
      fetchBookings();
      if (res.booking) {
        handleSelectBooking(res.booking);
      }
    } catch (err) {
      setError(err.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  // Update Status (Confirm / Cancel)
  const handleStatusUpdate = async (bookingId, status) => {
    try {
      setError("");
      setSuccess("");
      await api(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setSuccess(`Booking marked as ${status}.`);
      fetchBookings();
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      setError(err.message || `Failed to update status to ${status}.`);
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      await api(`/bookings/${selectedBooking.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body: newMessage.trim() }),
      });
      setNewMessage("");
      loadMessages(selectedBooking.id);
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - MetaMask Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2E33]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>📅</span> Forward Pre-Bookings
            </h1>
            <span className="badge-wind text-[11px]">Bilateral Contracts</span>
          </div>
          <p className="text-xs sm:text-sm text-[#9FA6B2] mt-1">
            Schedule future renewable deliveries directly between producer and consumer nodes with integrated settlement logs.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary px-4 py-2 text-xs font-semibold rounded-full shadow-mm-glow-blue flex items-center gap-1.5"
        >
          <span>+</span> Create Pre-Booking
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 bg-[#EF4444]/15 border border-[#EF4444]/35 rounded-xl text-xs text-[#F87171] flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-[#9FA6B2] hover:text-white font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-[#10B981]/15 border border-[#10B981]/35 rounded-xl text-xs text-[#34D399] flex items-center justify-between shadow-sm">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="text-[#9FA6B2] hover:text-white font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Bookings Table + Chat Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bookings List (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
                Active & Past Schedules ({bookings.length})
              </h3>
              <button
                onClick={fetchBookings}
                disabled={loading}
                className="text-xs font-mono text-[#38BDF8] hover:underline disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16 text-[#9FA6B2]">Loading pre-bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-[#9FA6B2] border border-dashed border-[#2B2E33] rounded-2xl bg-[#141618]/50">
                No forward bookings found. Create one to lock in clean energy rates in advance.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const isSelected = selectedBooking?.id === b.id;
                  const isProvider = b.providerId === user?.id;

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBooking(b)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#25282D] border-[#0376C9] shadow-mm-glow-blue"
                          : "bg-[#141618] border-[#2B2E33] hover:border-[#3B3E45] hover:bg-[#1E2024]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">
                              Booking #{b.id}
                            </span>
                            <span
                              className={`badge ${
                                b.status === "confirmed"
                                  ? "badge-success"
                                  : b.status === "cancelled"
                                  ? "badge-danger"
                                  : "badge-solar"
                              }`}
                            >
                              ● {b.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#25282D] text-[#9FA6B2] border border-[#2B2E33]">
                              {isProvider ? "Provider Node" : "Customer Node"}
                            </span>
                          </div>
                          <p className="text-xs text-[#9FA6B2] mt-1.5 font-mono">
                            {isProvider ? (
                              <>
                                Counterparty: <strong className="text-white">{b.customer?.name || b.customer?.email}</strong>
                              </>
                            ) : (
                              <>
                                Counterparty: <strong className="text-white">{b.provider?.name || b.provider?.email}</strong>
                              </>
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-[#38BDF8] block">
                            {b.totalPrice} ETH
                          </span>
                          <span className="text-[11px] text-[#9FA6B2] font-mono">
                            {b.energyUnits} kWh @ {b.pricePerUnit} ETH
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#2B2E33]/60 text-xs text-[#9FA6B2]">
                        <div className="font-mono text-[11px]">
                          <span>Delivery: </span>
                          <span className="text-white font-medium">
                            {new Date(b.scheduledFor).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {b.status === "pending" && (
                            <>
                              {isProvider && (
                                <button
                                  onClick={() => handleStatusUpdate(b.id, "confirmed")}
                                  className="btn btn-primary py-1 px-3 text-[11px] rounded-full"
                                >
                                  Confirm
                                </button>
                              )}
                              <button
                                onClick={() => handleStatusUpdate(b.id, "cancelled")}
                                className="btn btn-danger py-1 px-3 text-[11px] rounded-full"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleSelectBooking(b)}
                            className="text-[#38BDF8] hover:underline text-[11px] font-mono font-semibold"
                          >
                            Open Chat →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bilateral Chat Pane (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-6 h-full flex flex-col justify-between min-h-[520px]">
            <div>
              <div className="pb-3 border-b border-[#2B2E33] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
                    Agreement Coordination
                  </h3>
                  <p className="text-xs text-white font-medium mt-0.5">
                    {selectedBooking
                      ? `Coordination for Booking #${selectedBooking.id}`
                      : "Select a booking to view telemetry & chat"}
                  </p>
                </div>
                {selectedBooking && (
                  <span className="font-mono text-xs text-[#38BDF8] bg-[#0376C9]/15 px-2.5 py-0.5 rounded-full border border-[#0376C9]/30">
                    {messages.length} messages
                  </span>
                )}
              </div>

              {/* Message thread */}
              <div className="py-4 space-y-3 max-h-[380px] overflow-y-auto">
                {!selectedBooking ? (
                  <div className="text-center py-20 text-xs text-[#9FA6B2]">
                    Select any pre-booking on the left to review telemetry logs, scheduling adjustments, or communicate with the counterparty.
                  </div>
                ) : loadingChat ? (
                  <div className="text-center py-20 text-xs text-[#9FA6B2]">
                    Loading message history...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-20 text-xs text-[#9FA6B2]">
                    No messages yet. Send a note to discuss delivery schedules or physical inverter handshake.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSelf = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[11px] font-medium text-[#9FA6B2]">
                            {isSelf ? "You" : m.sender?.name || m.sender?.email || "Peer"}
                          </span>
                          <span className="text-[10px] text-[#6A7380] font-mono">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                            isSelf
                              ? "bg-[#0376C9] text-white rounded-br-none shadow-sm"
                              : "bg-[#25282D] text-white rounded-bl-none border border-[#2B2E33]"
                          }`}
                        >
                          {m.body}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Input */}
            {selectedBooking && (
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#2B2E33]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message (e.g. Inverter ready for delivery)..."
                    maxLength={2000}
                    className="flex-1 bg-[#121416] border border-[#2B2E33] text-white rounded-full px-4 py-2 text-xs focus:outline-none focus:border-[#0376C9]"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="btn btn-primary px-4 py-2 text-xs rounded-full shadow-mm-glow-blue disabled:opacity-50"
                  >
                    {sendingMessage ? "..." : "Send"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 max-w-md w-full bg-[#1E2024] border border-[#2B2E33] shadow-mm-hover">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2E33]">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📅</span> Create Renewable Pre-Booking
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#9FA6B2] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                  Energy Provider Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="provider@energychain.io"
                  value={createForm.providerEmail}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, providerEmail: e.target.value })
                  }
                  className="w-full bg-[#121416] border border-[#2B2E33] text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#0376C9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                    Energy Units (kWh)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={createForm.energyUnits}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, energyUnits: e.target.value })
                    }
                    className="w-full bg-[#121416] border border-[#2B2E33] text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#0376C9] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                    Price / Unit (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    required
                    value={createForm.pricePerUnit}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, pricePerUnit: e.target.value })
                    }
                    className="w-full bg-[#121416] border border-[#2B2E33] text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#0376C9] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                  Scheduled Delivery Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={createForm.scheduledFor}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, scheduledFor: e.target.value })
                  }
                  className="w-full bg-[#121416] border border-[#2B2E33] text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#0376C9] font-mono"
                />
              </div>

              <div className="p-3.5 bg-[#141618] rounded-xl border border-[#202327] flex items-center justify-between text-xs font-mono">
                <span className="text-[#9FA6B2]">Estimated Total:</span>
                <span className="font-bold text-[#38BDF8] text-sm">
                  {(
                    (parseFloat(createForm.energyUnits) || 0) *
                    (parseFloat(createForm.pricePerUnit) || 0)
                  ).toFixed(6)}{" "}
                  ETH
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary text-xs py-2 px-4 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary text-xs py-2 px-5 rounded-full shadow-mm-glow-blue disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
