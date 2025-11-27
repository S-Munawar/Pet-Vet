import mongoose, { Document } from "mongoose";

import type { 
  IUser, 
  IAdminProfile, 
  IVetProfile, 
  IVetLicense, 
  IPetOwnerProfile, 
  IPet, 
  ICommonHealthRecord, 
  IDogHealthRecord, 
  ICatHealthRecord 
} from '../types/interfaces.ts';

const { Schema, model } = mongoose;

// ==================== AUTH PROVIDER SCHEMA ====================
const AuthProviderSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ['google', 'microsoft'],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// ==================== USER SCHEMA ====================
const UserSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: { 
    type: String,
    required: false,
    minlength: 8,
    select: false,
  },
  authProviders: {
    type: [AuthProviderSchema],
    default: [],
  },
  role: {
    type: String,
    enum: ['vet', 'pet_owner', 'admin'],
    required: true
  },
  emailVerified: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

UserSchema.pre('save', function () {
  this.updatedAt = new Date();
});

export const User = model<IUser>('User', UserSchema);

// ==================== ADMIN PROFILE SCHEMA ====================
const AdminProfileSchema = new Schema<IAdminProfile>({
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

AdminProfileSchema.index({ user_id: 1 });

AdminProfileSchema.pre('save', function () {
  this.updatedAt = new Date();
});

export const AdminProfile = model<IAdminProfile>('AdminProfile', AdminProfileSchema);

// ==================== VET PROFILE SCHEMA ====================
const VetProfileSchema = new Schema<IVetProfile>({
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    trim: true,
    maxlength: 200
  },
  experienceYears: {
    type: Number,
    min: 0,
    max: 70
  },
  clinicName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  clinicAddress: {
    street: {
      type: String,
      trim: true,
      maxlength: 200
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100
    },
    state: {
      type: String,
      trim: true,
      maxlength: 100
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: 20
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  licenseNumber: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  issuedBy: {
    type: String,
    trim: true,
    maxlength: 200
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

VetProfileSchema.index({ user_id: 1 });
VetProfileSchema.index({ licenseNumber: 1 });

VetProfileSchema.pre('save', function () {
  this.updatedAt = new Date();
});

export const VetProfile = model<IVetProfile>('VetProfile', VetProfileSchema);

// ==================== VET LICENSE SCHEMA ====================
const VetLicenseSchema = new Schema<IVetLicense>({
  licenseNumber: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    uppercase: true
  },
  issuedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'suspended', 'revoked'],
    default: 'available',
    required: true
  },
  claimedBy: {
    type: Schema.Types.ObjectId,
    ref: 'VetProfile',
    default: null
  },
  claimedAt: Date,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

VetLicenseSchema.index({ licenseNumber: 1 });
VetLicenseSchema.index({ status: 1 });
VetLicenseSchema.index({ claimedBy: 1 });
VetLicenseSchema.index({ issuedBy: 1 });

VetLicenseSchema.pre('save', function () {
  this.updatedAt = new Date();
});

export const VetLicense = model<IVetLicense>('VetLicense', VetLicenseSchema);

// ==================== PET OWNER PROFILE SCHEMA ====================
const PetOwnerProfileSchema = new Schema<IPetOwnerProfile>({
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: 200
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100
    },
    state: {
      type: String,
      trim: true,
      maxlength: 100
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: 20
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

PetOwnerProfileSchema.index({ user_id: 1 });

PetOwnerProfileSchema.pre('save', function () {
  this.updatedAt = new Date();
});

export const PetOwnerProfile = model<IPetOwnerProfile>('PetOwnerProfile', PetOwnerProfileSchema);

// ==================== PET SCHEMA ====================
const PetSchema = new Schema<IPet>({
  owner_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'PetOwnerProfile', 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  species: {
    type: String,
    enum: ['dog', 'cat'],
    required: true
  },
  breed: {
    type: String,
    trim: true,
    maxlength: 100
  },
  color: {
    type: String,
    trim: true,
    maxlength: 50
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'deceased'],
    default: 'active'
  },
  deceasedDate: Date,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

PetSchema.index({ owner_id: 1, status: 1 });
PetSchema.index({ species: 1 });

PetSchema.pre('save', function () {
  this.updatedAt = new Date();
});

export const Pet = model<IPet>('Pet', PetSchema);

// ==================== COMMON HEALTH RECORD SCHEMA ====================
const CommonHealthRecordSchema = new Schema<ICommonHealthRecord>({
  pet_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Pet', 
    required: true 
  },
  vet_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'VetProfile'
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_by_type: {
    type: String,
    enum: ['vet', 'pet_owner', 'ml_model'],
    required: true
  },
  species_type: {
    type: String,
    enum: ['dog', 'cat'],
    required: true
  },
  species_health_record_id: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'species_health_record_model'
  },
  species_health_record_model: {
    type: String,
    required: true,
    enum: ['DogHealthRecord', 'CatHealthRecord']
  },
  visitDate: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    immutable: true 
  }
});

CommonHealthRecordSchema.index({ pet_id: 1, visitDate: -1 });
CommonHealthRecordSchema.index({ vet_id: 1, visitDate: -1 });
CommonHealthRecordSchema.index({ created_by: 1 });
CommonHealthRecordSchema.index({ species_type: 1 });
CommonHealthRecordSchema.index({ species_health_record_id: 1 });

CommonHealthRecordSchema.pre('save', function () {
  if (!this.isNew) {
    throw new Error('Health records are immutable and cannot be modified');
  }
});

export const CommonHealthRecord = model<ICommonHealthRecord>('CommonHealthRecord', CommonHealthRecordSchema);

// ==================== DOG HEALTH RECORD SCHEMA ====================
const DogHealthRecordSchema = new Schema<IDogHealthRecord>({
  petSnapshot: {
    name: { type: String, required: true },
    breed: String,
    dateOfBirth: { type: Date, required: true },
    ageInMonths: { type: Number, required: true }
  },
  vitals: {
    weight: {
      value: { type: Number, required: true, min: 0, max: 1000 },
      unit: { type: String, enum: ['kg', 'lbs'], default: 'lbs' }
    },
    temperature: {
      value: { type: Number, required: true, min: 90, max: 110 },
      unit: { type: String, default: 'F' }
    },
    heartRate: {
      value: { type: Number, required: true, min: 20, max: 250 },
      unit: { type: String, default: 'bpm' }
    },
    respiratoryRate: {
      value: { type: Number, required: true, min: 5, max: 100 },
      unit: { type: String, default: 'bpm' }
    },
    bloodPressure: {
      systolic: { type: Number, min: 50, max: 250 },
      diastolic: { type: Number, min: 30, max: 180 },
      unit: { type: String, default: 'mmHg' }
    }
  },
  dogMetrics: {
    bodyConditionScore: { type: Number, min: 1, max: 9 },
    hydrationStatus: {
      type: String,
      enum: ['normal', 'mild_dehydration', 'moderate_dehydration', 'severe_dehydration']
    },
    mucousMembraneColor: {
      type: String,
      enum: ['pink', 'pale', 'white', 'blue', 'yellow', 'red']
    },
    capillaryRefillTime: {
      value: { type: Number, min: 0, max: 10 },
      unit: { type: String, default: 'seconds' }
    }
  },
  behavior: {
    appetite: {
      type: String,
      enum: ['normal', 'increased', 'decreased', 'absent'],
      required: true
    },
    energyLevel: {
      type: String,
      enum: ['normal', 'lethargic', 'hyperactive'],
      required: true
    },
    aggression: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe']
    },
    vomiting: { type: Boolean, default: false },
    diarrhea: { type: Boolean, default: false },
    coughing: { type: Boolean, default: false },
    limping: { type: Boolean, default: false }
  },
  vaccinations: [{
    vaccineName: { type: String, required: true, trim: true },
    administeredDate: { type: Date, required: true },
    nextDueDate: Date,
    batchNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['up_to_date', 'due_soon', 'overdue', 'not_applicable'],
      default: 'up_to_date'
    }
  }],
  diagnosis: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  treatment: {
    type: String,
    trim: true,
    maxlength: 3000
  },
  allergies: [{
    allergen: { type: String, trim: true },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
    notes: { type: String, maxlength: 500 }
  }],
  chronicConditions: [{
    condition: { type: String, trim: true, required: true },
    diagnosedDate: Date,
    status: { type: String, enum: ['active', 'managed', 'resolved'], default: 'active' },
    notes: { type: String, maxlength: 500 }
  }],
  prescriptions: [{
    medication: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    duration: { type: String, trim: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    notes: { type: String, maxlength: 500 }
  }],
  attachments: [{
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'pdf', 'document'], required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now, 
    immutable: true 
  }
});

DogHealthRecordSchema.index({ 'petSnapshot.name': 1 });
DogHealthRecordSchema.index({ createdAt: -1 });

DogHealthRecordSchema.pre('save', function () {
  if (!this.isNew) {
    throw new Error('Health records are immutable and cannot be modified');
  }
});

export const DogHealthRecord = model<IDogHealthRecord>('DogHealthRecord', DogHealthRecordSchema);

// ==================== CAT HEALTH RECORD SCHEMA ====================
const CatHealthRecordSchema = new Schema<ICatHealthRecord>({
  petSnapshot: {
    name: { type: String, required: true },
    breed: String,
    dateOfBirth: { type: Date, required: true },
    ageInMonths: { type: Number, required: true }
  },
  vitals: {
    weight: {
      value: { type: Number, required: true, min: 0, max: 1000 },
      unit: { type: String, enum: ['kg', 'lbs'], default: 'lbs' }
    },
    temperature: {
      value: { type: Number, required: true, min: 90, max: 110 },
      unit: { type: String, default: 'F' }
    },
    heartRate: {
      value: { type: Number, required: true, min: 20, max: 250 },
      unit: { type: String, default: 'bpm' }
    },
    respiratoryRate: {
      value: { type: Number, required: true, min: 5, max: 100 },
      unit: { type: String, default: 'bpm' }
    },
    bloodPressure: {
      systolic: { type: Number, min: 50, max: 250 },
      diastolic: { type: Number, min: 30, max: 180 },
      unit: { type: String, default: 'mmHg' }
    }
  },
  catMetrics: {
    bodyConditionScore: { type: Number, min: 1, max: 9 },
    hydrationStatus: {
      type: String,
      enum: ['normal', 'mild_dehydration', 'moderate_dehydration', 'severe_dehydration']
    },
    mucousMembraneColor: {
      type: String,
      enum: ['pink', 'pale', 'white', 'blue', 'yellow', 'red']
    },
    coatCondition: {
      type: String,
      enum: ['healthy', 'dull', 'greasy', 'matted', 'patchy']
    }
  },
  behavior: {
    appetite: {
      type: String,
      enum: ['normal', 'increased', 'decreased', 'absent'],
      required: true
    },
    energyLevel: {
      type: String,
      enum: ['normal', 'lethargic', 'hyperactive'],
      required: true
    },
    aggression: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe']
    },
    vomiting: { type: Boolean, default: false },
    diarrhea: { type: Boolean, default: false },
    coughing: { type: Boolean, default: false },
    limping: { type: Boolean, default: false }
  },
  vaccinations: [{
    vaccineName: { type: String, required: true, trim: true },
    administeredDate: { type: Date, required: true },
    nextDueDate: Date,
    batchNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['up_to_date', 'due_soon', 'overdue', 'not_applicable'],
      default: 'up_to_date'
    }
  }],
  diagnosis: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  treatment: {
    type: String,
    trim: true,
    maxlength: 3000
  },
  allergies: [{
    allergen: { type: String, trim: true },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
    notes: { type: String, maxlength: 500 }
  }],
  chronicConditions: [{
    condition: { type: String, trim: true, required: true },
    diagnosedDate: Date,
    status: { type: String, enum: ['active', 'managed', 'resolved'], default: 'active' },
    notes: { type: String, maxlength: 500 }
  }],
  prescriptions: [{
    medication: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    duration: { type: String, trim: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    notes: { type: String, maxlength: 500 }
  }],
  attachments: [{
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'pdf', 'document'], required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now, 
    immutable: true 
  }
});

CatHealthRecordSchema.index({ 'petSnapshot.name': 1 });
CatHealthRecordSchema.index({ createdAt: -1 });

CatHealthRecordSchema.pre('save', function () {
  if (!this.isNew) {
    throw new Error('Health records are immutable and cannot be modified');
  }
});

export const CatHealthRecord = model<ICatHealthRecord>('CatHealthRecord', CatHealthRecordSchema);
// ==================== REFRESH TOKEN SCHEMA ====================
export interface IRefreshToken extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  revoked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
RefreshTokenSchema.index({ user: 1 });
RefreshTokenSchema.index({ token: 1 });
// Auto-delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>("RefreshToken", RefreshTokenSchema);