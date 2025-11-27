// User and Authentication Interfaces
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'vet' | 'pet_owner' | 'admin';
  emailVerified: boolean;
  authProviders?: Array<{
    provider: 'google' | 'microsoft';
    providerId: string;
  }>;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'vet' | 'pet_owner' | 'admin';
  };
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'vet' | 'pet_owner' | 'admin';
  licenseNumber?: string;
  authProvider?: {
    provider: 'google' | 'microsoft';
    providerId: string;
  };
}

export interface ILoginRequest {
  email: string;
  password: string;
}

// Profile Interfaces
export interface IVetProfile {
  _id: string;
  user_id: string;
  specialization?: string;
  experienceYears?: number;
  clinicName?: string;
  clinicAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  licenseNumber: string;
  issuedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPetOwnerProfile {
  _id: string;
  user_id: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminProfile {
  _id: string;
  user_id: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pet and Health Record Interfaces
export interface IPet {
  _id: string;
  owner_id: string;
  name: string;
  species: 'dog' | 'cat';
  breed?: string;
  color?: string;
  dateOfBirth: Date;
  status: 'active' | 'deceased';
  deceasedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVitals {
  weight: { value: number; unit: 'kg' | 'lbs' };
  temperature: { value: number; unit: string };
  heartRate: { value: number; unit: string };
  respiratoryRate: { value: number; unit: string };
  bloodPressure?: {
    systolic?: number;
    diastolic?: number;
    unit: string;
  };
}

export interface IBehavior {
  appetite: 'normal' | 'increased' | 'decreased' | 'absent';
  energyLevel: 'normal' | 'lethargic' | 'hyperactive';
  aggression?: 'none' | 'mild' | 'moderate' | 'severe';
  vomiting?: boolean;
  diarrhea?: boolean;
  coughing?: boolean;
  limping?: boolean;
}

export interface IVaccination {
  vaccineName: string;
  administeredDate: Date;
  nextDueDate?: Date;
  batchNumber?: string;
  status: 'up_to_date' | 'due_soon' | 'overdue' | 'not_applicable';
}

export interface IHealthRecord {
  _id: string;
  pet_id: string;
  vet_id?: string;
  created_by: string;
  created_by_type: 'vet' | 'pet_owner' | 'ml_model';
  species_type: 'dog' | 'cat';
  visitDate: Date;
  petSnapshot: {
    name: string;
    breed?: string;
    dateOfBirth: Date;
    ageInMonths: number;
  };
  vitals: IVitals;
  behavior: IBehavior;
  vaccinations?: IVaccination[];
  diagnosis: string;
  treatment?: string;
  createdAt: Date;
}

// License Interface
export interface IVetLicense {
  _id: string;
  licenseNumber: string;
  issuedBy: string;
  issueDate: Date;
  status: 'available' | 'claimed' | 'suspended' | 'revoked';
  claimedBy?: string;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Interfaces
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface IApiError {
  success: false;
  message: string;
  error?: string;
}