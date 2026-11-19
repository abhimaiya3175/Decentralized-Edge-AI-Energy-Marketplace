"use client";

import React, { useState } from "react";

export default function WindTelemetryPage() {
  const [windSpeed, setWindSpeed] = useState(8.5);

  // Aerodynamic wind turbine simulation curve
  const calculateWindPower = (v) => {
    if (v < 3.0 || v > 25.0) return 0;
    if (v >= 12.0) return 15.0; // Rated capacity: 15 kW
    // Cubic scaling between cut-in (3 m/s) and rated (12 m/s)
    const factor = Math.pow((v - 3.0) / (12.0 - 3.0), 3);
    return Math.min(15.0, factor * 15.0);
  };

  const powerOutput = calculateWindPower(windSpeed);
  const efficiency = windSpeed >= 3 && windSpeed <= 25 ? (45.2 + (windSpeed % 4) * 1.8).toFixed(1) : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header - MetaMask Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B2E33]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>💨</span> Wind Energy Telemetry
            </h1>
            <span className="badge-wind text-[11px]">Simulated Telemetry</span>
          </div>
          <p className="text-xs sm:text-sm text-[#9FA6B2] mt-1">
            Aerodynamic turbine power simulation modeling cut-in, rated, and cut-out velocity bounds according to Betz limit efficiency curves.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="card p-5">
          <div className="text-[11px] font-mono uppercase text-[#9FA6B2] tracking-wider">Wind Speed</div>
          <div className="text-3xl font-mono font-extrabold text-[#38BDF8] mt-1">
            {windSpeed.toFixed(1)} <span className="text-xs text-[#9FA6B2]">m/s</span>
          </div>
          <p className="text-[10px] font-mono text-[#9FA6B2] mt-2">
            Status: {windSpeed < 3 ? "Below Cut-in" : windSpeed > 25 ? "Gale Cut-out" : "Active Power"}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="card p-5">
          <div className="text-[11px] font-mono uppercase text-[#9FA6B2] tracking-wider">Simulated Power Output</div>
          <div className="text-3xl font-mono font-extrabold text-white mt-1">
            {powerOutput.toFixed(2)} <span className="text-xs text-[#9FA6B2]">kW</span>
          </div>
          <p className="text-[10px] font-mono text-[#9FA6B2] mt-2">
            Max Rated Capacity: 15.0 kW
          </p>
        </div>

        {/* Metric 3 */}
        <div className="card p-5">
          <div className="text-[11px] font-mono uppercase text-[#9FA6B2] tracking-wider">Aerodynamic Efficiency</div>
          <div className="text-3xl font-mono font-extrabold text-[#34D399] mt-1">
            {efficiency} <span className="text-xs text-[#9FA6B2]">%</span>
          </div>
          <p className="text-[10px] font-mono text-[#9FA6B2] mt-2">
            Betz Coefficient Clamped
          </p>
        </div>
      </div>

      {/* Interactive Wind Velocity Controller Card */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B2E33]">
          <span className="text-xs font-mono uppercase tracking-wider text-[#9FA6B2]">
            Turbine Anemometer Simulation Control
          </span>
          <span className="text-xs font-mono text-[#38BDF8] bg-[#0376C9]/15 px-2.5 py-0.5 rounded-full border border-[#0376C9]/30">
            v = {windSpeed.toFixed(1)} m/s
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#9FA6B2] mb-3">
            Adjust Wind Velocity: <span className="font-mono text-white font-bold">{windSpeed.toFixed(1)} m/s</span>
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="0.5"
            value={windSpeed}
            onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
            className="w-full accent-[#06B6D4] bg-[#121416] cursor-pointer h-2 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#9FA6B2] mt-2">
            <span>0 m/s (Calm)</span>
            <span>3 m/s (Cut-in)</span>
            <span>12 m/s (Rated Max)</span>
            <span>25 m/s (Cut-out)</span>
            <span>30 m/s (Storm)</span>
          </div>
        </div>

        <div className="p-4 bg-[#141618] rounded-xl border border-[#202327] text-xs text-[#9FA6B2] space-y-1.5 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#38BDF8]">●</span>
            <span>Cut-in Threshold (3.0 m/s): Rotor begins rotation and generator synchronizes.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#34D399]">●</span>
            <span>Rated Velocity (12.0 m/s): Generator hits 15 kW nameplate maximum.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#EF4444]">●</span>
            <span>Furling / Cut-out (25.0 m/s): Aerodynamic braking locks blades for storm survival.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
