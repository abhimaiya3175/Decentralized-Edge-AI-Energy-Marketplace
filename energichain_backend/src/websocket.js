const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { Booking, BookingMessage, User } = require("./models");

const userAttributes = ["id", "name", "email"];

// Map<bookingId, Set<WebSocket>>
const rooms = new Map();

// Helper to broadcast JSON payload to sockets
function broadcast(sockets, payload, excludeSocket = null) {
  const data = JSON.stringify(payload);
  for (const client of sockets) {
    if (client !== excludeSocket && client.readyState === 1 /* OPEN */) {
      try {
        client.send(data);
      } catch (err) {
        console.error("Failed to send WS message:", err.message);
      }
    }
  }
}

// Broadcast active presence in a room (WhatsApp-style Online badge)
function broadcastPresence(bookingId) {
  const roomSockets = rooms.get(Number(bookingId));
  if (!roomSockets) return;

  const activeUsers = [];
  const seenUserIds = new Set();
  for (const client of roomSockets) {
    if (client.readyState === 1 && client.user && !seenUserIds.has(client.user.id)) {
      seenUserIds.add(client.user.id);
      activeUsers.push({
        id: client.user.id,
        name: client.user.name,
        email: client.user.email,
      });
    }
  }

  broadcast(roomSockets, {
    type: "presence",
    bookingId: Number(bookingId),
    activeUsers,
    count: activeUsers.length,
  });
}

// Remove socket from a room
function leaveRoom(ws, bookingId) {
  const numId = Number(bookingId);
  const roomSockets = rooms.get(numId);
  if (roomSockets) {
    roomSockets.delete(ws);
    if (roomSockets.size === 0) {
      rooms.delete(numId);
    } else {
      broadcastPresence(numId);
    }
  }
  if (ws.currentRoom === numId) {
    ws.currentRoom = null;
  }
}

// Unified helper to broadcast new message from either WS or REST
function broadcastBookingMessage(bookingId, message) {
  const numId = Number(bookingId);
  const roomSockets = rooms.get(numId);
  if (roomSockets && roomSockets.size > 0) {
    broadcast(roomSockets, {
      type: "new_message",
      bookingId: numId,
      message,
    });
  }
}

