const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// A public wallet address may belong to one EnergyChain user only. This table
// is added by the existing non-destructive sequelize.sync() startup path.
const WalletBinding = sequelize.define("WalletBinding", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  walletAddress: {
    type: DataTypes.STRING(42),
    allowNull: false,
    unique: true,
  },
});

module.exports = WalletBinding;
