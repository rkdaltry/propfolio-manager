
export enum PropertyType {
  HMO = 'HMO',
  FLAT = 'FLAT'
}

export interface Document {
  id: string;
  name: string;
  type: string; // e.g., 'PDF', 'IMG'
  uploadDate: string;
  url?: string; // Placeholder for actual file link
  
  // New categorized fields
  category?: 'Tenancy Agreement' | 'ID' | 'ID / Passport' | 'Right to Rent' | 'Guarantor' | 'Correspondence' | 'Other' | string;
  expiryDate?: string;
  summary?: string;
}

export interface Mortgage {
  lenderName: string;
  termYears: number;
  fixedRateExpiry: string;
  monthlyPayment: number;
  interestRate: number;
  type?: string; // e.g., 'Fixed', 'Tracker'
}

export interface Insurance {
  provider: string;
  premium: number;
  renewalDate: string;
  policyNumber: string;
}

export interface HMOLicence {
  renewalDate: string;
  licenceNumber: string;
  document?: Document;
}

export interface UtilityProvider {
  type: 'Gas' | 'Electric' | 'Water' | 'Internet';
  providerName: string;
  accountNumber: string;
}

export interface CouncilTax {
  band: string;
  annualCost: number;
  document?: Document;
}

export interface GroundRent {
  amount: number;
  reviewDate: string; // Date for changes as part of deed
  period: string; // e.g. Annually
}

export interface ComplianceCertificate {
  expiryDate: string;
  status: 'Valid' | 'Expired' | 'Pending';
  document?: Document;
}

export interface ProductInsurance {
  id: string;
  itemName: string; // e.g., "Boiler", "Washing Machine"
  provider: string;
  renewalDate: string;
  premium: number;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  type: 'Rent' | 'Deposit' | 'Charge' | 'Adjustment'; // Charge increases balance, others decrease
  reference?: string;
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
}

export interface Tenant {
  id: string;
  roomId?: string; // Relevant for HMO
  name: string;
  rentAmount: number;
  depositAmount: number;
  depositReference: string;
  tenancyStartDate: string;
  tenancyEndDate: string;
  rightToRentExpiry?: string; // New field for HMRC Right to Rent
  tenancyAgreement?: Document;
  documents?: Document[];
  isArchived?: boolean;
  isDeleted?: boolean; // New field for soft delete functionality
  
  // Financials
  outstandingBalance: number;
  payments: Payment[];
}

export interface Property {
  id: string;
  address: string;
  postcode: string;
  type: PropertyType;
  imageUrl: string;
  purchaseDate: string;
  owner?: string;
  description?: string;
  capacity?: number; // Added capacity field
  
  mortgage?: Mortgage;
  buildingsInsurance?: Insurance;
  hmoLicence?: HMOLicence;
  utilities: UtilityProvider[];
  councilTax?: CouncilTax;
  groundRent?: GroundRent;
  
  // New Compliance Fields
  gasCertificate?: ComplianceCertificate;
  eicrCertificate?: ComplianceCertificate; // Electrical Installation Condition Report
  epcCertificate?: ComplianceCertificate; // Energy Performance Certificate

  productInsurances: ProductInsurance[];
  tenants: Tenant[];
  documents: Document[]; // General property documents
  transactions: FinancialTransaction[]; // Property specific income/expenses
}

export interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupancyRate: number;
  totalRentRoll: number;
  upcomingRenewals: number;
}
