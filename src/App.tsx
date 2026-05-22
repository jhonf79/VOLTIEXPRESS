import { useState, useEffect, useRef } from 'react';
import { Order, OrderType, OrderStatus, SystemLog, MetricSummary, ElectricVehicle, SolarHubStatus } from './types';
import { MapCanvas } from './components/MapCanvas';
import { StatsPanel } from './components/StatsPanel';
import { OrderForm } from './components/OrderForm';
import { LogPanel } from './components/LogPanel';
import { FleetMonitor } from './components/FleetMonitor';
import { HubMonitor } from './components/HubMonitor';
import { 
  Truck, 
  Leaf, 
  Clock, 
  Compass, 
  Settings, 
  Cpu, 
  Sparkles,
  Info,
  Radio,
  Server,
  CloudSun
} from 'lucide-react';

const COLORS = [
  '#22d3ee', // Cyan
  '#a855f7', // Violet
  '#f97316', // Orange
  '#eab308', // Yellow
  '#ec4899', // Pink
  '#84cc16'  // Lime Green
];

const NODES_POS = {
  'Cabecera': { x: 25, y: 18 },
  'Micro-Hub': { x: 62, y: 45 },
  'Provenza': { x: 82, y: 75 },
  'La Isla': { x: 38, y: 82 }
};

