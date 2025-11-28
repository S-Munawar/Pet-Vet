import mongoose from 'mongoose';

// ==================== AUTH PROVIDER ====================
export interface IAuthProvider {
  provider: 'google' | 'microsoft';
  providerId: string;
}

// ==================== USER ====================
export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Optional for social-only users
  authProviders: IAuthProvider[];
  role: 'vet' | 'pet_owner' | 'admin';
  emailVerified: boolean;
  verificationToken?: string | undefined;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== PROFILES ====================
export interface IAdminProfile extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVetProfile extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
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

export interface IPetOwnerProfile extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
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

// ==================== VET LICENSE ====================
export interface IVetLicense extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  licenseNumber: string;
  issuedBy: mongoose.Types.ObjectId; // Admin User ID
  issueDate: Date;
  status: 'available' | 'claimed' | 'suspended' | 'revoked';
  claimedBy?: mongoose.Types.ObjectId; // VetProfile ID
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== PET ====================
export interface IPet extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  owner_id: mongoose.Types.ObjectId; // PetOwnerProfile ID
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

// ==================== HEALTH RECORD COMPONENTS ====================
export interface IPetSnapshot {
  name: string;
  breed?: string;
  dateOfBirth: Date;
  ageInMonths: number;
}

export interface IVitals {
  weight: {
    value: number;
    unit: 'kg' | 'lbs';
  };
  temperature: {
    value: number;
    unit: string;
  };
  heartRate: {
    value: number;
    unit: string;
  };
  respiratoryRate: {
    value: number;
    unit: string;
  };
  bloodPressure?: {
    systolic?: number;
    diastolic?: number;
    unit: string;
  };
}

export interface IDogMetrics {
  bodyConditionScore?: number;
  hydrationStatus?: 'normal' | 'mild_dehydration' | 'moderate_dehydration' | 'severe_dehydration';
  mucousMembraneColor?: 'pink' | 'pale' | 'white' | 'blue' | 'yellow' | 'red';
  capillaryRefillTime?: {
    value: number;
    unit: string;
  };
}

export interface ICatMetrics {
  bodyConditionScore?: number;
  hydrationStatus?: 'normal' | 'mild_dehydration' | 'moderate_dehydration' | 'severe_dehydration';
  mucousMembraneColor?: 'pink' | 'pale' | 'white' | 'blue' | 'yellow' | 'red';
  coatCondition?: 'healthy' | 'dull' | 'greasy' | 'matted' | 'patchy';
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

export interface IAllergy {
  allergen?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface IChronicCondition {
  condition: string;
  diagnosedDate?: Date;
  status: 'active' | 'managed' | 'resolved';
  notes?: string;
}

export interface IPrescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration?: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface IAttachment {
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'document';
  uploadedAt: Date;
}

// ==================== COMMON HEALTH RECORD ====================
export interface ICommonHealthRecord extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  pet_id: mongoose.Types.ObjectId;
  vet_id?: mongoose.Types.ObjectId;
  created_by: mongoose.Types.ObjectId;
  created_by_type: 'vet' | 'pet_owner' | 'ml_model';
  species_type: 'dog' | 'cat';
  species_health_record_id: mongoose.Types.ObjectId;
  species_health_record_model: 'DogHealthRecord' | 'CatHealthRecord';
  visitDate: Date;
  createdAt: Date;
}

// ==================== DOG HEALTH RECORD ====================
export interface IDogHealthRecord extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  petSnapshot: IPetSnapshot;
  vitals: IVitals;
  dogMetrics?: IDogMetrics;
  behavior: IBehavior;
  vaccinations?: IVaccination[];
  diagnosis: string;
  treatment?: string;
  allergies?: IAllergy[];
  chronicConditions?: IChronicCondition[];
  prescriptions?: IPrescription[];
  attachments?: IAttachment[];
  createdAt: Date;
}

// ==================== CAT HEALTH RECORD ====================
export interface ICatHealthRecord extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  petSnapshot: IPetSnapshot;
  vitals: IVitals;
  catMetrics?: ICatMetrics;
  behavior: IBehavior;
  vaccinations?: IVaccination[];
  diagnosis: string;
  treatment?: string;
  allergies?: IAllergy[];
  chronicConditions?: IChronicCondition[];
  prescriptions?: IPrescription[];
  attachments?: IAttachment[];
  createdAt: Date;
}

// ==================== AUTH REQUEST/RESPONSE ====================
export interface IRegisterRequest {
  name: string;
  email: string;
  password?: string; // Optional for social login
  role: 'vet' | 'pet_owner' | 'admin';
  licenseNumber?: string; // Required for vets
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
  authProvider?: IAuthProvider; // For social login
}

export interface ILoginRequest {
  email: string;
  password: string;
}

// In interfaces.ts, update IAuthResponse:
export interface IAuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: 'vet' | 'pet_owner' | 'admin';
      emailVerified: boolean;
    };
  };
}

// ==================== API RESPONSES ====================
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface IApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// ==================== POPULATED TYPES ====================
// Use these when you've populated references in queries

export interface IUserPopulated extends Omit<IUser, 'password'> {
  // Exclude password from populated results
}

export interface IVetLicensePopulated extends Omit<IVetLicense, 'issuedBy' | 'claimedBy'> {
  issuedBy: IUser; // Populated admin user
  claimedBy?: IVetProfile; // Populated vet profile
}

export interface ICommonHealthRecordPopulated extends Omit<ICommonHealthRecord, 'pet_id' | 'vet_id' | 'created_by' | 'species_health_record_id'> {
  pet_id: IPet;
  vet_id?: IVetProfile;
  created_by: IUser;
  species_health_record_id: IDogHealthRecord | ICatHealthRecord;
}

// ==================== REQUEST BODY TYPES ====================
export interface ICreateLicenseRequest {
  licenseNumber: string;
}

export interface IClaimLicenseRequest {
  licenseNumber: string;
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
}

export interface ICreatePetRequest {
  name: string;
  species: 'dog' | 'cat';
  breed?: string;
  color?: string;
  dateOfBirth: Date;
}

export interface ICreateHealthRecordRequest {
  pet_id: string;
  vet_id?: string;
  vitals: IVitals;
  dogMetrics?: IDogMetrics;
  catMetrics?: ICatMetrics;
  behavior: IBehavior;
  vaccinations?: IVaccination[];
  diagnosis: string;
  treatment?: string;
  allergies?: IAllergy[];
  chronicConditions?: IChronicCondition[];
  prescriptions?: IPrescription[];
  attachments?: IAttachment[];
}

// In interfaces.ts
export interface IRefreshToken extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}