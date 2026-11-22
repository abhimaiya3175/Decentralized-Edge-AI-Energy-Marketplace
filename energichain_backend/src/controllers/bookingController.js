const { Op } = require("sequelize");
const { Booking, BookingMessage, User } = require("../models");
let broadcastBookingMessage = null;
try {
  broadcastBookingMessage = require("../websocket").broadcastBookingMessage;
} catch {}

const userAttributes = ["id", "name", "email"];
const bookingIncludes = [
  { model: User, as: "customer", attributes: userAttributes },
  { model: User, as: "provider", attributes: userAttributes },
];

function isValidDecimal(val, maxDecimals = 6) {
  if (typeof val !== "number" && typeof val !== "string") return false;
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) return false;
  const str = val.toString().trim();
  if (str.includes("e") || str.includes("E")) return false;
  const parts = str.split(".");
  if (parts.length > 2) return false;
  if (parts[1] && parts[1].length > maxDecimals) return false;
  return true;
}

const serializeBooking = (booking, userId) => ({
  ...booking.toJSON(),
  viewerRole: booking.customerId === userId ? "customer" : "provider",
});

const findParticipantBooking = (id, userId) =>
  Booking.findOne({
    where: {
      id,
      [Op.or]: [{ customerId: userId }, { providerId: userId }],
    },
    include: bookingIncludes,
  });

exports.createBooking = async (req, res) => {
  try {
    const { providerEmail, energyUnits, scheduledFor, pricePerUnit } = req.body;

    if (!isValidDecimal(energyUnits, 6)) {
      return res.status(400).json({
        msg: "Energy quantity must be a positive finite number with at most 6 decimal places.",
        code: "INVALID_ENERGY_UNITS",
      });
    }

    if (!isValidDecimal(pricePerUnit, 6)) {
      return res.status(400).json({
        msg: "Price per unit must be a positive finite number with at most 6 decimal places.",
        code: "INVALID_PRICE_PER_UNIT",
      });
    }

    const units = Number(energyUnits);
    const unitPrice = Number(pricePerUnit);
    const scheduledDate = new Date(scheduledFor);

    if (!providerEmail || Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return res.status(400).json({
        msg: "Provider email and a valid future reservation time are required.",
        code: "INVALID_SCHEDULE_TIME",
      });
    }

    const provider = await User.findOne({
      where: { email: String(providerEmail).trim().toLowerCase() },
    });

    // Generic error to mitigate user enumeration (returns PROVIDER_UNAVAILABLE)
    if (!provider) {
      return res.status(400).json({
        msg: "Booking request cannot be processed: the specified provider is not available.",
        code: "PROVIDER_UNAVAILABLE",
      });
    }

    if (provider.id === req.user.id) {
      return res.status(400).json({
        msg: "You cannot create a booking with yourself.",
        code: "SELF_BOOKING_PROHIBITED",
      });
    }

    const booking = await Booking.create({
      customerId: req.user.id,
      providerId: provider.id,
      energyUnits: units,
      scheduledFor: scheduledDate,
      pricePerUnit: unitPrice,
      totalPrice: Number((units * unitPrice).toFixed(6)),
      status: "pending",
    });
    const result = await Booking.findByPk(booking.id, { include: bookingIncludes });

    res.status(201).json({ msg: "Pre-booking created.", booking: serializeBooking(result, req.user.id) });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ msg: "Unable to create the pre-booking." });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { [Op.or]: [{ customerId: req.user.id }, { providerId: req.user.id }] },
      include: bookingIncludes,
      order: [["scheduledFor", "ASC"]],
    });
    res.json(bookings.map((booking) => serializeBooking(booking, req.user.id)));
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ msg: "Unable to load pre-bookings." });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ msg: "Status must be confirmed or cancelled." });
    }

    const booking = await findParticipantBooking(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found." });
    if (booking.status !== "pending") return res.status(400).json({ msg: "Only pending bookings can be updated." });

    const isProvider = booking.providerId === req.user.id;
    if (status === "confirmed" && !isProvider) {
      return res.status(403).json({ msg: "Only the provider can confirm a booking." });
    }
    if (status === "cancelled" && !isProvider && booking.customerId !== req.user.id) {
      return res.status(403).json({ msg: "You are not allowed to cancel this booking." });
    }

    booking.status = status;
    await booking.save();
    res.json({ msg: `Booking ${status}.`, booking: serializeBooking(booking, req.user.id) });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ msg: "Unable to update the pre-booking." });
  }
};

exports.getBookingMessages = async (req, res) => {
  try {
    const booking = await findParticipantBooking(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found." });

    const messages = await BookingMessage.findAll({
      where: { bookingId: booking.id },
      include: [{ model: User, as: "sender", attributes: userAttributes }],
      order: [["createdAt", "ASC"]],
    });
    res.json({ booking: serializeBooking(booking, req.user.id), messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ msg: "Unable to load booking messages." });
  }
};

exports.createBookingMessage = async (req, res) => {
  try {
    const body = String(req.body.body || "").trim();
    if (!body || body.length > 2000) {
      return res.status(400).json({ msg: "A message between 1 and 2000 characters is required." });
    }

    const booking = await findParticipantBooking(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found." });

    const message = await BookingMessage.create({
      bookingId: booking.id,
      senderId: req.user.id,
      body,
    });
    const result = await BookingMessage.findByPk(message.id, {
      include: [{ model: User, as: "sender", attributes: userAttributes }],
    });
    if (broadcastBookingMessage) {
      try {
        broadcastBookingMessage(booking.id, result);
      } catch (broadcastErr) {
        console.error("WS broadcast error:", broadcastErr);
      }
    }
    res.status(201).json({ msg: "Message sent.", message: result });
  } catch (error) {
    console.error("Create message error:", error);
    res.status(500).json({ msg: "Unable to send the message." });
  }
};
