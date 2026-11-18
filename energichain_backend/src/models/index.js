const sequelize = require("../config/db");
const User = require("./User");
const Trade = require("./Trade");
const Booking = require("./Booking");
const BookingMessage = require("./BookingMessage");

// associations
User.hasMany(Trade, { foreignKey: "userId" });
Trade.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Booking, { foreignKey: "customerId", as: "customerBookings" });
User.hasMany(Booking, { foreignKey: "providerId", as: "providerBookings" });
Booking.belongsTo(User, { foreignKey: "customerId", as: "customer" });
Booking.belongsTo(User, { foreignKey: "providerId", as: "provider" });

Booking.hasMany(BookingMessage, { foreignKey: "bookingId", as: "messages" });
BookingMessage.belongsTo(Booking, { foreignKey: "bookingId" });
User.hasMany(BookingMessage, { foreignKey: "senderId", as: "bookingMessages" });
BookingMessage.belongsTo(User, { foreignKey: "senderId", as: "sender" });

const connectDB = async () => {
  await sequelize.authenticate();
  // Create only missing tables. Do not alter or force-sync an existing schema.
  await sequelize.sync();
  console.log("Postgres DB connected; required tables are available.");
};

module.exports = { sequelize, User, Trade, Booking, BookingMessage, connectDB };
