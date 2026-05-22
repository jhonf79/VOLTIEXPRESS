import React from 'react';
import { SolarHubStatus } from '../types';
import { Sun, CloudRain, ShieldCheck, Database, RefreshCw, AlertTriangle } from 'lucide-react';

interface HubMonitorProps {
  hubStatus: SolarHubStatus;
  weather: 'Despejado' | 'Lluvia' | 'Tormenta';
  setWeather: (weather: 'Despejado' | 'Lluvia' | 'Tormenta') => void;
  trafficCongestion: 'Bajo' | 'Moderado' | 'Embotellamiento';
  setTrafficCongestion: (congestion: 'Bajo' | 'Moderado' | 'Embotellamiento') => void;
}

export const HubMonitor: React.FC<HubMonitorProps> = ({
  hubStatus,
  weather,
  setWeather,
  trafficCongestion,
  setTrafficCongestion
}) => {
  return (
    <div id="solar-hub-panel" className="bg-zinc-900 border border-zinc-805 rounded-2xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* 1. SOLAR MICRO-HUB CORE STATUS DIAGRAMA (7 cols) */}
      <div className="md:col-span-7 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center space-x-2.5">
            <Database className="text-cyan-400" size={16} />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Micro-Hub Central Diagnósticos</h4>
              <p className="text-[9px] text-zinc-500 font-mono">Depósito con Autogeneración Fotovoltaica Cero Emisiones</p>
            </div>
          </div>
          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900/40 font-bold uppercase">
            SISTEMA SEGURO
          </span>
        </div>

        {/* Status specs metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Solar Gen */}
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex flex-col justify-between">
            <span className="text-[8px] font-mono font-semibold text-amber-400 uppercase tracking-wider">Prod. Solar</span>
            <div className="mt-2">
              <span className="text-lg font-bold text-white font-mono">{hubStatus.solarProductionKw.toFixed(1)}</span>
              <span className="text-[9px] text-zinc-400 font-mono ml-0.5">kW</span>
            </div>
          </div>

          {/* Hub battery SoC */}
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex flex-col justify-between">
            <span className="text-[8px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">Banco Almacén</span>
            <div className="mt-2">
              <span className="text-lg font-bold text-white font-mono">{Math.round(hubStatus.batteryReserverKwh)}</span>
              <span className="text-[9px] text-zinc-400 font-mono ml-0.5">kWh</span>
            </div>
          </div>

          {/* Grid injection */}
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex flex-col justify-between">
            <span className="text-[8px] font-mono font-semibold text-cyan-400 uppercase tracking-wider">Inyección Red</span>
            <div className="mt-2">
              <span className="text-lg font-bold text-white font-mono">{hubStatus.powerExchangedGridKw.toFixed(1)}</span>
              <span className="text-[9px] text-zinc-400 font-mono ml-0.5">kW</span>
            </div>
          </div>

          {/* Stored queue packages */}
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex flex-col justify-between">
            <span className="text-[8px] font-mono font-semibold text-purple-400 uppercase tracking-wider">Depósito Hub</span>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-lg font-bold text-white font-mono">{hubStatus.packagesStored}</span>
                <span className="text-[9px] text-zinc-500 font-mono ml-0.5">/ 50 pkg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Graphic progress bar for backup battery bank */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[9px] font-mono text-zinc-500">
            <span>RESILIENCIA TOTAL CENTRAL FOTOVOLTAICA</span>
            <span className="text-emerald-400 font-bold">{Math.round((hubStatus.batteryReserverKwh / 85) * 100)}% DISPONIBLE</span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full border border-zinc-850 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
              style={{ width: `${(hubStatus.batteryReserverKwh / 85) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. LIVE SIMULATION CONDITION MODIFIERS (5 cols) */}
      <div className="md:col-span-5 space-y-4 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Moduladores Ambientales</h4>
            <span className="text-[9px] font-mono text-zinc-500">TIEMPO</span>
          </div>

          {/* Climatology Toggle */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
              🌤️ Factor Climatológico
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              {(['Despejado', 'Lluvia', 'Tormenta'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setWeather(w)}
                  className={`py-1.5 px-1 rounded-lg font-bold transition text-center border ${weather === w ? 'bg-amber-950/40 text-amber-400 border-amber-900/60' : 'bg-zinc-950 text-zinc-500 border-zinc-850 hover:bg-zinc-900 hover:text-zinc-400'}`}
                >
                  {w === 'Despejado' ? '☀️ Sol' : w === 'Lluvia' ? '🌧️ Lluvia' : '⚡ Tormenta'}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-zinc-550 text-zinc-500 leading-relaxed font-mono">
              {weather === 'Despejado' 
                ? 'Mayor kW solar. Tráfico fluye óptimamente.' 
                : weather === 'Lluvia' 
                  ? 'Tracción reducida en motos (-12% de velocidad).' 
                  : 'Producción solar muy baja. Velocidades caen (-25%).'}
            </p>
          </div>

          {/* Traffic Density Toggle */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[9px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
              🚦 Congestión Vial Bucaramanga
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              {(['Bajo', 'Moderado', 'Embotellamiento'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTrafficCongestion(t)}
                  className={`py-1.5 px-0.5 rounded-lg font-bold transition text-center border ${trafficCongestion === t ? 'bg-purple-950/40 text-purple-400 border-purple-900/60' : 'bg-zinc-950 text-zinc-500 border-zinc-850 hover:bg-zinc-900 hover:text-zinc-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-zinc-550 text-zinc-500 leading-relaxed font-mono">
              {trafficCongestion === 'Bajo' 
                ? 'Flujo continuo en autopistas de Cabecera.' 
                : trafficCongestion === 'Moderado' 
                  ? 'Retrasos ligeros en rutas primarias.' 
                  : 'Despachos demoran considerablemente.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
