const { Trade } = require("../models");

function isValidDecimal(val, maxDecimals = 6) {
  if (typeof val !== "number" && typeof val !== "string") return false;
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) return false;
  const str = val.toString().trim();
  if (str.includes("e") || str.includes("E")) return false; // reject exponential notation
  const parts = str.split(".");
  if (parts.length > 2) return false;
  if (parts[1] && parts[1].length > maxDecimals) return false;
  return true;
}

exports.createTrade = async (req, res) => {
  try {
    const { energyUnits, pricePerUnit, tradeType } = req.body || {};

    if (!isValidDecimal(energyUnits, 6)) {
      return res.status(400).json({
        msg: "energyUnits must be a positive finite number with at most 6 decimal places.",
        code: "INVALID_ENERGY_UNITS",
      });
    }

    if (!isValidDecimal(pricePerUnit, 6)) {
      return res.status(400).json({
        msg: "pricePerUnit must be a positive finite number with at most 6 decimal places.",
        code: "INVALID_PRICE_PER_UNIT",
      });
    }

    const cleanType = String(tradeType || "").trim().toLowerCase();
    if (!["buy", "sell"].includes(cleanType)) {
      return res.status(400).json({
        msg: "tradeType must be either 'buy' or 'sell'.",
        code: "INVALID_TRADE_TYPE",
      });
    }

    const trade = await Trade.create({
      userId: req.user.id,
      energyUnits: Number(energyUnits),
      pricePerUnit: Number(pricePerUnit),
      tradeType: cleanType,
    });

    res.status(201).json({ msg: "Trade recorded", trade });
  } catch (error) {
    console.error("Trade creation error:", error);
    res.status(500).json({ msg: "Failed to record trade." });
  }
};

exports.getMyTrades = async (req, res) => {
  try {
    const trades = await Trade.findAll({ where: { userId: req.user.id } });
    res.json(trades);
  } catch (error) {
    console.error("Trade retrieval error:", error);
    res.status(500).json({ msg: "Failed to load trades." });
  }
};
