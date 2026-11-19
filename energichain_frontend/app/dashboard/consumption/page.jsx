"use client";

import React, { useState } from "react";
import { api } from "../../lib/api";

export default function ConsumptionPredictionPage() {
  const [formData, setFormData] = useState({
    temperature: "24.5",
    humidity: "45.0",
    squareFootage: "1500",
    occupancy: "4",
    hvacUsage: "On",
    lightingUsage: "On",
    renewableEnergy: "10.5",
    dayOfWeek: "Wednesday",
    holiday: "No",
    timestamp: new Date().toISOString().slice(0, 16),
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setWarnings([]);
    setLoading(true);

    try {
      const payload = {
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        squareFootage: parseFloat(formData.squareFootage),
        occupancy: parseInt(formData.occupancy, 10),
        hvacUsage: formData.hvacUsage,
        lightingUsage: formData.lightingUsage,
        renewableEnergy: parseFloat(formData.renewableEnergy),
        dayOfWeek: formData.dayOfWeek,
        holiday: formData.holiday,
        timestamp: formData.timestamp,
      };

      const res = await api("/api/energy-consumption/predict", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res && res.success) {
        setResult(res);
        setWarnings(res.warnings || []);
      } else {
        setError(res?.error || "Inference failed.");
      }
    } catch (err) {
      setError(err.message || "Failed to execute energy consumption prediction.");
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
              <span>🧠</span> Facility Consumption ML
            </h1>
            <span className="badge-blue text-[11px]">Scikit-Learn Model</span>
          </div>
          <p className="text-xs sm:text-sm text-[#9FA6B2] mt-1">
            Predict overall facility power demand using the validated Linear Regression pipeline trained on chronological load profiles.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Input Form - MetaMask Style Card */}
        <form
          onSubmit={handleSubmit}
          className="card p-6 space-y-4"
        >
          <div className="pb-3 border-b border-[#2B2E33] flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
              Feature Pipeline Parameters
            </span>
            <span className="text-[10px] font-mono text-[#34D399] bg-[#10B981]/15 px-2 py-0.5 rounded-full border border-[#10B981]/30">
              1,000 Row Model
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0376C9]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                Humidity (%)
              </label>
              <input
                type="number"
                step="0.1"
                name="humidity"
                value={formData.humidity}
                onChange={handleChange}
                className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0376C9]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                Square Footage
              </label>
              <input
                type="number"
                name="squareFootage"
                value={formData.squareFootage}
                onChange={handleChange}
                className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0376C9]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                Occupancy Count
              </label>
              <input
                type="number"
                name="occupancy"
                value={formData.occupancy}
                onChange={handleChange}
                className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0376C9]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                HVAC State
              </label>
              <select
                name="hvacUsage"
                value={formData.hvacUsage}
                onChange={handleChange}
                className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0376C9]"
              >
                <option value="On">On</option>
                <option value="Off">Off</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                Lighting State
              </label>
              <select
                name="lightingUsage"
                value={formData.lightingUsage}
                onChange={handleChange}
                className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0376C9]"
              >
                <option value="On">On</option>
                <option value="Off">Off</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                Renewable Offset (kWh)
              </label>
              <input
                type="number"
                step="0.1"
                name="renewableEnergy"
                value={formData.renewableEnergy}
                onChange={handleChange}
                className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0376C9]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
                Day of Week
              </label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0376C9]"
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9FA6B2] mb-1">
              Timestamp
            </label>
            <input
              type="datetime-local"
              name="timestamp"
              value={formData.timestamp}
              onChange={handleChange}
              className="w-full bg-[#121416] border border-[#2B2E33] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0376C9]"
              required
            />
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
            {loading ? "Running Python Pipeline…" : "Execute Consumption Inference"}
          </button>
        </form>

        {/* Prediction Results Card */}
        <div className="card p-6 space-y-4">
          <div className="pb-3 border-b border-[#2B2E33] flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
              Model Inference Output
            </span>
            {result?.model && (
              <span className="badge-blue text-[10px]">
                {result.model}
              </span>
            )}
          </div>

          {result ? (
            <div className="space-y-5">
              <div className="p-5 bg-[#141618] rounded-2xl border border-[#202327]">
                <span className="text-[11px] text-[#9FA6B2] block font-mono uppercase tracking-wider">
                  Predicted Electrical Load
                </span>
                <div className="text-4xl font-mono font-extrabold text-[#34D399] mt-1.5 flex items-baseline gap-2">
                  <span>{result.prediction.energyConsumption}</span>
                  <span className="text-xs font-mono text-[#9FA6B2]">
                    ({result.prediction.unit})
                  </span>
                </div>
              </div>

              {warnings && warnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/35 text-xs text-[#FBBF24] space-y-1 font-mono">
                  <div className="font-bold uppercase text-[10px]">Training Range Warnings:</div>
                  {warnings.map((w, idx) => (
                    <div key={idx}>• {w}</div>
                  ))}
                </div>
              )}

              <div className="space-y-2.5 text-xs font-mono p-4 bg-[#141618] rounded-xl border border-[#202327] text-[#9FA6B2]">
                <div className="flex justify-between">
                  <span>Validation RMSE:</span>
                  <span className="text-white font-semibold">5.0018</span>
                </div>
                <div className="flex justify-between">
                  <span>Validation R² Score:</span>
                  <span className="text-white font-semibold">0.5917</span>
                </div>
                <div className="flex justify-between">
                  <span>Algorithm:</span>
                  <span className="text-[#38BDF8] font-semibold">LinearRegression</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-[#9FA6B2] border border-dashed border-[#2B2E33] rounded-xl bg-[#141618]/50">
              Submit the feature parameter form to run the trained scikit-learn pipeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
