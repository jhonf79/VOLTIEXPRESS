import React from 'react';
import { Order, SystemLog } from '../types';
import { Terminal, CheckCircle2, ChevronRight, Truck, Info, AlertTriangle } from 'lucide-react';

interface LogPanelProps {
  logs: SystemLog[];
  activeOrders: Order[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs, activeOrders }) => {
  const ongoingOrders = activeOrders.filter(o => o.status !== 'entregado');
  const completedOrders = activeOrders.filter(o => o.status === 'entregado');

  // Helper log color
  const getLogTypeColor = (type: SystemLog['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'warn': return 'text-orange-400';
      case 'action': return 'text-cyan-400';
      default: return 'text-zinc-350';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* 1. REGISTRO DEL SISTEMA (LIVE TERMINAL) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
        <div className="space-y-3.5 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center space-x-2.5">
              <Terminal className="text-emerald-400 animate-pulse" size={16} />
              <span className="text-xs font-bold text-white tracking-wide">Registro del Sistema (Live Log)</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">VoltiExpress Central</span>
          </div>

          {/* Terminal stream */}
          <div className="mt-3 bg-zinc-950 font-mono text-[11px] rounded-xl p-4 border border-zinc-850 h-[190px] overflow-y-auto space-y-2 flex flex-col-reverse justify-start">
            <div className="flex flex-col space-y-1.5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-1.5 leading-relaxed text-zinc-355">
                  <span className="text-zinc-600 select-none font-bold">[{log.timestamp}]</span>
                  <span className={getLogTypeColor(log.type)}>{log.message}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-zinc-600 italic">No hay logs en el historial del sistema. Sube tu primer pedido para iniciar...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PEDIDOS EN PARALELO (MONITOR) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center space-x-2.5">
            <Truck className="text-cyan-400" size={16} />
            <span className="text-xs font-bold text-white tracking-wide text-zinc-200">Pedidos Activos en Paralelo</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full font-bold">
            {ongoingOrders.length} MOTOS EN RUTA
          </span>
        </div>

        <div className="mt-4 space-y-3 max-h-[190px] overflow-y-auto pr-1">
          {ongoingOrders.map((order) => {
            // progress is divided in stages: to_hub is 0-50%, at_hub is 50%, to_dest is 50-100%
            let stageNum = 1;
            if (order.segment === 'at_hub') stageNum = 3;
            else if (order.segment === 'to_dest') stageNum = 4;
            else if (order.status === 'pedido') stageNum = 1;
            else if (order.status === 'calculando_ruta') stageNum = 2;

            return (
              <div key={order.id} className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 space-y-2 transition hover:border-zinc-700">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: order.color }}></span>
                    <span className="font-bold text-white font-mono">#{order.number} {order.origin} → {order.destination}</span>
                  </div>
                  <span 
                    className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full font-bold border"
                    style={{ borderColor: `${order.color}40`, color: order.color, backgroundColor: `${order.color}10` }}
                  >
                    MOTO #{order.motoId} • {order.type}
                  </span>
                </div>

                {/* Progress Bar representation matching slide 16 exactly */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="text-zinc-550 flex items-center gap-1">
                      ETAPA: {stageNum}/5 ({
                        order.segment === 'to_hub' ? 'Cargando hacia acopio' :
                        order.segment === 'at_hub' ? 'Consolidación de carga' : 'Entrega última milla'
                      })
                    </span>
                    <span className="font-bold text-white">{Math.round(order.progress)}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden flex gap-0.5">
                    {/* Visual Segment bars */}
                    <div 
                      className="bg-emerald-500 rounded-l h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, order.segment === 'to_hub' ? order.segmentProgress * 100 : 100))}%` }}
                    />
                    <div 
                      className={`h-full transition-all duration-300 ${order.segment === 'at_hub' ? 'bg-amber-500 rounded' : order.segment === 'to_dest' ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                      style={{ width: '15%' }}
                    />
                    <div 
                      className="bg-emerald-500 rounded-r h-full transition-all duration-300"
                      style={{ width: `${order.segment === 'to_dest' ? order.segmentProgress * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-0.5">
                  <span>⏱ Retorno Est.: {order.estimatedMinutes} min</span>
                  <span>🌿 Coche Eléctrico (0g CO₂)</span>
                </div>
              </div>
            );
          })}

          {ongoingOrders.length === 0 && (
            <div className="text-zinc-500 italic text-xs h-[100px] flex items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
              No hay motocicletas activas en este momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
