import React from 'react';
import { MetricSummary } from '../types';
import { Leaf, Clock, TrendingDown, ShieldAlert, Award, Radio } from 'lucide-react';

interface StatsPanelProps {
  metrics: MetricSummary;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. CO2 AHORRADO */}
      <div 
        id="stat-co2"
        className="bg-neutral-900 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
          <Leaf size={72} className="text-emerald-500" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-wider text-emerald-500 uppercase font-semibold">Emisiones CO₂ Reducidas</span>
          <div className="p-1.5 bg-emerald-950/50 rounded-lg text-emerald-400 border border-emerald-900">
            <Leaf size={14} />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline space-x-1.5">
            <h3 className="text-4xl font-extrabold tracking-tight text-white font-mono">
              {metrics.co2SavedTotal.toFixed(2)}
            </h3>
            <span className="text-sm text-emerald-400 font-bold font-mono">kg</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">Flota 100% eléctrica activa</p>
        </div>
      </div>

      {/* 2. REDUCCIÓN EN TIEMPOS */}
      <div 
        id="stat-times"
        className="bg-neutral-900 border border-cyan-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
          <Clock size={72} className="text-cyan-500" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-wider text-cyan-550 uppercase font-semibold text-cyan-400">Eficiencia en Ruteo</span>
          <div className="p-1.5 bg-cyan-950/50 rounded-lg text-cyan-450 border border-cyan-900 text-cyan-400">
            <Clock size={14} />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline space-x-1">
            <h3 className="text-4xl font-extrabold tracking-tight text-white font-mono">
              25
            </h3>
            <span className="text-xl text-cyan-400 font-extrabold font-mono">%</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">Optimizado vs Tradicional</p>
        </div>
      </div>

      {/* 3. COSTOS OPERATIVOS */}
      <div 
        id="stat-costs"
        className="bg-neutral-900 border border-orange-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
          <TrendingDown size={72} className="text-orange-500" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-wider text-orange-400 uppercase font-semibold">Costos de Operación</span>
          <div className="p-1.5 bg-orange-950/50 rounded-lg text-orange-400 border border-orange-905">
            <TrendingDown size={14} />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline space-x-1">
            <h3 className="text-4xl font-extrabold tracking-tight text-white font-mono">
              -30
            </h3>
            <span className="text-xl text-orange-400 font-extrabold font-mono">%</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">Cero combustibles fósiles</p>
        </div>
      </div>

      {/* 4. PUNTO DE EQUILIBRIO / ECO GALAXY SCORE */}
      <div 
        id="stat-score"
        className="bg-neutral-900 border border-violet-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-violet-500/40 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
          <Award size={72} className="text-violet-500" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-wider text-violet-400 uppercase font-semibold">Eco-Puntos (Score)</span>
          <div className="p-1.5 bg-violet-950/50 rounded-lg text-violet-405 border border-violet-900 text-violet-400">
            <Award size={14} />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline space-x-1.5">
            <h3 className="text-4xl font-extrabold tracking-tight text-white font-mono">
              {metrics.ecoPoints}
            </h3>
            <span className="text-xs text-violet-400 font-bold font-mono">PTS</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">Retorno Est.: &lt; 12 meses</p>
        </div>
      </div>
    </div>
  );
};
