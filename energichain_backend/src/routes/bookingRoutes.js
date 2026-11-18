const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getBookingMessages,
  createBookingMessage,
} = require("../controllers/bookingController");

router.post("/", auth, createBooking);
router.get("/mine", auth, getMyBookings);
router.patch("/:id/status", auth, updateBookingStatus);
router.get("/:id/messages", auth, getBookingMessages);
router.post("/:id/messages", auth, createBookingMessage);

module.exports = router;
