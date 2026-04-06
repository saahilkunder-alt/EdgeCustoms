// ── Job Status ──
export enum JobStatus {
  Received = 'Received',
  InProgress = 'In Progress',
  Waiting = 'Waiting',
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
  | 'Wash & Clean'
  | 'Interior'
  | 'Polishing'
  | 'Paint Correction'
  | 'Ceramic Coating'
  | 'Graphene Coating'
  | 'PPF'
  | 'Sun Film'
  | 'Wrapping'
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

// ── Default Services Catalog ──
export const DEFAULT_SERVICES: ServiceItem[] = [
  // Wash & Clean
  { id: 'wash-basic', name: 'Basic Wash', category: 'Wash & Clean', price: 500 },
  { id: 'wash-foam', name: 'Foam Wash', category: 'Wash & Clean', price: 800 },
  { id: 'wash-pressure', name: 'Pressure Wash', category: 'Wash & Clean', price: 1000 },

  // Interior
  { id: 'int-vacuum', name: 'Vacuuming', category: 'Interior', price: 500 },
  { id: 'int-dashboard', name: 'Dashboard Polish', category: 'Interior', price: 700 },
  { id: 'int-seat', name: 'Seat Cleaning', category: 'Interior', price: 1500 },
  { id: 'int-full', name: 'Full Interior Detailing', category: 'Interior', price: 3500 },

  // Polishing
  { id: 'pol-single', name: 'Single Stage Polish', category: 'Polishing', price: 3000 },
  { id: 'pol-multi', name: 'Multi Stage Polish', category: 'Polishing', price: 5000 },
  { id: 'pol-cut', name: 'Cut & Polish', category: 'Polishing', price: 7000 },

  // Paint Correction
  { id: 'pc-minor', name: 'Minor Correction', category: 'Paint Correction', price: 5000 },
  { id: 'pc-major', name: 'Major Correction', category: 'Paint Correction', price: 10000 },

  // Ceramic Coating
  { id: 'cer-basic', name: 'Ceramic Basic (1 Layer)', category: 'Ceramic Coating', price: 8000 },
  { id: 'cer-pro', name: 'Ceramic Pro (3 Layers)', category: 'Ceramic Coating', price: 15000 },
  { id: 'cer-ultra', name: 'Ceramic Ultra (5 Layers)', category: 'Ceramic Coating', price: 25000 },
  { id: 'cer-glass', name: 'Glass Coating', category: 'Ceramic Coating', price: 3000 },

  // Graphene Coating
  { id: 'gra-full', name: 'Full Exterior Graphene', category: 'Graphene Coating', price: 20000 },
  { id: 'gra-glass', name: 'Glass Graphene Coating', category: 'Graphene Coating', price: 4000 },

  // PPF
  { id: 'ppf-front', name: 'Front Bumper PPF', category: 'PPF', price: 8000 },
  { id: 'ppf-hood', name: 'Hood PPF', category: 'PPF', price: 12000 },
  { id: 'ppf-full', name: 'Full Body PPF', category: 'PPF', price: 80000 },

  // Sun Film
  { id: 'sf-basic', name: 'Basic Sun Film', category: 'Sun Film', price: 3000 },
  { id: 'sf-premium', name: 'Premium Sun Film', category: 'Sun Film', price: 8000 },
  { id: 'sf-ceramic', name: 'Ceramic Sun Film', category: 'Sun Film', price: 15000 },

  // Wrapping
  { id: 'wrap-partial', name: 'Partial Wrap', category: 'Wrapping', price: 15000 },
  { id: 'wrap-full', name: 'Full Body Wrap', category: 'Wrapping', price: 60000 },

  // Add-ons
  { id: 'add-freshener', name: 'Air Freshener Treatment', category: 'Add-ons', price: 500 },
  { id: 'add-engine', name: 'Engine Bay Cleaning', category: 'Add-ons', price: 1500 },
  { id: 'add-underbody', name: 'Underbody Cleaning', category: 'Add-ons', price: 2000 },
  { id: 'add-headlight', name: 'Headlight Restoration', category: 'Add-ons', price: 2500 },
  { id: 'add-wheel', name: 'Alloy Wheel Deep Clean', category: 'Add-ons', price: 1000 },
  { id: 'add-tar', name: 'Tar & Iron Removal', category: 'Add-ons', price: 1500 },
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