const INITIAL_VEHICLES: ElectricVehicle[] = [
  { id: 1, driverName: 'C. Dallos', batteryPct: 100, status: 'DISPONIBLE', temperatureC: 24.5, deliveriesCount: 0, currentKwhRate: 0 },
  { id: 2, driverName: 'E. Cornejo', batteryPct: 95, status: 'DISPONIBLE', temperatureC: 25.2, deliveriesCount: 0, currentKwhRate: 0 },
  { id: 3, driverName: 'C. Patricia', batteryPct: 88, status: 'DISPONIBLE', temperatureC: 23.8, deliveriesCount: 0, currentKwhRate: 0 },
  { id: 4, driverName: 'S. Jhon', batteryPct: 100, status: 'DISPONIBLE', temperatureC: 24.0, deliveriesCount: 0, currentKwhRate: 0 },
  { id: 5, driverName: 'S. Sophia', batteryPct: 100, status: 'DISPONIBLE', temperatureC: 24.9, deliveriesCount: 0, currentKwhRate: 0 },
  { id: 6, driverName: 'A. Prada', batteryPct: 92, status: 'DISPONIBLE', temperatureC: 23.4, deliveriesCount: 0, currentKwhRate: 0 },
  { id: 7, driverName: 'C. Villamil', batteryPct: 97, status: 'DISPONIBLE', temperatureC: 24.1, deliveriesCount: 0, currentKwhRate: 0 },
  { id: 8, driverName: 'F. Silva', batteryPct: 100, status: 'DISPONIBLE', temperatureC: 25.0, deliveriesCount: 0, currentKwhRate: 0 },
];

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState<boolean>(false);
  const [selectedOrigin, setSelectedOrigin] = useState<'Cabecera' | 'Provenza' | 'La Isla' | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<'Cabecera' | 'Provenza' | 'La Isla' | null>(null);
  const [simTime, setSimTime] = useState<string>('20:52');

  // Enterprise IoT States
  const [vehicles, setVehicles] = useState<ElectricVehicle[]>(INITIAL_VEHICLES);
  const [weather, setWeather] = useState<'Despejado' | 'Lluvia' | 'Tormenta'>('Despejado');
  const [trafficCongestion, setTrafficCongestion] = useState<'Bajo' | 'Moderado' | 'Embotellamiento'>('Moderado');
  const [hubStatus, setHubStatus] = useState<SolarHubStatus>({
    solarProductionKw: 18.5,
    batteryReserverKwh: 72.0,
    powerExchangedGridKw: 4.2,
    packagesStored: 0,
    activeChargers: 0
  });

  const orderCounterRef = useRef<number>(1);
  const logCounterRef = useRef<number>(1);

  // Función para crear una marca de tiempo estándar del sistema.
  const getSimTimestamp = () => {
    const d = new Date();
    const min = d.getMinutes().toString().padStart(2, '0');
    const sec = d.getSeconds().toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // Push a new message to the system logs
  const pushLog = (message: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = {
      id: `log-${logCounterRef.current++}-${Date.now()}`,
      timestamp: getSimTimestamp(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Conservar los últimos 50 registros
  };

  // Agregar registros iniciales en el montaje
  useEffect(() => {
    pushLog('Sistema Operativo de Despacho VoltiExpress v2.0 Iniciado.', 'info');
    pushLog('Servicio telemático conectado con 8 motocicletas eléctricas de litio.', 'success');
    pushLog('Baterías flotantes al 100%. Micro-Hub centralizado activo en La Isla.', 'action');
  }, []);

  // Actualizar el reloj de la tarjeta SIM
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const d = new Date();
      setSimTime(d.toISOString().slice(11, 16));
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Gestionar la devolución de llamada de selección de nodos del mapa
  const handleSelectNodeFromMap = (nodeId: 'Cabecera' | 'Provenza' | 'La Isla') => {
    if (!selectedOrigin) {
      setSelectedOrigin(nodeId);
      pushLog(`Console: Punto de acopio de origen fijado: ${nodeId}`, 'action');
    } else if (nodeId === selectedOrigin) {
      setSelectedOrigin(null);
      pushLog(`Console: Origen deseleccionado.`, 'info');
    } else {
      setSelectedDestination(nodeId);
      pushLog(`Console: Punto final de entrega rápida fijado: ${nodeId}`, 'action');
    }
  };

  // Formular métricas de entrega por coordenadas (distancia en km)
  const calculateDistance = (from: string, to: string): number => {
    if (from === 'Cabecera' && to === 'La Isla') return 3.2;
    if (from === 'La Isla' && to === 'Cabecera') return 3.2;
    if (from === 'Cabecera' && to === 'Provenza') return 4.2;
    if (from === 'Provenza' && to === 'Cabecera') return 4.2;
    if (from === 'Provenza' && to === 'La Isla') return 2.5;
    if (from === 'La Isla' && to === 'Provenza') return 2.5;
    return 3.0; // Fallback default
  };

  // Envío de pedidos estándar de electricidad verde
  const handleDispatchOrder = (
    origin: 'Cabecera' | 'Provenza' | 'La Isla',
    destination: 'Cabecera' | 'Provenza' | 'La Isla',
    type: OrderType
  ) => {
    const orderNum = orderCounterRef.current++;
    const distance = calculateDistance(origin, destination);
    
    // 0.12 kg of CO2 saved per km as a replacement of gas motorcycles (120g/km emission saved!)
    const co2Saved = Number((distance * 0.12).toFixed(2));
    
    // Minutes estimate based on type
    let minutes = Math.round(distance * 4.5);
    if (type === 'Express') minutes = Math.round(minutes * 0.8);
    if (type === 'Farmacia refrigerado') minutes = Math.round(minutes * 1.9);

    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // Asigne un vehículo que esté DISPONIBLE actualmente (preferiblemente con la batería de mayor capacidad).
    const availableVehicles = vehicles.filter(v => v.status === 'DISPONIBLE' || v.status === 'CARGANDO');
    let assignedVehIndex = Math.floor(Math.random() * vehicles.length);
    if (availableVehicles.length > 0) {
      // Encuentra el vehículo disponible con batería máxima
      const keyVehicle = availableVehicles.reduce((prev, current) => (prev.batteryPct > current.batteryPct) ? prev : current);
      assignedVehIndex = vehicles.findIndex(v => v.id === keyVehicle.id);
    }
    const realMotoId = vehicles[assignedVehIndex].id;

    // Standard high-capacity battery consumption (0.05 kWh per km average for light freight)
    const energyNeeded = distance * 0.05;

    const newOrder: Order = {
      id: `order-${orderNum}-${Date.now()}`,
      number: orderNum,
      origin,
      destination,
      type,
      status: 'pedido',
      createdAt: Date.now(),
      progress: 0,
      motoId: realMotoId,
      color: randomColor,
      currentX: NODES_POS[origin].x,
      currentY: NODES_POS[origin].y,
      segment: 'to_hub',
      segmentProgress: 0,
      dwellTimeRemaining: 0,
      estimatedMinutes: minutes,
      co2Saved,
      distanceKm: distance,
      energyConsumedKwh: energyNeeded
    };

    setOrders(prev => [...prev, newOrder]);
    
    // Temporarily update vehicle state to RUTA
    setVehicles(prev => prev.map(v => v.id === realMotoId ? { ...v, status: 'RUTA' } : v));
    
    pushLog(`Despacho #${orderNum}: Asignado a transportador M-${realMotoId} (${vehicles[assignedVehIndex].driverName}).`, 'info');
    pushLog(`Ruta de entrega segura trazada a través del acopio Micro-Hub centralizado.`, 'action');
  };

  // Environment and vehicle status physics updater loop (runs every 40ms)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Calculate step parameters from environment factors
      let weatherModifier = 1.0;
      if (weather === 'Lluvia') weatherModifier = 0.82;
      if (weather === 'Tormenta') weatherModifier = 0.65;

      let trafficModifier = 1.0;
      if (trafficCongestion === 'Moderado') trafficModifier = 0.85;
      if (trafficCongestion === 'Embotellamien') trafficModifier = 0.50;

      // Base physical speed step inside the canvas
      const step = 0.0055 * simulationSpeed * weatherModifier * trafficModifier;

      // Track active orders being updated
      let activeOrderMotosSet = new Set<number>();
      let chargingMotosSet = new Set<number>();
      let packagesInWarehouse = 0;

      setOrders(prevOrders => {
        let isAnyUpdated = false;
        
        const updated = prevOrders.map(order => {
          if (order.status === 'entregado') return order;
          
          isAnyUpdated = true;
          let newSegment = order.segment;
          let newSegmentProgress = order.segmentProgress;
          let newDwell = order.dwellTimeRemaining;
          let newStatus = order.status;
          let newProgress = order.progress;

          // Flag motorcycle activity
          activeOrderMotosSet.add(order.motoId);
          
          if (order.segment === 'to_hub') {
            newSegmentProgress += step;
            newStatus = 'calculando_ruta';
            newProgress = Math.min(45, newSegmentProgress * 45);
            
            if (newSegmentProgress >= 1.0) {
              newSegmentProgress = 0;
              newSegment = 'at_hub';
              newStatus = 'en_acopio';
              newDwell = 45; // duration of consolidation dwell
              pushLog(`Ingreso Hub: M-${order.motoId} llegó al depósito central de La Isla con pedido #${order.number}.`, 'info');
            }
          } else if (order.segment === 'at_hub') {
            newDwell -= 1 * simulationSpeed;
            newProgress = 45 + (1 - Math.max(0, newDwell) / 45) * 10;
            chargingMotosSet.add(order.motoId);
            packagesInWarehouse++;
            
            if (newDwell <= 0) {
              newSegment = 'to_dest';
              newStatus = 'en_ruta';
              newSegmentProgress = 0;
              pushLog(`Salida Hub: Pedidos agrupados. Transportador M-${order.motoId} sale a última milla hacia ${order.destination}.`, 'action');
            }
          } else if (order.segment === 'to_dest') {
            newSegmentProgress += step * 0.9; // last mile slightly slower
            newProgress = 55 + Math.min(45, newSegmentProgress * 45);
            
            if (newSegmentProgress >= 1.0) {
              newSegmentProgress = 1.0;
              newSegment = 'done';
              newStatus = 'entregado';
              newProgress = 100;

              // Register cumulative delivery statistics in vehicles
              setVehicles(vPrev => vPrev.map(v => v.id === order.motoId ? {
                ...v,
                status: 'DISPONIBLE',
                deliveriesCount: v.deliveriesCount + 1
              } : v));

              pushLog(`✔ Entrega Exitosa: Pedido #${order.number} ingresado a destino (${order.destination}). Recorrido verde realizado.`, 'success');
            }
          }

          // Compute percentage coordinates for Canvas renderer
          let currentX = 0;
          let currentY = 0;
          
          const originCoords = NODES_POS[order.origin];
          const hubCoords = NODES_POS['Micro-Hub'];
          const destCoords = NODES_POS[order.destination];
          
          if (newSegment === 'to_hub') {
            currentX = originCoords.x + (hubCoords.x - originCoords.x) * newSegmentProgress;
            currentY = originCoords.y + (hubCoords.y - originCoords.y) * newSegmentProgress;
          } else if (newSegment === 'at_hub') {
            currentX = hubCoords.x;
            currentY = hubCoords.y;
          } else if (newSegment === 'to_dest') {
            currentX = hubCoords.x + (destCoords.x - hubCoords.x) * newSegmentProgress;
            currentY = hubCoords.y + (destCoords.y - hubCoords.y) * newSegmentProgress;
          } else {
            currentX = destCoords.x;
            currentY = destCoords.y;
          }

          return {
            ...order,
            status: newStatus,
            segment: newSegment,
            segmentProgress: newSegmentProgress,
            dwellTimeRemaining: newDwell,
            progress: newProgress,
            currentX,
            currentY
          };
        });

        if (!isAnyUpdated) return prevOrders;
        return updated;
      });

      // 2. Physical Battery and IoT parameters simulation for our 8 active vehicles
      setVehicles(vPrev => vPrev.map(v => {
        let batteryPct = v.batteryPct;
        let status = v.status;
        let temperatureC = v.temperatureC;
        let currentKwhRate = 0;

        const isMotoInRoute = activeOrderMotosSet.has(v.id);
        const isChargingAtHub = chargingMotosSet.has(v.id);

        if (isChargingAtHub) {
          status = 'CARGANDO';
          // Supercharge at the Solar Micro-Hub station (+0.75% per frame)
          batteryPct = Math.min(100, batteryPct + 0.5 * simulationSpeed);
          currentKwhRate = 22.4; // Charger power draw
          temperatureC = Math.min(41.0, temperatureC + 0.15 * simulationSpeed); // Batt warms during fast charge
        } else if (isMotoInRoute) {
          status = 'RUTA';
          // Discharge light battery (-0.08% per frame in operation step)
          batteryPct = Math.max(2.0, batteryPct - 0.08 * simulationSpeed);
          currentKwhRate = -4.5; // Discharge power rate
          temperatureC = Math.min(38.0, Math.max(26.0, temperatureC + 0.08 * simulationSpeed));
        } else {
          status = 'DISPONIBLE';
          // Cool down to ambient temperature
          temperatureC = Math.max(24.0, temperatureC - 0.06 * simulationSpeed);
          currentKwhRate = 0.0;
          // Keep charging slowly if idle and already at 100%
          if (batteryPct < 98) {
            batteryPct = Math.min(100, batteryPct + 0.02);
          }
        }

        return {
          ...v,
          batteryPct,
          status,
          temperatureC,
          currentKwhRate
        };
      }));

      // 3. Modulate Solar Hub power telemetry in real-time
      setHubStatus(prev => {
        let baseSolarGen = 16.5; 
        if (weather === 'Despejado') baseSolarGen = 22.4 + (Math.random() - 0.5) * 1.5;
        if (weather === 'Lluvia') baseSolarGen = 6.8 + (Math.random() - 0.5) * 0.4;
        if (weather === 'Tormenta') baseSolarGen = 2.1 + (Math.random() - 0.5) * 0.2;

        const totalDrawFromMotos = chargingMotosSet.size * 22.4; // motos charging draw kwh
        const balance = baseSolarGen - (totalDrawFromMotos / 10); // rate of battery charging

        let newReserve = prev.batteryReserverKwh + (balance * 0.02 * simulationSpeed);
        newReserve = Math.max(10, Math.min(85, newReserve)); // battery capacity limits in kWh

        return {
          solarProductionKw: baseSolarGen,
          batteryReserverKwh: newReserve,
          powerExchangedGridKw: balance > 0 ? balance : 0,
          packagesStored: packagesInWarehouse,
          activeChargers: chargingMotosSet.size
        };
      });

    }, 45);

    return () => clearInterval(interval);
  }, [simulationSpeed, weather, trafficCongestion]);

  // Automatic Dispatch Scheduler (Random traffic)
  useEffect(() => {
    if (!autoDispatchEnabled) return;

    // Dispatch a random order every 5 seconds (relative to simulation speed)
    const intervalTime = Math.max(1500, 5000 / simulationSpeed);
    const interval = setInterval(() => {
      const endpoints: ('Cabecera' | 'Provenza' | 'La Isla')[] = ['Cabecera', 'Provenza', 'La Isla'];
      
      const randomOriginIdx = Math.floor(Math.random() * endpoints.length);
      let randomDestIdx = Math.floor(Math.random() * endpoints.length);
      
      while (randomDestIdx === randomOriginIdx) {
        randomDestIdx = Math.floor(Math.random() * endpoints.length);
      }

      const types: OrderType[] = ['Express', 'Estándar', 'Farmacia refrigerado'];
      const randomType = types[Math.floor(Math.random() * types.length)];

      handleDispatchOrder(endpoints[randomOriginIdx], endpoints[randomDestIdx], randomType);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [autoDispatchEnabled, simulationSpeed]);

  // Reset entire simulation metrics
  const handleResetSimulation = () => {
    setOrders([]);
    setLogs([]);
    orderCounterRef.current = 1;
    logCounterRef.current = 1;
    setSelectedOrigin(null);
    setSelectedDestination(null);
    setVehicles(INITIAL_VEHICLES);
    pushLog('Simulación e IoT restablecida. Flota telemetrada re-calibrada a valores nominales.', 'warn');
  };

  // Compile totals for Stats Dashboard
  const co2SavedTotal = orders.reduce((sum, order) => order.status === 'entregado' ? sum + order.co2Saved : sum, 0);
  const deliveriesCompleted = orders.filter(order => order.status === 'entregado').length;
  const activeDeliveriesCount = orders.filter(order => order.status !== 'entregado').length;
  
  const simulationMetrics: MetricSummary = {
    co2SavedTotal,
    deliveriesCompleted,
    timeSavedPercent: 25,
    costReducedPercent: 30,
    activeDeliveriesCount,
    ecoPoints: deliveriesCompleted * 150
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500 selection:text-black">
      {/* 1. ENTERPRISE HEADER (NO ACADEMIC REFERENCE / NO STUDENT TRACES) */}
      <header className="border-b border-zinc-900 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3.5 text-center md:text-left">
            <div className="p-2.5 bg-emerald-500 rounded-xl text-slate-950 shadow-md shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
              <Truck size={22} className="stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 justify-center md:justify-start">
                <span className="text-lg font-black tracking-wider text-white uppercase font-sans">
                  VOLTI<span className="text-emerald-400">EXPRESS</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-900 px-2 py-0.5 rounded uppercase font-bold">
                  SISTEMA DE CONTROL LOGÍSTICO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium tracking-wide">
                Consola Central de Despacho Logístico Automatizado y Flotas Eléctricas Terrestres
              </p>
            </div>
          </div>

          {/* Operational HUD */}
          <div className="flex flex-wrap items-center gap-4 justify-between w-full md:w-auto md:justify-end">
            <div className="flex items-center space-x-3 bg-zinc-950 px-3.5 py-1.5 rounded-lg border border-zinc-850">
              <Server size={14} className="text-emerald-500" />
              <div className="text-left font-mono">
                <span className="text-[8px] text-zinc-500 block uppercase">SERVIDOR LOGÍSTICO</span>
                <span className="text-[10px] font-bold text-white uppercase">ONLINE / BUCARAMANGA</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-zinc-950 px-3.5 py-1.5 rounded-lg border border-zinc-850">
              <div className="animate-pulse w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="text-left font-mono">
                <span className="text-[8px] text-zinc-500 block uppercase">TIEMPO CENTRAL</span>
               <span className="text-[10px] font-bold text-white tracking-widest">{simTime}</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 2. MAIN LOGISTICS WORKSPACE */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* UPPER DASHBOARD: EMISSIONS & COST REDUCTIONS METRICS */}
        <StatsPanel metrics={simulationMetrics} />

        {/* INTERACTIVE SOLAH HUB DIAGNOSTIC PANEL */}
        <HubMonitor 
          hubStatus={hubStatus}
          weather={weather}
          setWeather={setWeather}
          trafficCongestion={trafficCongestion}
          setTrafficCongestion={setTrafficCongestion}
        />

        {/* WORKSPACE SHADOW GRID: CANVAS MAP + SYSTEM CHANNELS | ADDS FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* PRIMARY GRAPHICS COLUMN (CANVAS MAP + LOG TERMINALS) */}
          <div className="lg:col-span-8 space-y-6">
            <MapCanvas 
              activeOrders={orders} 
              onSelectNode={handleSelectNodeFromMap}
              selectedOrigin={selectedOrigin}
              selectedDestination={selectedDestination}
              simulationSpeed={simulationSpeed}
            />

            <LogPanel logs={logs} activeOrders={orders} />
          </div>

          {/* RIGHT SIDE CONTROLS */}
          <div className="lg:col-span-4 h-full">
            <OrderForm 
              onDispatchOrder={handleDispatchOrder}
              onResetSimulation={handleResetSimulation}
              selectedOrigin={selectedOrigin}
              selectedDestination={selectedDestination}
              setSelectedOrigin={setSelectedOrigin}
              setSelectedDestination={setSelectedDestination}
              simulationSpeed={simulationSpeed}
              setSimulationSpeed={setSimulationSpeed}
              autoDispatchEnabled={autoDispatchEnabled}
              setAutoDispatchEnabled={setAutoDispatchEnabled}
            />

            {/* Micro operational instrucciones banner */}
            <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs space-y-2 text-zinc-400">
              <h5 className="font-bold text-white uppercase font-mono text-[10px] tracking-wider flex items-center gap-1.5">
                <Info size={13} className="text-emerald-400" /> Operaciones de Consola
              </h5>
              <div className="space-y-1.5 leading-relaxed text-zinc-400 font-mono text-[11px]">
                <p>• Haga clic en los nodos en el mapa para asignar el origen y destino.</p>
                <p>• Los despachos consumen kWh reales de las motos asignadas.</p>
                <p>• Al detenerse en el Micro-Hub, los vehículos son recargados con energía solar autogenerada.</p>
              </div>
            </div>
          </div>

        </div>

        {/* NEW HIGH-FIDELITY TELEMATICS VEHICLE PANEL */}
        <FleetMonitor vehicles={vehicles} />

      </main>

      {/* FOOTER - RETAINS PROFESSIONAL SIGNATURES */}
      <footer className="border-t border-zinc-900 bg-zinc-900/40 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-[11px]">
          <p>VoltiExpress Enterprise Cargo Fleet Monitor • Todos los derechos reservados C. DALLOS E. CORNEJO  © 2026</p>
          <p className="text-zinc-650 text-zinc-600">Sincronización GPS activa por telemetría IoT celular</p>
        </div>
      </footer>
    </div>
  );
}
