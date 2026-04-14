// ── Job Status ──
export enum JobStatus {
  Received = 'Received',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Delivered = 'Delivered'
}

// ── Payment Modes ──
export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Net Banking' | 'Other';

// ── User Roles ──
export type UserRole = 'admin' | 'staff';

// ── Vehicle Category & Type ──
export type VehicleCategory = 'Car' | 'Bike';

export type CarType = 'Hatchback' | 'Sedan / Crossover' | 'SUV / MPV' | 'Luxury';
export type BikeType = 'Below 350 CC' | 'Above 350 CC' | 'ADV/Sports above 900cc';
export type VehicleType = CarType | BikeType;

export const CAR_TYPES: CarType[] = ['Hatchback', 'Sedan / Crossover', 'SUV / MPV', 'Luxury'];
export const BIKE_TYPES: BikeType[] = ['Below 350 CC', 'Above 350 CC', 'ADV/Sports above 900cc'];

// ── Service Category ──
export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  selected?: boolean;
}

export type ServiceCategory =
  | 'Cars Wash'
  | 'Car Detailing'
  | 'Add-On'
  | 'Bike Wash'
  | 'Bike Add-On';

// ── Service Catalog with pricing per vehicle type ──
export interface ServiceCatalogItem {
  id: string;
  name: string;
  category: ServiceCategory;
  forVehicle: VehicleCategory;
  prices: { [vehicleType: string]: number }; // 0 = custom (admin enters manually)
}

export const SERVICE_CATALOG: ServiceCatalogItem[] = [

  // ─── Cars Wash ───
  { id: 'cw-foam', name: 'Foam Wash', category: 'Cars Wash', forVehicle: 'Car',
    prices: { 'Hatchback': 750, 'Sedan / Crossover': 850, 'SUV / MPV': 1000, 'Luxury': 1150 } },
  { id: 'cw-detailed', name: 'Detailed Wash', category: 'Cars Wash', forVehicle: 'Car',
    prices: { 'Hatchback': 900, 'Sedan / Crossover': 1000, 'SUV / MPV': 1100, 'Luxury': 1200 } },
  { id: 'cw-premium', name: 'Premium Wash', category: 'Cars Wash', forVehicle: 'Car',
    prices: { 'Hatchback': 1900, 'Sedan / Crossover': 2000, 'SUV / MPV': 2300, 'Luxury': 2500 } },

  // ─── Car Detailing ───
  { id: 'cd-interior', name: 'Interior Detailing', category: 'Car Detailing', forVehicle: 'Car',
    prices: { 'Hatchback': 3500, 'Sedan / Crossover': 4000, 'SUV / MPV': 4500, 'Luxury': 5000 } },
  { id: 'cd-exterior', name: 'Exterior Detailing', category: 'Car Detailing', forVehicle: 'Car',
    prices: { 'Hatchback': 4500, 'Sedan / Crossover': 5000, 'SUV / MPV': 5500, 'Luxury': 6000 } },
  { id: 'cd-combo', name: 'Interior & Exterior Detailing (Combo)', category: 'Car Detailing', forVehicle: 'Car',
    prices: { 'Hatchback': 7000, 'Sedan / Crossover': 8000, 'SUV / MPV': 9000, 'Luxury': 10000 } },

  // ─── Add-On (Car) ───
  { id: 'cs-ppf', name: 'Paint Protection Film (PPF)', category: 'Add-On', forVehicle: 'Car',
    prices: { 'Hatchback': 0, 'Sedan / Crossover': 0, 'SUV / MPV': 0, 'Luxury': 0 } },
  { id: 'cs-wraps', name: 'Car Wraps', category: 'Add-On', forVehicle: 'Car',
    prices: { 'Hatchback': 0, 'Sedan / Crossover': 0, 'SUV / MPV': 0, 'Luxury': 0 } },
  { id: 'cs-ceramic', name: 'Ceramic Coating Package', category: 'Add-On', forVehicle: 'Car',
    prices: { 'Hatchback': 0, 'Sedan / Crossover': 0, 'SUV / MPV': 0, 'Luxury': 0 } },
  { id: 'cs-scanning', name: 'Scanning & Coding / Feature Unlock', category: 'Add-On', forVehicle: 'Car',
    prices: { 'Hatchback': 0, 'Sedan / Crossover': 0, 'SUV / MPV': 0, 'Luxury': 0 } },
  { id: 'cs-glass-windshield', name: 'Glass Polish (Windshield)', category: 'Add-On', forVehicle: 'Car',
    prices: { 'Hatchback': 2000, 'Sedan / Crossover': 2000, 'SUV / MPV': 2500, 'Luxury': 2500 } },
  { id: 'cs-glass-all', name: 'Glass Polish (All Glasses)', category: 'Add-On', forVehicle: 'Car',
    prices: { 'Hatchback': 2800, 'Sedan / Crossover': 2800, 'SUV / MPV': 3400, 'Luxury': 3400 } },
  { id: 'cs-alloy', name: 'Alloy Wheel Detailing', category: 'Add-On', forVehicle: 'Car',
    prices: { 'Hatchback': 2500, 'Sedan / Crossover': 2500, 'SUV / MPV': 3000, 'Luxury': 3500 } },
  { id: 'cs-engine', name: 'Engine Bay Detailing', category: 'Add-On', forVehicle: 'Car',
    prices: { 'Hatchback': 1800, 'Sedan / Crossover': 1800, 'SUV / MPV': 2500, 'Luxury': 2500 } },
  { id: 'cs-headlight', name: 'Head Light Restoration', category: 'Add-On', forVehicle: 'Car',
    prices: { 'Hatchback': 1500, 'Sedan / Crossover': 1500, 'SUV / MPV': 1500, 'Luxury': 1700 } },

  // ─── Bike Wash ───
  { id: 'bw-foam', name: 'Foam Wash', category: 'Bike Wash', forVehicle: 'Bike',
    prices: { 'Below 350 CC': 350, 'Above 350 CC': 450, 'ADV/Sports above 900cc': 650 } },
  { id: 'bw-detailed', name: 'Detailed Wash', category: 'Bike Wash', forVehicle: 'Bike',
    prices: { 'Below 350 CC': 500, 'Above 350 CC': 600, 'ADV/Sports above 900cc': 800 } },

  // ─── Bike Add-On ───
  { id: 'bw-chain', name: 'Chain Cleaning & Lubing', category: 'Bike Add-On', forVehicle: 'Bike',
    prices: { 'Below 350 CC': 300, 'Above 350 CC': 300, 'ADV/Sports above 900cc': 450 } },
  { id: 'bw-chrome', name: 'Chrome Buffing', category: 'Bike Add-On', forVehicle: 'Bike',
    prices: { 'Below 350 CC': 4500, 'Above 350 CC': 4500, 'ADV/Sports above 900cc': 4500 } },
  { id: 'bw-detailing', name: 'Bike Detailing', category: 'Bike Add-On', forVehicle: 'Bike',
    prices: { 'Below 350 CC': 3200, 'Above 350 CC': 3700, 'ADV/Sports above 900cc': 4200 } },
  { id: 'bw-ceramic', name: 'Bike Ceramic Coating', category: 'Bike Add-On', forVehicle: 'Bike',
    prices: { 'Below 350 CC': 0, 'Above 350 CC': 0, 'ADV/Sports above 900cc': 0 } },
  { id: 'bw-ppf', name: 'Bike Paint Protection Film (PPF)', category: 'Bike Add-On', forVehicle: 'Bike',
    prices: { 'Below 350 CC': 0, 'Above 350 CC': 0, 'ADV/Sports above 900cc': 0 } },
];

