const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define("Booking", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  providerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  energyUnits: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0.01 },
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  pricePerUnit: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: false,
    validate: { min: 0 },
  },
  totalPrice: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: false,
    validate: { min: 0 },
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
    allowNull: false,
    defaultValue: "pending",
  },
});

module.exports = Booking;
