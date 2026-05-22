import React, { useRef, useEffect, useState } from 'react';
import { Order, NodeType } from '../types';

interface MapCanvasProps {
  activeOrders: Order[];
  onSelectNode: (nodeId: 'Cabecera' | 'Provenza' | 'La Isla') => void;
  selectedOrigin: string | null;
  selectedDestination: string | null;
  simulationSpeed: number; // 1x, 2x, 5x, etc.
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0 to 1
  color: string;
  size: number;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  activeOrders,
  onSelectNode,
  selectedOrigin,
  selectedDestination,
  simulationSpeed,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  const particlesRef = useRef<Particle[]>([]);

  // Fixed coordinates in percentage points (0-100) to keep map responsive
  const NODES_CONFIG = {
    'Cabecera': { xPct: 25, yPct: 18, name: 'Cabecera', type: 'Foco Comercial', color: '#10b981', desc: 'Centro alta demanda' },
    'Micro-Hub': { xPct: 62, yPct: 45, name: 'Micro-Hub', type: 'Centro de Acopio', color: '#06b6d4', desc: 'Paneles Solares y Carga' },
    'Provenza': { xPct: 82, yPct: 75, name: 'Provenza', type: 'Zona Residencial', color: '#10b981', desc: 'Sectores en expansión' },
    'La Isla': { xPct: 38, yPct: 82, name: 'La Isla', type: 'Distribución Técnica', color: '#10b981', desc: 'Soporte y logística' },
  };

  // Convert percentages to actual canvas pixels
  const getAbsoluteCoords = (pctX: number, pctY: number) => {
    return {
      x: (pctX / 100) * dimensions.width,
      y: (pctY / 100) * dimensions.height,
    };
  };

