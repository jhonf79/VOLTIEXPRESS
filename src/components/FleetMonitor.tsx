import React from 'react';
import { ElectricVehicle } from '../types';
import { Battery, Zap, Thermometer, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface FleetMonitorProps {
  vehicles: ElectricVehicle[];
}

export const FleetMonitor: React.FC<FleetMonitorProps> = ({ vehicles }) => {
  
  // Custom Battery Color selector for realistic dashboard
  const getBatteryColor = (pct: number) => {
    if (pct > 50) return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40';
    if (pct > 20) return 'text-amber-400 bg-amber-950/40 border-amber-900/40';
    return 'text-red-500 bg-red-950/40 border-red-900/40 animate-pulse';
  };

  const getStatusBadge = (status: ElectricVehicle['status']) => {
    switch (status) {
      case 'RUTA':
        return 'bg-cyan-950 text-cyan-400 border border-cyan-900/60';
      case 'CARGANDO':
        return 'bg-amber-950 text-amber-400 border border-amber-900/60 animate-pulse';
      case 'DISPONIBLE':
        return 'bg-emerald-950 text-emerald-400 border border-emerald-900/60';
      default:
        return 'bg-zinc-900 text-zinc-550 border border-zinc-800';
    }
  };

  return (
    <div id="fleet-monitor-panel" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <Zap className="text-emerald-400" size={18} />
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase font-mono">Telemetría de Flota</h3>
            <p className="text-[10px] text-zinc-500 font-mono">Monitoreo IoT en tiempo real • Motores Eléctricos</p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-zinc-400 tracking-wider bg-zinc-950 px-2 py-1 rounded border border-zinc-850">
          8 UNIDADES ACTIVAS
        </span>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {vehicles.map((v) => (
          <div 
            key={v.id} 
            className="bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 space-y-3 transition hover:border-zinc-700 hover:shadow-lg"
          >
            {/* Header profile */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5">
                <div className="w-5 h-5 rounded-md bg-emerald-950/60 border border-emerald-800 flex items-center justify-center font-mono text-[10px] font-bold text-emerald-400">
                  M-{v.id}
                </div>
                <span className="text-white font-mono font-medium truncate max-w-[80px]" title={v.driverName}>
                  {v.driverName}
                </span>
              </div>
              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full font-extrabold ${getStatusBadge(v.status)}`}>
                {v.status}
              </span>
            </div>

            {/* Battery Indicator with physical layout */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                <span className="flex items-center gap-1">
                  <Battery size={12} className="text-zinc-550 text-zinc-500" />
                  Batería LFP
                </span>
                <span className="font-bold text-white">{Math.round(v.batteryPct)}%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    v.batteryPct > 50 ? 'bg-emerald-400' : v.batteryPct > 20 ? 'bg-amber-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${v.batteryPct}%` }}
                />
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[9px] font-mono text-zinc-500">
              <div className="flex items-center gap-1 bg-zinc-900/50 p-1.5 rounded border border-zinc-900">
                <Thermometer size={10} className="text-zinc-500" />
                <span>{v.temperatureC.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center gap-1 bg-zinc-900/50 p-1.5 rounded border border-zinc-900">
                <Zap size={10} className="text-zinc-500" />
                <span>{v.currentKwhRate > 0 ? `+${v.currentKwhRate.toFixed(1)} kW` : `${v.currentKwhRate.toFixed(1)} kW`}</span>
              </div>
            </div>

            {/* Bottom aggregate */}
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-900">
              <span>Entrega de hoy:</span>
              <span className="text-emerald-400 font-bold bg-emerald-950/30 px-1 rounded">{v.deliveriesCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
