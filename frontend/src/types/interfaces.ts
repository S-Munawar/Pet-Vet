// User and Authentication Interfaces (Frontend)
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'vet' | 'pet_owner' | 'admin';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'vet' | 'pet_owner' | 'admin';
  licenseNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Profile Interfaces (Frontend)
export interface VetProfile {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface PetOwnerProfile {
  id: string;
  userId: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

// Pet and Health Record Interfaces (Frontend)
export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: 'dog' | 'cat';
  breed?: string;
  color?: string;
  dateOfBirth: string;
  status: 'active' | 'deceased';
  deceasedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vitals {
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

export interface Behavior {
  appetite: 'normal' | 'increased' | 'decreased' | 'absent';
  energyLevel: 'normal' | 'lethargic' | 'hyperactive';
  aggression?: 'none' | 'mild' | 'moderate' | 'severe';
  vomiting?: boolean;
  diarrhea?: boolean;
  coughing?: boolean;
  limping?: boolean;
}

export interface Vaccination {
  vaccineName: string;
  administeredDate: string;
  nextDueDate?: string;
  batchNumber?: string;
  status: 'up_to_date' | 'due_soon' | 'overdue' | 'not_applicable';
}

export interface HealthRecord {
  id: string;
  petId: string;
  vetId?: string;
  createdBy: string;
  createdByType: 'vet' | 'pet_owner' | 'ml_model';
  speciesType: 'dog' | 'cat';
  visitDate: string;
  petSnapshot: {
    name: string;
    breed?: string;
    dateOfBirth: string;
    ageInMonths: number;
  };
  vitals: Vitals;
  behavior: Behavior;
  vaccinations?: Vaccination[];
  diagnosis: string;
  treatment?: string;
  createdAt: string;
}

// License Interface (Frontend)
export interface VetLicense {
  id: string;
  licenseNumber: string;
  issuedBy: string;
  issueDate: string;
  status: 'available' | 'claimed' | 'suspended' | 'revoked';
  claimedBy?: string;
  claimedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Interfaces (Frontend)
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}