// ── Edit Log ──
export interface EditLog {
  timestamp: string;
  editorRole: UserRole;
  field: string;
  oldValue: string;
  newValue: string;
}

// ── Payment Info ──
export interface PaymentInfo {
  mode: PaymentMode;
  amount: number;
  transactionId?: string;
  paidAt?: string;
}

// ── Job Card ──
export interface JobCard {
  id: string;
  createdAt: string;
  updatedAt: string;

  // Customer
  customerName: string;
  customerPhone: string;

  // Vehicle
  vehicleCategory: VehicleCategory;
  vehicleType: VehicleType;
  carBrand: string;
  carModel: string;
  registrationNumber: string;
  carColor: string;
  odometerReading: number | null;
  fuelLevel: number; // 0-100

  // Services
  selectedServices: ServiceItem[];

  // Photos (base64, compressed)
  beforePhotos: string[];
  afterPhotos: string[];

  // Remarks & Acknowledgment
  remarks: string;
  customerAcknowledged: boolean;
  signatureDataUrl: string; // base64 PNG

  // Status
  status: JobStatus;

  // Pricing
  subtotal: number;
  discountType: 'flat' | 'percent';
  discountValue: number;
  discountAmount: number;
  finalAmount: number;

  // Payment
  payment: PaymentInfo | null;

  // Tracking
  editHistory: EditLog[];
  isDeleted: boolean;
}

// ── Customer ──
export interface Customer {
  id: string;
  name: string;
  phone: string;
  vehicles: VehicleInfo[];
  jobIds: string[];
  totalRevenue: number;
  createdAt: string;
  lastVisit: string;
}

export interface VehicleInfo {
  brand: string;
  model: string;
  registrationNumber: string;
  color: string;
}

