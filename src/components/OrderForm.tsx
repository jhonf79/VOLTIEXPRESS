import React, { useState } from 'react';
import { OrderType } from '../types';
import { PlusCircle, RotateCcw, ShieldCheck, Zap, HelpCircle } from 'lucide-react';

interface OrderFormProps {
  onDispatchOrder: (origin: 'Cabecera' | 'Provenza' | 'La Isla', destination: 'Cabecera' | 'Provenza' | 'La Isla', type: OrderType) => void;
  onResetSimulation: () => void;
  selectedOrigin: 'Cabecera' | 'Provenza' | 'La Isla' | null;
  selectedDestination: 'Cabecera' | 'Provenza' | 'La Isla' | null;
  setSelectedOrigin: (node: 'Cabecera' | 'Provenza' | 'La Isla' | null) => void;
  setSelectedDestination: (node: 'Cabecera' | 'Provenza' | 'La Isla' | null) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  autoDispatchEnabled: boolean;
  setAutoDispatchEnabled: (enabled: boolean) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  onDispatchOrder,
  onResetSimulation,
  selectedOrigin,
  selectedDestination,
  setSelectedOrigin,
  setSelectedDestination,
  simulationSpeed,
  setSimulationSpeed,
  autoDispatchEnabled,
  setAutoDispatchEnabled,
}) => {
  const [shippingType, setShippingType] = useState<OrderType>('Express');

  const nodesList: ('Cabecera' | 'Provenza' | 'La Isla')[] = ['Cabecera', 'Provenza', 'La Isla'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrigin && selectedDestination && selectedOrigin !== selectedDestination) {
      onDispatchOrder(selectedOrigin, selectedDestination, shippingType);
      
      // Let's reset selections to prompt fresh node selections or clicks
      setSelectedOrigin(null);
      setSelectedDestination(null);
    }
  };

  const isDispatchDisabled = !selectedOrigin || !selectedDestination || selectedOrigin === selectedDestination;

  // Describe times and attributes based on types
  const getDeliveryInfo = (type: OrderType) => {
    switch (type) {
      case 'Express':
        return '12-17 min est. | Motos prioritarias de alta rotación.';
      case 'Estándar':
        return '18-26 min est. | Ruteo equilibrado de paquetes generales.';
      case 'Farmacia refrigerado':
        return '15-20 min est. | Contenedor térmico con fibra de vidrio reforzada activa.';
    }
  };

  return (
    <div id="order-controls" className="bg-zinc-900 border border-zinc-805 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
      {/* SECTION 1: MANUAL ORDER GENERATION (PMV App simulation) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <PlusCircle className="text-emerald-400" size={18} />
            <span className="text-sm font-bold text-white tracking-wide">Nueva Orden VoltiExpress</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Panel de Despacho</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Node selections */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1.5 tracking-wider">
                📍 Punto de Origen
              </label>
              <select
                value={selectedOrigin || ''}
                onChange={(e) => setSelectedOrigin(e.target.value as 'Cabecera' | 'Provenza' | 'La Isla' || null)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Seleccione...</option>
                {nodesList.map((node) => (
                  <option key={node} value={node}>{node}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1.5 tracking-wider">
                🏁 Destinatario
              </label>
              <select
                value={selectedDestination || ''}
                onChange={(e) => setSelectedDestination(e.target.value as 'Cabecera' | 'Provenza' | 'La Isla' || null)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Seleccione...</option>
                {nodesList.map((node) => (
                  <option key={node} value={node}>{node}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedOrigin && selectedDestination && selectedOrigin === selectedDestination && (
            <div className="p-2.5 bg-red-950/30 border border-red-900/50 rounded-xl text-[11px] text-red-400 font-mono text-center">
              ⚠ El origen y el destino no pueden ser el mismo nodo.
            </div>
          )}

          {/* Shipping type */}
          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1.5 tracking-wider">
              ⚡ Tipo de Envío
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Express', 'Estándar', 'Farmacia refrigerado'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setShippingType(type)}
                  className={`py-2 px-1 text-[10px] rounded-xl font-bold font-mono transition text-center ${shippingType === type ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 shadow' : 'bg-zinc-950 text-zinc-400 border border-zinc-850 hover:bg-zinc-900'}`}
                >
                  {type === 'Farmacia refrigerado' ? '🌡️ Farmacia' : type}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-mono flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-500 flex-shrink-0" />
              <span>{getDeliveryInfo(shippingType)}</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isDispatchDisabled}
            className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 text-xs transition ${isDispatchDisabled ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-900/20 active:translate-y-[0.5px]'}`}
          >
            <span>+ Enviar Pedido Eléctrico</span>
          </button>
        </form>
      </div>

      {/* SECTION 2: SIMULATION & TIME CONTROL CONTROLS */}
      <div className="border-t border-zinc-800/80 pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">🔧 Mandos de la Simulación</span>
          <span className="text-[10px] font-mono text-emerald-500 font-bold">SYSTEMA LOGÍSTICO</span>
        </div>

        {/* Speed selectors */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-505 text-zinc-405 text-zinc-400">Velocidad del Tiempo:</span>
          <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
            {([1, 2, 4] as number[]).map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${simulationSpeed === speed ? 'bg-zinc-800 text-white' : 'text-zinc-550 text-zinc-400 hover:text-white'}`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Auto pilot order generation */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-1">
            <span className="text-zinc-400">Tráfico Inteligente Autonómo:</span>
          </div>
          <button
            onClick={() => setAutoDispatchEnabled(!autoDispatchEnabled)}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${autoDispatchEnabled ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/50 animate-pulse' : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:bg-zinc-900'}`}
          >
            {autoDispatchEnabled ? '● ACTIVO (Pedidos Auto)' : '○ DESACTIVADO'}
          </button>
        </div>

        {/* Total Reset button */}
        <button
          onClick={onResetSimulation}
          className="w-full py-2 bg-neutral-950 hover:bg-neutral-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center space-x-2"
        >
          <RotateCcw size={12} />
          <span>↺ Reiniciar Métricas y Simulación</span>
        </button>
      </div>
    </div>
  );
};