  // Observe container resize to keep canvas fluid
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        // Keep a neat aspect ratio (aspect-video or solid landscape)
        const calculatedHeight = Math.max(350, Math.min(width * 0.7, 500));
        setDimensions({
          width: width || 500,
          height: calculatedHeight,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Hover/Click detection for Canvas nodes
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check which node was clicked
    let clickedNode: string | null = null;
    Object.entries(NODES_CONFIG).forEach(([key, value]) => {
      if (key === 'Micro-Hub') return; // Cannot select hub as order endpoints
      const coords = getAbsoluteCoords(value.xPct, value.yPct);
      const dist = Math.hypot(clickX - coords.x, clickY - coords.y);
      if (dist < 28) {
        clickedNode = key;
      }
    });

    if (clickedNode) {
      onSelectNode(clickedNode as 'Cabecera' | 'Provenza' | 'La Isl');
    }
  };

  // Main high-performance Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let pulseAngle = 0;

    const render = () => {
      pulseAngle += 0.04;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // 1. Draw Digital Grid Background
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < dimensions.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.height);
        ctx.stroke();
      }
      for (let y = 0; y < dimensions.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.width, y);
        ctx.stroke();
      }

      // Draw aesthetic topographic rings (futuristic map feeling)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.03)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(dimensions.width * 0.5, dimensions.height * 0.5, dimensions.width * 0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(dimensions.width * 0.5, dimensions.height * 0.5, dimensions.width * 0.22, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw Road Connections / Logistical Triangle (dashed paths)
      const cabCoords = getAbsoluteCoords(NODES_CONFIG['Cabecera'].xPct, NODES_CONFIG['Cabecera'].yPct);
      const hubCoords = getAbsoluteCoords(NODES_CONFIG['Micro-Hub'].xPct, NODES_CONFIG['Micro-Hub'].yPct);
      const provCoords = getAbsoluteCoords(NODES_CONFIG['Provenza'].xPct, NODES_CONFIG['Provenza'].yPct);
      const islaCoords = getAbsoluteCoords(NODES_CONFIG['La Isla'].xPct, NODES_CONFIG['La Isla'].yPct);

      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.4)';
      ctx.setLineDash([5, 8]);

      // Connect all endpoints to the Central Micro-Hub
      const connections = [
        [cabCoords, hubCoords],
        [provCoords, hubCoords],
        [islaCoords, hubCoords],
        [islaCoords, provCoords] // Additional link in Cabecera-Provenza-La Isla triangle
      ];

      connections.forEach(([from, to]) => {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      });
      ctx.setLineDash([]); // Reset line dash

      // 3. Update & Draw Particles (Electric flow effect behind deliveries)
      activeOrders.forEach(order => {
        if (order.status !== 'entregado' && order.status !== 'pedido') {
          // Add particles periodically
          if (Math.random() < 0.25 * simulationSpeed) {
            particlesRef.current.push({
              x: order.currentX,
              y: order.currentY,
              vx: (Math.random() - 0.5) * 0.8,
              vy: (Math.random() - 0.5) * 0.8 - 0.5,
              life: 1.0,
              color: order.color || '#10b981',
              size: Math.random() * 3.5 + 1.5
            });
          }
        }
      });

      // Render Active Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.size *= 0.97;

        if (p.life > 0) {
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0; // Reset
          return true;
        }
        return false;
      });

      // 4. Draw Delivery Nodes
      Object.entries(NODES_CONFIG).forEach(([key, node]) => {
        const coords = getAbsoluteCoords(node.xPct, node.yPct);
        const name = node.name;
        const color = node.color;
        const stateIsOrigin = selectedOrigin === key;
        const stateIsDest = selectedDestination === key;

        // Visual pulses
        const pulseRadius = 15 + Math.sin(pulseAngle) * 5;
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = key === 'Micro-Hub' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(16, 185, 129, 0.12)';
        ctx.fill();

        if (stateIsOrigin || stateIsDest) {
          // Highlight nodes selected in the form
          ctx.beginPath();
          ctx.arc(coords.x, coords.y, 24 + Math.sin(pulseAngle * 1.5) * 3, 0, Math.PI * 2);
          ctx.strokeStyle = stateIsOrigin ? '#f59e0b' : '#3b82f6';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw core node circle
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, key === 'Micro-Hub' ? 14 : 11, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw node icon/indicator symbols
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (key === 'Micro-Hub') {
          // Draw mini battery charging symbol inside
          ctx.fillStyle = '#ffffff';
          ctx.fillText('⚡', coords.x, coords.y);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillText(name[0], coords.x, coords.y);
        }

        // Labels
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(name, coords.x, coords.y - 32);

        ctx.font = '10px monospace';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(node.type, coords.x, coords.y - 18);
      });

      // 5. Draw Animated Motorcycles
      activeOrders.forEach(order => {
        if (order.status === 'pedido' || order.status === 'entregado') return;

        // Render the motorcycle/delivery carrier
        const x = order.currentX;
        const y = order.currentY;

        // Outer glow
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fill();

        // Core moto circle marked with its color
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fillStyle = order.color;
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner electric core
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Text tag above motorcycle
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`M${order.motoId}`, x, y - 23);

        // Active status tag / tiny bubble
        ctx.fillStyle = '#020617';
        ctx.fillRect(x - 22, y - 14, 44, 9);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeRect(x - 22, y - 14, 44, 9);

        ctx.fillStyle = order.segment === 'at_hub' ? '#f97316' : '#14b8a6';
        ctx.font = '7px sans-serif';
        const labelText = order.segment === 'to_hub' ? '➜ ACOPIO' : order.segment === 'at_hub' ? '⚡ CARGANDO' : '➜ DESTINO';
        ctx.fillText(labelText, x, y - 12);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, activeOrders, selectedOrigin, selectedDestination, simulationSpeed]);

  return (
    <div className="relative w-full rounded-2xl bg-neutral-950 border border-emerald-900/30 overflow-hidden shadow-2xl">
      {/* Decorative tech HUD rails */}
      <div className="absolute top-3 left-4 flex items-center space-x-2 z-10 pointers-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-[10px] font-mono tracking-widest text-emerald-500 uppercase">MAPA EN VIVO - TRIÁNGULO BUCARAMANGA</span>
      </div>
      
      <div className="absolute top-3 right-4 flex items-center space-x-3 z-10 font-mono text-[9px] text-zinc-500">
        <div>COORDENADAS: LAT-LON SIM</div>
        <div className="text-emerald-500/60 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/20">
          60 FPS ACTIVE
        </div>
      </div>

      <div ref={containerRef} className="w-full flex items-center justify-center p-4">
        <canvas
          id="simulation-canvas"
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleCanvasClick}
          className="cursor-pointer block max-w-full rounded-lg"
          style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        />
      </div>

      {/* Legend inside the map */}
      <div className="absolute bottom-3 left-4 right-4 py-2 px-3 bg-neutral-900/90 backdrop-blur-md rounded-xl border border-zinc-800/60 flex flex-wrap gap-4 items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 uppercase font-mono">Leyenda:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-black/50"></span>
            <span>Nodos Envíos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500 inline-block border border-black/50"></span>
            <span>Micro-Hub Central</span>
          </div>
        </div>
        <div className="text-[10px] text-emerald-400/80 font-mono bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/30">
          💡 Haga clic sobre un nodo en el mapa para seleccionarlo como origen/destino.
        </div>
      </div>
    </div>
  );
};
