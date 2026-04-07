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

// ── Service Category ──
export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  selected?: boolean;
}

export type ServiceCategory =
  | 'Paint Protection Film (PPF)'
  | 'Ceramic Coating'
  | 'Graphene Coating'
  | 'Car Wrapping'
  | 'Full Car Detailing'
  | 'Sun Films'
  | 'Coding & Scanning'
  | 'Add-ons';

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

// ── Default Services Catalog (matches website service pages) ──
export const DEFAULT_SERVICES: ServiceItem[] = [

  // ─── Paint Protection Film (PPF) ───
  { id: 'ppf-color', name: 'Color PPF', category: 'Paint Protection Film (PPF)', price: 0 },
  { id: 'ppf-matte', name: 'Matte PPF', category: 'Paint Protection Film (PPF)', price: 0 },

  // ─── Ceramic Coating ───
  { id: 'cer-paint', name: 'Paint / Exterior Coating', category: 'Ceramic Coating', price: 0 },
  { id: 'cer-glass', name: 'Glass Coating', category: 'Ceramic Coating', price: 0 },
  { id: 'cer-wheel', name: 'Wheel & Alloy Coating', category: 'Ceramic Coating', price: 0 },
  { id: 'cer-caliper', name: 'Brake Caliper Coating', category: 'Ceramic Coating', price: 0 },
  { id: 'cer-trim', name: 'Plastic & Trim Coating', category: 'Ceramic Coating', price: 0 },
  { id: 'cer-lights', name: 'Headlight & Taillight Coating', category: 'Ceramic Coating', price: 0 },
  { id: 'cer-interior', name: 'Interior Coating', category: 'Ceramic Coating', price: 0 },

  // ─── Graphene Coating ───
  { id: 'gra-exterior', name: 'Full Exterior Coating', category: 'Graphene Coating', price: 0 },
  { id: 'gra-glass', name: 'Glass & Windshield Coating', category: 'Graphene Coating', price: 0 },
  { id: 'gra-wheel', name: 'Wheel & Alloy Coating', category: 'Graphene Coating', price: 0 },
  { id: 'gra-caliper', name: 'Brake Caliper Coating', category: 'Graphene Coating', price: 0 },
  { id: 'gra-trim', name: 'Plastic Trim & Cladding Coating', category: 'Graphene Coating', price: 0 },
  { id: 'gra-lights', name: 'Headlight & Taillight Protection', category: 'Graphene Coating', price: 0 },
  { id: 'gra-interior', name: 'Interior Coating', category: 'Graphene Coating', price: 0 },

  // ─── Car Wrapping ───
  { id: 'wrap-gloss', name: 'Gloss Finish', category: 'Car Wrapping', price: 0 },
  { id: 'wrap-matte', name: 'Matte & Satin', category: 'Car Wrapping', price: 0 },
  { id: 'wrap-custom', name: 'Custom Design', category: 'Car Wrapping', price: 0 },

  // ─── Full Car Detailing ───
  { id: 'det-interior', name: 'Interior Detailing', category: 'Full Car Detailing', price: 0 },
  { id: 'det-engine', name: 'Engine Bay Detailing', category: 'Full Car Detailing', price: 0 },
  { id: 'det-headlight', name: 'Headlight Restoration', category: 'Full Car Detailing', price: 0 },
  { id: 'det-alloy', name: 'Alloy Wheel Cleaning', category: 'Full Car Detailing', price: 0 },
  { id: 'det-underbody', name: 'Underbody Cleaning', category: 'Full Car Detailing', price: 0 },

  // ─── Sun Films ───
  { id: 'sf-uv', name: 'UV Protection Film', category: 'Sun Films', price: 0 },
  { id: 'sf-heat', name: 'Heat Rejection Film', category: 'Sun Films', price: 0 },
  { id: 'sf-privacy', name: 'Privacy & Security Film', category: 'Sun Films', price: 0 },

  // ─── Coding & Scanning ───
  { id: 'code-diag', name: 'Diagnostic Scanning', category: 'Coding & Scanning', price: 0 },
  { id: 'code-error', name: 'Error Code Service', category: 'Coding & Scanning', price: 0 },
  { id: 'code-feature', name: 'Vehicle Coding / Feature Activation', category: 'Coding & Scanning', price: 0 },
  { id: 'code-module', name: 'Module Programming & Adaptations', category: 'Coding & Scanning', price: 0 },

  // ─── Add-ons ───
  { id: 'add-freshener', name: 'Air Freshener Treatment', category: 'Add-ons', price: 0 },
  { id: 'add-tar', name: 'Tar & Iron Removal', category: 'Add-ons', price: 0 },
];

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

export const CAR_COLORS: string[] = [
  'White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Green',
  'Brown', 'Beige', 'Gold', 'Orange', 'Yellow', 'Maroon',
  'Navy Blue', 'Pearl White', 'Metallic Grey', 'Matte Black', 'Other'
];
