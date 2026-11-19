const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { sequelize, User, WalletBinding, Booking, BookingMessage, Trade } = require("../src/models");

async function clearAllUsers() {
  const t = await sequelize.transaction();
  try {
    const msgCount = await BookingMessage.destroy({ where: {}, truncate: false, transaction: t });
    const bookCount = await Booking.destroy({ where: {}, truncate: false, transaction: t });
    const tradeCount = await Trade.destroy({ where: {}, truncate: false, transaction: t });
    const bindingCount = await WalletBinding.destroy({ where: {}, truncate: false, transaction: t });
    const userCount = await User.destroy({ where: {}, truncate: false, transaction: t });

    await t.commit();
    console.log("CLEAR_USERS_SUCCESS");
    console.log(`Users deleted: ${userCount}`);
    console.log(`Wallet bindings deleted: ${bindingCount}`);
    console.log(`Bookings deleted: ${bookCount}`);
    console.log(`Booking messages deleted: ${msgCount}`);
    console.log(`Trades deleted: ${tradeCount}`);
  } catch (err) {
    await t.rollback();
    console.error("Failed to clear users:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

clearAllUsers();
