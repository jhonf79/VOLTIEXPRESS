export type NodeType = 'Cabecera' | 'Provenza' | 'La Is' | 'Micro-Hub';

export interface DeliveryNode {
  id: NodeType;
  name: string;
  x: number;
  y: number;
  description: string;
  type: 'demand' | 'residencial' | 'technic' | 'hub';
  color: string;
}

export type OrderType = 'Express' | 'Estánda' | 'Farmacia refrigerado';

export type OrderStatus = 'pedido' | 'calculando_ruta' | 'en_acopio' | 'en_ruta' | 'entregado';

export type SegmentType = 'to_hub' | 'at_hub' | 'to_dest' | 'done';

export interface Order {
  id: string;
  number: number;
  origin: 'Cabecera' | 'Provenza' | 'La Isla';
  destination: 'Cabecera' | 'Provenza' | 'La Isla';
  type: OrderType;
  status: OrderStatus;
  createdAt: number;
  progress: number; // overall progress 0-100%
  motoId: number;
  color: string;
  
  // Animation coordinates
  currentX: number;
  currentY: number;
  segment: SegmentType;
  segmentProgress: number; // 0 to 1
  dwellTimeRemaining: number; // frames/seconds remaining at hub
  
  // Metrics
  estimatedMinutes: number;
  co2Saved: number; // in kg
  distanceKm: number;
  energyConsumedKwh: number; // Consumption calculation
}

export interface SystemLog {
  id: string;
  timestamp: string; // "00:03" format
  message: string;
  type: 'info' | 'success' | 'warn' | 'action';
}

export interface MetricSummary {
  co2SavedTotal: number; // in kg
  deliveriesCompleted: number;
  timeSavedPercent: number; // typically 25% default
  costReducedPercent: number; // typically 30% default
  activeDeliveriesCount: number;
  ecoPoints: number; // Game score
}

// Enterprise components metadata
export interface ElectricVehicle {
  id: number;
  driverName: string;
  batteryPct: number;
  status: 'DISPONIBLE' | 'RUTA' | 'CARGANDO' | 'FUERA_SERVICIO';
  temperatureC: number;
  deliveriesCount: number;
  currentKwhRate: number; // power usage or charge rate
}

export interface SolarHubStatus {
  solarProductionKw: number; // solar generation
  batteryReserverKwh: number; // storage backup kwh
  powerExchangedGridKw: number; // feed in tariffs
  packagesStored: number;
  activeChargers: number;
}
