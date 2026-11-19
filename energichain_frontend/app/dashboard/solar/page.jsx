"use client";

import React, { useState } from "react";
import { api } from "../../lib/api";

export default function SolarPowerPage() {
  const [dateTime, setDateTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [irradiation, setIrradiation] = useState("850.5");
  const [ambientTemp, setAmbientTemp] = useState("28.5");
  const [moduleTemp, setModuleTemp] = useState("45.2");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [badgeText, setBadgeText] = useState("");
  const [error, setError] = useState("");

  const fillSample = () => {
    setDateTime(new Date().toISOString().slice(0, 16));
    setIrradiation("850.5");
    setAmbientTemp("28.5");
    setModuleTemp("45.2");
    setError("");
  };

  const calculateSolar = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const rad = parseFloat(irradiation);
    const amb = parseFloat(ambientTemp);
    const mod = parseFloat(moduleTemp);

    if (isNaN(rad) || isNaN(amb) || isNaN(mod)) {
      setError("Please fill in valid numeric values for all solar parameters.");
      setLoading(false);
      return;
    }

    try {
      const response = await api("/predict", {
        method: "POST",
        body: JSON.stringify({
          dateTime,
          irradiation: rad,
          ambientTemp: amb,
          moduleTemp: mod,
        }),
      });

      if (response && response.predictedPower != null) {
        setResult(response.predictedPower);
        setBadgeText("Random Forest Regressor (Trained ML)");
      }
    } catch (err) {
      // Backend returns 503 with MODEL_UNAVAILABLE because solar_rf_model.pkl is absent
      // Gracefully fall back to client physical thermodynamic simulation
      const dt = new Date(dateTime);
      const hour = dt.getHours();
      const hourEffect = Math.max(0, (Math.cos((2 * Math.PI * hour) / 24) + 1) / 2);

      let physicalCalc =
        (rad / 1000) * 5 * (1 - (mod - 25) * 0.004) * (1 + (amb - 25) * 0.002);
      physicalCalc *= hourEffect;
      const finalPower = Math.max(0, physicalCalc).toFixed(2);

      setResult(finalPower);
      setBadgeText("Physical Estimate (ML Model Offline)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header - MetaMask Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2E33]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>☀️</span> Solar Power Generation
            </h1>
            <span className="badge-solar text-[11px]">Photovoltaic Array</span>
          </div>
          <p className="text-xs sm:text-sm text-[#9FA6B2] mt-1">
            Predict AC power output from surface irradiance, ambient temperature, and PV cell thermal coefficients.
          </p>
        </div>

        <button
          type="button"
          onClick={fillSample}
          className="btn btn-secondary px-3.5 py-1.5 text-xs rounded-full border border-[#2B2E33] hover:border-[#3B3E45] font-mono text-white flex items-center gap-1.5"
        >
          <span>↻</span> Fill Sensor Sample
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Form Card - MetaMask Style */}
        <form
          onSubmit={calculateSolar}
          className="card p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#2B2E33]">
            <span className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
              Sensor Telemetry Input
            </span>
            <span className="text-[10px] font-mono text-[#38BDF8]">Edge Inverter #1</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
              Date & Timestamp
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#0376C9]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
              Solar Irradiation (W/m²)
            </label>
            <input
              type="number"
              step="0.1"
              value={irradiation}
              onChange={(e) => setIrradiation(e.target.value)}
              className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#0376C9]"
              placeholder="e.g. 850.5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                Ambient Temp (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(e.target.value)}
                className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#0376C9]"
                placeholder="28.5"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                Module Temp (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={moduleTemp}
                onChange={(e) => setModuleTemp(e.target.value)}
                className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#0376C9]"
                placeholder="45.2"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-[#F87171] bg-[#EF4444]/15 border border-[#EF4444]/35 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-2.5 text-xs font-semibold rounded-xl shadow-mm-glow-blue disabled:opacity-50 mt-2"
          >
            {loading ? "Calculating Generation…" : "Estimate AC Generation"}
          </button>
        </form>

        {/* Results Card */}
        <div className="card p-6 space-y-4">
          <div className="pb-3 border-b border-[#2B2E33] flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
              Output Generation Matrix
            </span>
            {badgeText && (
              <span className="badge-solar text-[10px]">
                {badgeText}
              </span>
            )}
          </div>

          {result !== null ? (
            <div className="space-y-5">
              <div className="p-5 bg-[#141618] rounded-2xl border border-[#202327]">
                <span className="text-[11px] text-[#9FA6B2] block font-mono uppercase tracking-wider">
                  Predicted AC Power Output
                </span>
                <div className="text-4xl font-mono font-extrabold text-[#34D399] mt-1.5 flex items-baseline gap-2">
                  <span>{result}</span>
                  <span className="text-sm font-semibold text-[#9FA6B2]">kW</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-mono p-4 bg-[#141618] rounded-xl border border-[#202327]">
                <div className="flex justify-between text-[#9FA6B2]">
                  <span>Irradiation Input:</span>
                  <span className="text-white font-semibold">{irradiation} W/m²</span>
                </div>
                <div className="flex justify-between text-[#9FA6B2]">
                  <span>Thermal Module Derate:</span>
                  <span className="text-[#FBBF24] font-semibold">-{(parseFloat(moduleTemp || 25) - 25) * 0.4}%</span>
                </div>
                <div className="flex justify-between text-[#9FA6B2]">
                  <span>Estimated Daily Yield:</span>
                  <span className="text-[#34D399] font-bold">{(parseFloat(result) * 5.2).toFixed(2)} kWh/day</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-[#9FA6B2] border border-dashed border-[#2B2E33] rounded-xl bg-[#141618]/50">
              Configure parameters on the left and click calculate to view generation forecast.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