// ── Popular Car Brands & Models (India) ──
export const CAR_BRANDS: { [brand: string]: string[] } = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Vitara Brezza', 'Ertiga', 'XL6', 'Ciaz', 'S-Cross', 'Alto', 'WagonR', 'Celerio', 'Ignis', 'Jimny', 'Fronx', 'Invicto', 'Grand Vitara'],
  'Hyundai': ['i20', 'Creta', 'Venue', 'Verna', 'Tucson', 'Alcazar', 'Exter', 'i10 Grand', 'Aura', 'Ioniq 5'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Punch', 'Altroz', 'Tiago', 'Tigor', 'Curvv'],
  'Mahindra': ['Thar', 'XUV700', 'XUV300', 'Scorpio-N', 'Bolero', 'XUV400'],
  'Kia': ['Seltos', 'Sonet', 'Carens', 'EV6', 'Carnival'],
  'Toyota': ['Innova Crysta', 'Fortuner', 'Glanza', 'Urban Cruiser Hyryder', 'Camry', 'Vellfire', 'Land Cruiser'],
  'Honda': ['City', 'Amaze', 'Elevate', 'WR-V'],
  'MG': ['Hector', 'Astor', 'Gloster', 'ZS EV', 'Comet'],
  'Volkswagen': ['Taigun', 'Virtus', 'Tiguan'],
  'Skoda': ['Slavia', 'Kushaq', 'Superb', 'Kodiaq'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'M340i', 'iX', 'i4', 'i7'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'A-Class', 'AMG GT', 'EQS'],
  'Audi': ['A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'RS5'],
  'Porsche': ['Cayenne', 'Macan', '911', 'Taycan', 'Panamera'],
  'Jaguar': ['F-Pace', 'XE', 'XF', 'I-Pace'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Defender', 'Discovery'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90'],
  'Jeep': ['Compass', 'Meridian', 'Grand Cherokee', 'Wrangler'],
  'Rolls Royce': ['Ghost', 'Phantom', 'Cullinan', 'Spectre'],
  'Lamborghini': ['Urus', 'Huracán', 'Revuelto'],
  'Ferrari': ['Roma', 'Portofino', 'SF90', 'F8 Tributo', '296 GTB'],
  'Other': ['Custom']
};

// ── Popular Bike Brands & Models (India) ──
export const BIKE_BRANDS: { [brand: string]: string[] } = {
  'Royal Enfield': ['Classic 350', 'Meteor 350', 'Hunter 350', 'Bullet 350', 'Continental GT 650', 'Interceptor 650', 'Super Meteor 650', 'Himalayan', 'Shotgun 650', 'Guerrilla 450'],
  'KTM': ['Duke 200', 'Duke 250', 'Duke 390', 'RC 200', 'RC 390', 'Adventure 250', 'Adventure 390'],
  'Bajaj': ['Pulsar NS200', 'Pulsar RS200', 'Pulsar N250', 'Dominar 400', 'Dominar 250'],
  'Yamaha': ['R15 V4', 'MT-15', 'FZ-S', 'FZ-X', 'Aerox 155'],
  'Honda': ['CB350', 'Highness', 'Hornet 2.0', 'SP 125', 'Activa 6G', 'X-ADV'],
  'Suzuki': ['Gixxer SF 250', 'Gixxer 250', 'V-Strom SX', 'Hayabusa', 'Access 125'],
  'Kawasaki': ['Ninja 300', 'Ninja 400', 'Ninja 650', 'Z650', 'Z900', 'Versys 650', 'ZX-10R', 'Vulcan S'],
  'BMW Motorrad': ['G 310 R', 'G 310 GS', 'F 850 GS', 'R 1250 GS', 'S 1000 RR', 'M 1000 RR'],
  'Ducati': ['Scrambler', 'Monster', 'Panigale V2', 'Panigale V4', 'Multistrada V4', 'Diavel V4'],
  'Harley-Davidson': ['X440', 'Iron 883', 'Fat Boy', 'Road Glide', 'Street Glide', 'Pan America'],
  'Triumph': ['Speed 400', 'Scrambler 400X', 'Trident 660', 'Street Triple', 'Tiger 900', 'Speed Triple', 'Rocket 3'],
  'Aprilia': ['RS 457', 'Tuono 457', 'SXR 160', 'SR 160'],
  'Husqvarna': ['Svartpilen 250', 'Vitpilen 250', 'Svartpilen 401'],
  'Other': ['Custom']
};

export const CAR_COLORS: string[] = [
  'White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Green',
  'Brown', 'Beige', 'Gold', 'Orange', 'Yellow', 'Maroon',
  'Navy Blue', 'Pearl White', 'Metallic Grey', 'Matte Black', 'Other'
];

export const BIKE_COLORS: string[] = [
  'Black', 'Red', 'White', 'Blue', 'Silver', 'Grey', 'Green',
  'Yellow', 'Orange', 'Matte Black', 'Chrome', 'Other'
];