// Handle an authenticated message
async function handleMessage(ws, raw) {
  try {
    const payload = JSON.parse(raw.toString());
    const { type } = payload;

    // --- Action: Join Booking Chat Room ---
    if (type === "join_room") {
      const bookingId = Number(payload.bookingId);
      if (!bookingId) return;

      // Verify user is a customer or provider on this booking
      const booking = await Booking.findOne({
        where: {
          id: bookingId,
          [Op.or]: [{ customerId: ws.user.id }, { providerId: ws.user.id }],
        },
      });

      if (!booking) {
        ws.send(JSON.stringify({ type: "error", msg: "Not authorized for this booking" }));
        return;
      }

      // Leave existing room if switching
      if (ws.currentRoom && ws.currentRoom !== bookingId) {
        leaveRoom(ws, ws.currentRoom);
      }

      if (!rooms.has(bookingId)) {
        rooms.set(bookingId, new Set());
      }
      rooms.get(bookingId).add(ws);
      ws.currentRoom = bookingId;

      ws.send(
        JSON.stringify({
          type: "joined_room",
          bookingId,
          role: booking.customerId === ws.user.id ? "customer" : "provider",
        })
      );

      // Broadcast presence update (WhatsApp-style Online badge)
      broadcastPresence(bookingId);
    }

    // --- Action: Leave Room ---
    else if (type === "leave_room") {
      const bookingId = Number(payload.bookingId) || ws.currentRoom;
      if (bookingId) {
        leaveRoom(ws, bookingId);
      }
    }

    // --- Action: Real-Time Typing Indicator (WhatsApp-style) ---
    else if (type === "typing") {
      const bookingId = Number(payload.bookingId) || ws.currentRoom;
      const isTyping = Boolean(payload.isTyping);
      const roomSockets = rooms.get(Number(bookingId));

      if (roomSockets && roomSockets.has(ws)) {
        broadcast(
          roomSockets,
          {
            type: "user_typing",
            bookingId: Number(bookingId),
            user: ws.user,
            isTyping,
          },
          ws // Exclude sender
        );
      }
    }

    // --- Action: Send Instant Message ---
    else if (type === "send_message") {
      const bookingId = Number(payload.bookingId) || ws.currentRoom;
      const body = String(payload.body || "").trim();
      const tempId = payload.tempId || null;

      if (!bookingId || !body || body.length > 2000) {
        ws.send(JSON.stringify({ type: "error", msg: "Valid message body required (1-2000 chars)" }));
        return;
      }

      // Verify participation
      const booking = await Booking.findOne({
        where: {
          id: bookingId,
          [Op.or]: [{ customerId: ws.user.id }, { providerId: ws.user.id }],
        },
      });

      if (!booking) {
        ws.send(JSON.stringify({ type: "error", msg: "Unauthorized" }));
        return;
      }

      // Persist message in PostgreSQL
      const created = await BookingMessage.create({
        bookingId,
        senderId: ws.user.id,
        body,
      });

      const fullMessage = await BookingMessage.findByPk(created.id, {
        include: [{ model: User, as: "sender", attributes: userAttributes }],
      });

      const roomSockets = rooms.get(Number(bookingId));
      if (roomSockets) {
        // Instant broadcast to all participants in this booking room
        broadcast(roomSockets, {
          type: "new_message",
          bookingId: Number(bookingId),
          message: fullMessage,
          tempId,
        });
      } else {
        // Sender only
        ws.send(
          JSON.stringify({
            type: "new_message",
            bookingId: Number(bookingId),
            message: fullMessage,
            tempId,
          })
        );
      }
    }

    // --- Action: Read / Delivery Receipts (WhatsApp double blue tick) ---
    else if (type === "read_receipt") {
      const bookingId = Number(payload.bookingId) || ws.currentRoom;
      const messageIds = Array.isArray(payload.messageIds) ? payload.messageIds : [];
      const roomSockets = rooms.get(Number(bookingId));

      if (roomSockets && roomSockets.has(ws) && messageIds.length > 0) {
        broadcast(
          roomSockets,
          {
            type: "messages_read",
            bookingId: Number(bookingId),
            messageIds,
            readBy: ws.user.id,
          },
          ws
        );
      }
    }
  } catch (err) {
    console.error("WebSocket message processing error:", err);
  }
}

function initWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws/chat",
  });

  // Heartbeat interval to detect stale / disconnected sockets
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      try {
        ws.ping();
      } catch {}
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  wss.on("connection", (ws, req) => {
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    let authenticated = false;
    const messageQueue = [];

    // Register message handler synchronously so no client messages are dropped!
    ws.on("message", async (raw) => {
      if (!authenticated) {
        messageQueue.push(raw);
        return;
      }
      await handleMessage(ws, raw);
    });

    // Authenticate user asynchronously from query string (?token=...)
    (async () => {
      try {
        const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        const token = url.searchParams.get("token");

        if (!token) {
          ws.close(4401, "Authentication token required");
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, { attributes: userAttributes });
        if (!user) {
          ws.close(4401, "User not found");
          return;
        }

        ws.user = { id: user.id, name: user.name, email: user.email };
        ws.currentRoom = null;
        authenticated = true;

        // Send connection acknowledgement
        ws.send(
          JSON.stringify({
            type: "connected",
            user: ws.user,
            msg: "Connected to EnergyChain WebSocket Chat Engine",
          })
        );

        // Process any queued messages that arrived during DB query
        while (messageQueue.length > 0) {
          const queued = messageQueue.shift();
          await handleMessage(ws, queued);
        }
      } catch (err) {
        console.warn("WebSocket authentication failed:", err.message);
        ws.close(4401, "Invalid authentication token");
      }
    })();

    // Clean up on disconnect
    ws.on("close", () => {
      if (ws.currentRoom) {
        leaveRoom(ws, ws.currentRoom);
      }
    });

    ws.on("error", (err) => {
      console.warn("WebSocket client error:", err.message);
    });
  });

  return wss;
}

module.exports = {
  initWebSocketServer,
  broadcastBookingMessage,
};
