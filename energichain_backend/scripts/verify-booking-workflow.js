const { sequelize } = require("../src/models");
const app = require("../src/app");

let baseUrl = process.env.APP_URL || "http://127.0.0.1:5000";
const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const password = "BookingTestPassword!42";
let bookingId;
let userIds = [];
let localServer = null;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${options.method || "GET"} ${path}: ${body.msg || response.statusText}`);
  return body;
}

async function ensureServer() {
  try {
    await fetch(`${baseUrl}/auth/me`);
  } catch (err) {
    await sequelize.authenticate();
    await new Promise((resolve) => {
      localServer = app.listen(0, "127.0.0.1", () => {
        baseUrl = `http://127.0.0.1:${localServer.address().port}`;
        resolve();
      });
    });
  }
}

async function cleanup() {
  if (localServer) {
    await new Promise((resolve) => localServer.close(resolve));
  }
  if (bookingId) {
    await sequelize.query('DELETE FROM "BookingMessages" WHERE "bookingId" = :bookingId', {
      replacements: { bookingId },
    });
    await sequelize.query('DELETE FROM "Bookings" WHERE id = :bookingId', {
      replacements: { bookingId },
    });
  }
  if (userIds.length) {
    await sequelize.query('DELETE FROM "Users" WHERE id IN (:userIds)', {
      replacements: { userIds },
    });
  }
  await sequelize.close();
}

async function main() {
  await ensureServer();
  const customerEmail = `booking-customer-${suffix}@example.test`;
  const providerEmail = `booking-provider-${suffix}@example.test`;

  try {
    const customer = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: "Booking Customer", email: customerEmail, password }),
    });
    const provider = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: "Booking Provider", email: providerEmail, password }),
    });
    userIds = [customer.user.id, provider.user.id];
    assert(customer.token && provider.token, "Signup did not return JWTs.");

    const bookingResult = await request("/bookings", {
      method: "POST",
      headers: { Authorization: `Bearer ${customer.token}` },
      body: JSON.stringify({
        providerEmail,
        energyUnits: 12.5,
        scheduledFor: new Date(Date.now() + 86_400_000).toISOString(),
        pricePerUnit: 0.15,
      }),
    });
    bookingId = bookingResult.booking.id;
    assert(bookingResult.booking.status === "pending", "New booking is not pending.");

    const providerBookings = await request("/bookings/mine", {
      headers: { Authorization: `Bearer ${provider.token}` },
    });
    assert(providerBookings.some((booking) => booking.id === bookingId), "Provider cannot see the booking.");

    const confirmed = await request(`/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${provider.token}` },
      body: JSON.stringify({ status: "confirmed" }),
    });
    assert(confirmed.booking.status === "confirmed", "Provider confirmation failed.");

    const sent = await request(`/bookings/${bookingId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${customer.token}` },
      body: JSON.stringify({ body: "Please confirm the delivery window." }),
    });
    assert(sent.message.body === "Please confirm the delivery window.", "Message was not saved.");

    const conversation = await request(`/bookings/${bookingId}/messages`, {
      headers: { Authorization: `Bearer ${provider.token}` },
    });
    assert(conversation.messages.length === 1, "Provider cannot read the customer message.");
    console.log("BOOKING_WORKFLOW=PASS");
  } finally {
    await cleanup();
    console.log("BOOKING_WORKFLOW_TEST_DATA=REMOVED");
  }
}

main().catch((error) => {
  console.error("BOOKING_WORKFLOW=FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
