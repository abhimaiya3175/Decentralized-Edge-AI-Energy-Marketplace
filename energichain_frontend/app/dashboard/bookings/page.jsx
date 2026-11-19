"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../lib/AuthContext";
import { api, getSession } from "../../lib/api";

function getWebSocketUrl(token) {
  if (typeof window === "undefined") return "";
  const isHttps = window.location.protocol === "https:";
  const wsProto = isHttps ? "wss:" : "ws:";
  const host = window.location.hostname || "localhost";
  const explicitWs = process.env.NEXT_PUBLIC_WS_URL;
  if (explicitWs) {
    return `${explicitWs}/ws/chat?token=${encodeURIComponent(token)}`;
  }
  return `${wsProto}//${host}:5000/ws/chat?token=${encodeURIComponent(token)}`;
}

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

  // WhatsApp-like Realtime WebSocket state
  const wsRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerTypingName, setPeerTypingName] = useState("");
  const [peerOnline, setPeerOnline] = useState(false);
  const typingTimeoutRef = useRef(null);
  const peerTypingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Quick reply pills
  const quickReplies = [
    "⚡ Ready for delivery",
    "👍 Terms agreed & locked",
    "📊 Meter verified",
    "⏳ 15 min ramp-up delay",
  ];

  // Set default scheduled time to 24 hours from now
  useEffect(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const isoString = tomorrow.toISOString().slice(0, 16);
    setCreateForm((prev) => ({ ...prev, scheduledFor: isoString }));
  }, []);

  // Auto-scroll chat to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, peerTyping]);

  // Fetch all user's bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api("/bookings");
      setBookings(Array.isArray(data) ? data : []);
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

  // -------------------------------------------------------------
  // WebSocket Lifecycle & Real-Time Event Handlers
  // -------------------------------------------------------------
  useEffect(() => {
    let reconnectTimer = null;
    let isUnmounting = false;

    const connectWebSocket = () => {
      const session = getSession();
      const token = session?.token;
      if (!token) return;

      try {
        const wsUrl = getWebSocketUrl(token);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isUnmounting) return;
          setWsConnected(true);
          // If a booking is currently selected, join its room immediately
          if (selectedBooking?.id) {
            ws.send(
              JSON.stringify({
                type: "join_room",
                bookingId: selectedBooking.id,
              })
            );
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // --- New Real-Time Message Received ---
            if (data.type === "new_message") {
              if (selectedBooking && Number(data.bookingId) === Number(selectedBooking.id)) {
                setMessages((prev) => {
                  // Deduplicate in case optimistic message exists
                  const exists = prev.some(
                    (m) =>
                      m.id === data.message.id ||
                      (data.tempId && m.tempId === data.tempId)
                  );
                  if (exists) {
                    return prev.map((m) =>
                      m.tempId === data.tempId ? { ...data.message, delivered: true } : m
                    );
                  }
                  return [...prev, { ...data.message, delivered: true }];
                });

                // Clear typing indicator when message arrives
                setPeerTyping(false);

                // Send read receipt if we are not the sender
                if (data.message.senderId !== user?.id) {
                  ws.send(
                    JSON.stringify({
                      type: "read_receipt",
                      bookingId: selectedBooking.id,
                      messageIds: [data.message.id],
                    })
                  );
                }
              }
            }

            // --- Real-Time Typing Indicator (WhatsApp Style) ---
            else if (data.type === "user_typing") {
              if (selectedBooking && Number(data.bookingId) === Number(selectedBooking.id)) {
                if (data.isTyping) {
                  setPeerTyping(true);
                  setPeerTypingName(data.user?.name || "Peer");
                  // Auto clear if no follow-up within 3s
                  if (peerTypingTimeoutRef.current) clearTimeout(peerTypingTimeoutRef.current);
                  peerTypingTimeoutRef.current = setTimeout(() => {
                    setPeerTyping(false);
                  }, 3000);
                } else {
                  setPeerTyping(false);
                }
              }
            }

            // --- Real-Time Online Presence in this Room ---
            else if (data.type === "presence") {
              if (selectedBooking && Number(data.bookingId) === Number(selectedBooking.id)) {
                const active = Array.isArray(data.activeUsers) ? data.activeUsers : [];
                // Check if counterparty is online in the room
                const counterpartyId =
                  selectedBooking.customerId === user?.id
                    ? selectedBooking.providerId
                    : selectedBooking.customerId;
                const isOnline = active.some((u) => u.id === counterpartyId);
                setPeerOnline(isOnline);
              }
            }

            // --- Read Receipts (Double Blue Ticks) ---
            else if (data.type === "messages_read") {
              if (selectedBooking && Number(data.bookingId) === Number(selectedBooking.id)) {
                setMessages((prev) =>
                  prev.map((m) =>
                    data.messageIds.includes(m.id) ? { ...m, isRead: true } : m
                  )
                );
              }
            }
          } catch (parseErr) {
            console.error("WS message parse error:", parseErr);
          }
        };

        ws.onclose = () => {
          if (isUnmounting) return;
          setWsConnected(false);
          setPeerOnline(false);
          setPeerTyping(false);
          // Auto-reconnect after 2.5 seconds
          reconnectTimer = setTimeout(connectWebSocket, 2500);
        };

        ws.onerror = (err) => {
          console.warn("WebSocket connection error:", err);
          ws.close();
        };
      } catch (err) {
        console.error("Failed to initialize WebSocket:", err);
      }
    };

    connectWebSocket();

    return () => {
      isUnmounting = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, selectedBooking?.id]);

  // Load chat messages when a booking is selected
  const loadMessages = useCallback(async (bookingId) => {
    try {
      setLoadingChat(true);
      const res = await api(`/bookings/${bookingId}/messages`);
      setMessages(res.messages || []);

      // If WS is open, send join_room event
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "join_room",
            bookingId,
          })
        );
      }
    } catch (err) {
      console.error("Failed loading chat messages:", err);
    } finally {
      setLoadingChat(false);
    }
  }, []);

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    setPeerOnline(false);
    setPeerTyping(false);
    loadMessages(booking.id);
  };

  // -------------------------------------------------------------
  // Real-Time Typing Emitter (Debounced)
  // -------------------------------------------------------------
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!selectedBooking || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Emit typing = true
    wsRef.current.send(
      JSON.stringify({
        type: "typing",
        bookingId: selectedBooking.id,
        isTyping: true,
      })
    );

    // Debounce typing = false after 1.5 seconds of silence
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "typing",
            bookingId: selectedBooking.id,
            isTyping: false,
          })
        );
      }
    }, 1500);
  };

  // -------------------------------------------------------------
  // Instant WhatsApp-Style Message Send (WS with REST Fallback)
  // -------------------------------------------------------------
  const handleSendMessage = async (e, textToSend = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const text = String(textToSend || newMessage || "").trim();
    if (!selectedBooking || !text) return;

    setSendingMessage(true);
    const tempId = `temp_${Date.now()}`;

    // Optimistic UI update (Instant local display like WhatsApp)
    const optimisticMessage = {
      id: tempId,
      tempId,
      bookingId: selectedBooking.id,
      senderId: user?.id,
      body: text,
      createdAt: new Date().toISOString(),
      sender: { id: user?.id, name: user?.name, email: user?.email },
      delivered: false,
      isRead: false,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    // Stop typing indicator immediately
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "typing",
          bookingId: selectedBooking.id,
          isTyping: false,
        })
      );
    }

    try {
      // 1. Try WebSocket instant dispatch
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "send_message",
            bookingId: selectedBooking.id,
            body: text,
            tempId,
          })
        );
      } else {
        // 2. Fallback to HTTP REST
        const res = await api(`/bookings/${selectedBooking.id}/messages`, {
          method: "POST",
          body: JSON.stringify({ body: text }),
        });
        if (res.message) {
          setMessages((prev) =>
            prev.map((m) => (m.tempId === tempId ? { ...res.message, delivered: true } : m))
          );
        }
      }
    } catch (err) {
      console.error("Message send failed:", err);
      setError(err.message || "Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Header - MetaMask & WhatsApp Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2E33]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>📅</span> Forward Pre-Bookings
            </h1>
            <span className="badge-wind text-[11px]">Bilateral Contracts</span>
            {wsConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Live WebSocket
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                Connecting...
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#9FA6B2] mt-1">
            Schedule future renewable deliveries directly between producer and consumer nodes with real-time WhatsApp-style chat.
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

      {/* Main Grid: Bookings Table + WhatsApp Bilateral Chat Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bookings List (6 columns) */}
        <div className="lg:col-span-6 space-y-4">
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

        {/* WhatsApp Real-Time Bilateral Chat Pane (6 columns) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card p-0 overflow-hidden h-full flex flex-col justify-between min-h-[580px] bg-[#141618] border border-[#2B2E33] rounded-2xl shadow-2xl relative">
            
            {/* WhatsApp Chat Header */}
            <div className="px-5 py-3.5 bg-[#1E2024] border-b border-[#2B2E33] flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0376C9] to-[#10B981] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {selectedBooking ? (
                      (selectedBooking.customerId === user?.id
                        ? selectedBooking.provider?.name?.[0] || "P"
                        : selectedBooking.customer?.name?.[0] || "C")
                    ) : (
                      "💬"
                    )}
                  </div>
                  {/* WhatsApp Online Green Dot */}
                  {selectedBooking && peerOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] ring-2 ring-[#1E2024]" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedBooking ? (
                      selectedBooking.customerId === user?.id
                        ? selectedBooking.provider?.name || selectedBooking.provider?.email || "Energy Provider"
                        : selectedBooking.customer?.name || selectedBooking.customer?.email || "Energy Customer"
                    ) : (
                      "Bilateral Chat Engine"
                    )}
                  </h3>
                  <div className="text-[11px] flex items-center gap-2 mt-0.5">
                    {selectedBooking ? (
                      peerTyping ? (
                        <span className="text-[#38BDF8] font-medium flex items-center gap-1 animate-pulse">
                          <span>{peerTypingName} is typing</span>
                          <span className="inline-block animate-bounce">.</span>
                          <span className="inline-block animate-bounce delay-100">.</span>
                          <span className="inline-block animate-bounce delay-200">.</span>
                        </span>
                      ) : peerOnline ? (
                        <span className="text-[#34D399] font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                          Online in channel
                        </span>
                      ) : (
                        <span className="text-[#9FA6B2] font-mono">
                          Booking #{selectedBooking.id} • Forward Delivery
                        </span>
                      )
                    ) : (
                      <span className="text-[#6A7380]">Select a booking on the left to start live chat</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedBooking && (
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#38BDF8] block">
                    {selectedBooking.energyUnits} kWh
                  </span>
                  <span className="text-[10px] font-mono text-[#9FA6B2]">
                    @ {selectedBooking.pricePerUnit} ETH
                  </span>
                </div>
              )}
            </div>

            {/* WhatsApp Chat Canvas */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[420px] bg-[#121416]/80 bg-[radial-gradient(#202327_1px,transparent_1px)] [background-size:16px_16px]">
              {!selectedBooking ? (
                <div className="text-center py-28 text-xs text-[#9FA6B2] max-w-xs mx-auto">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="font-medium text-white">No Agreement Selected</p>
                  <p className="mt-1 text-[#6A7380]">
                    Select any pre-booking schedule on the left to coordinate delivery parameters or communicate in real time.
                  </p>
                </div>
              ) : loadingChat ? (
                <div className="text-center py-28 text-xs text-[#9FA6B2]">
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8] inline-block animate-ping mr-2" />
                  Loading message history...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 text-xs text-[#9FA6B2] max-w-xs mx-auto">
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="text-white font-medium">Bilateral Channel Initialized</p>
                  <p className="text-[#6A7380] text-[11px] mt-1">
                    Messages in this room are isolated strictly to Booking #{selectedBooking.id} participants.
                  </p>
                </div>
              ) : (
                <>
                  {/* WhatsApp Date Divider */}
                  <div className="flex justify-center my-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#1E2024] text-[#9FA6B2] border border-[#2B2E33] shadow-sm">
                      Today • Encrypted Channel
                    </span>
                  </div>

                  {messages.map((m) => {
                    const isSelf = m.senderId === user?.id;
                    const timeStr = new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={m.id || m.tempId}
                        className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-xs relative shadow-md transition-all ${
                            isSelf
                              ? "bg-[#0376C9] text-white rounded-br-none"
                              : "bg-[#1E2024] text-white rounded-bl-none border border-[#2B2E33]"
                          }`}
                        >
                          {!isSelf && (
                            <span className="block text-[10px] font-bold text-[#FFA959] mb-0.5">
                              {m.sender?.name || m.sender?.email || "Peer"}
                            </span>
                          )}

                          <p className="break-words leading-relaxed text-sm">{m.body}</p>

                          <div className="flex items-center justify-end gap-1.5 mt-1 pt-0.5">
                            <span className="text-[10px] text-white/70 font-mono">
                              {timeStr}
                            </span>
                            {/* WhatsApp Double Blue Ticks for user's messages */}
                            {isSelf && (
                              <span
                                className={`text-[11px] font-bold leading-none ${
                                  m.isRead || peerOnline ? "text-[#34D399]" : "text-white/60"
                                }`}
                                title={m.isRead || peerOnline ? "Delivered & Seen" : "Sent"}
                              >
                                ✓✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* WhatsApp Typing Bubble Indicator */}
                  {peerTyping && (
                    <div className="flex items-center gap-2 text-xs text-[#9FA6B2] bg-[#1E2024] border border-[#2B2E33] px-3 py-1.5 rounded-full w-fit animate-pulse shadow-sm">
                      <span className="text-xs">💬</span>
                      <span className="font-medium text-white">{peerTypingName} is typing</span>
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0376C9] animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0376C9] animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0376C9] animate-bounce delay-200" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* WhatsApp Quick Replies & Input Footer */}
            {selectedBooking && (
              <div className="p-3 bg-[#181A1D] border-t border-[#2B2E33] space-y-2">
                {/* Quick Reply Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(null, reply)}
                      className="px-2.5 py-1 rounded-full bg-[#1E2024] hover:bg-[#25282D] text-[#9FA6B2] hover:text-white border border-[#2B2E33] whitespace-nowrap transition text-[11px]"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => handleSendMessage(e)}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type a message (Press Enter to send)..."
                    maxLength={2000}
                    className="flex-1 bg-[#121416] border border-[#2B2E33] text-white rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-[#0376C9] placeholder-[#6A7380]"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="w-9 h-9 rounded-full bg-[#0376C9] hover:bg-[#1098FC] text-white flex items-center justify-center text-sm shadow-mm-glow-blue disabled:opacity-40 transition"
                    title="Send (Enter)"
                  >
                    {sendingMessage ? "…" : "➤"}
                  </button>
                </form>
              </div>
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
