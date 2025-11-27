// Shared Types and Enums for Backend and Frontend

// User Roles
export type UserRole = 'vet' | 'pet_owner' | 'admin';

// Pet Species
export type PetSpecies = 'dog' | 'cat';

// Pet Status
export type PetStatus = 'active' | 'deceased';

// License Status
export type LicenseStatus = 'available' | 'claimed' | 'suspended' | 'revoked';

// Health Record Creator Types
export type HealthRecordCreatorType = 'vet' | 'pet_owner' | 'ml_model';

// Vital Signs Units
export type WeightUnit = 'kg' | 'lbs';
export type TemperatureUnit = 'F' | 'C';
export type PressureUnit = 'mmHg';
export type RateUnit = 'bpm';

// Behavioral Indicators
export type AppetiteLevel = 'normal' | 'increased' | 'decreased' | 'absent';
export type EnergyLevel = 'normal' | 'lethargic' | 'hyperactive';
export type AggressionLevel = 'none' | 'mild' | 'moderate' | 'severe';

// Vaccination Status
export type VaccinationStatus = 'up_to_date' | 'due_soon' | 'overdue' | 'not_applicable';

// OAuth Providers
export type OAuthProvider = 'google' | 'microsoft';

// API Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_REGEX: /^\\S+@\\S+\\.\\S+$/,
  PHONE_REGEX: /^[\\d\\s\\-\\+\\(\\)]+$/,
} as const;

// Database Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  VET_PROFILES: 'vetprofiles',
  PET_OWNER_PROFILES: 'petownerprofiles',
  ADMIN_PROFILES: 'adminprofiles',
  PETS: 'pets',
  HEALTH_RECORDS: 'commonhealthrecords',
  DOG_HEALTH_RECORDS: 'doghealthrecords',
  CAT_HEALTH_RECORDS: 'cathealthrecords',
  VET_LICENSES: 'vetlicenses',
  REFRESH_TOKENS: 'refreshtokens',
} as const;