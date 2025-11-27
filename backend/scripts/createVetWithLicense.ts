import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';
import { User, VetProfile, VetLicense } from '../src/models/models.ts';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(q: string) {
  return new Promise<string>((resolve) => rl.question(q, resolve));
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    // Gather inputs (env vars first, fallback to prompt)
    const adminEmail = process.env.ADMIN_EMAIL || (await question('Admin email (issuer) [default shaikmunawar907@gmail.com]: ')) || 'shaikmunawar907@gmail.com';
    const vetName = process.env.VET_NAME || (await question('Vet full name: '));
    const vetEmail = process.env.VET_EMAIL || (await question('Vet email: '));
    const vetPassword = process.env.VET_PASSWORD || (await question('Vet password (leave empty to auto-generate): '));
    const specialization = process.env.VET_SPECIALIZATION || (await question('Specialization (e.g., small animals): '));
    const experienceYearsStr = process.env.VET_EXPERIENCE || (await question('Experience years (number): '));
    const experienceYears = experienceYearsStr ? Number(experienceYearsStr) : undefined;
    const clinicName = process.env.CLINIC_NAME || (await question('Clinic name: '));
    const clinicStreet = process.env.CLINIC_STREET || (await question('Clinic street: '));
    const clinicCity = process.env.CLINIC_CITY || (await question('Clinic city: '));
    const clinicState = process.env.CLINIC_STATE || (await question('Clinic state/province: '));
    const clinicZip = process.env.CLINIC_ZIP || (await question('Clinic zip/postal code: '));
    const clinicCountry = process.env.CLINIC_COUNTRY || (await question('Clinic country: '));
    const licenseNumber = process.env.LICENSE_NUMBER || (await question('License number (e.g., VET-12345): '));

    if (!vetName || !vetEmail || !licenseNumber) {
      console.error('Required fields missing: vetName, vetEmail, licenseNumber');
      process.exit(1);
    }

    // Find admin
    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      console.error(`Admin with email ${adminEmail} not found. Create an admin first.`);
      process.exit(1);
    }

    // Check license
    let license = await VetLicense.findOne({ licenseNumber });
    if (license && license.status === 'claimed') {
      console.error(`License ${licenseNumber} already claimed. Aborting.`);
      process.exit(1);
    }

    if (!license) {
      license = await VetLicense.create({
        licenseNumber,
        issuedBy: admin._id,
        issueDate: new Date(),
        status: 'available'
      });
      console.log(`Created license ${licenseNumber} issued by admin ${admin.email}`);
    } else {
      // Ensure issuedBy is set
      if (!license.issuedBy) {
        license.issuedBy = admin._id as any;
        await license.save();
      }
      console.log(`Using existing license ${licenseNumber} (status: ${license.status})`);
    }

    // Create vet user
    const existing = await User.findOne({ email: vetEmail });
    if (existing) {
      console.error(`User with email ${vetEmail} already exists. Aborting to avoid overwrite.`);
      process.exit(1);
    }

    const passwordToUse = vetPassword && vetPassword.length >= 8 ? vetPassword : (Math.random().toString(36).slice(-10) + 'A1!');
    const passwordHash = await bcrypt.hash(passwordToUse, 12);

    const vetUser = await User.create({
      name: vetName,
      email: vetEmail,
      password: passwordHash,
      role: 'vet',
      emailVerified: true,
    });

    console.log(`Created vet user ${vetEmail} (id: ${vetUser._id})`);

    // Create VetProfile
    const vetProfileData: any = {
      user_id: vetUser._id,
      licenseNumber,
      issuedBy: admin.email,
    };
    
    if (specialization) vetProfileData.specialization = specialization;
    if (experienceYears && !isNaN(experienceYears)) vetProfileData.experienceYears = experienceYears;
    if (clinicName) vetProfileData.clinicName = clinicName;
    
    if (clinicStreet || clinicCity || clinicState || clinicZip || clinicCountry) {
      vetProfileData.clinicAddress = {};
      if (clinicStreet) vetProfileData.clinicAddress.street = clinicStreet;
      if (clinicCity) vetProfileData.clinicAddress.city = clinicCity;
      if (clinicState) vetProfileData.clinicAddress.state = clinicState;
      if (clinicZip) vetProfileData.clinicAddress.zipCode = clinicZip;
      if (clinicCountry) vetProfileData.clinicAddress.country = clinicCountry;
    }
    
    const vetProfile = await VetProfile.create(vetProfileData);

    console.log(`Created VetProfile (id: ${(vetProfile as any)._id}) for user ${vetUser.email}`);

    // Claim license
    license.claimedBy = (vetProfile as any)._id;
    license.claimedAt = new Date();
    license.status = 'claimed';
    await license.save();

    console.log(`License ${licenseNumber} claimed by vet (profile id: ${(vetProfile as any)._id})`);

    console.log('--- Summary ---');
    console.log(`Vet email: ${vetUser.email}`);
    console.log(`Password (store/change after first login): ${passwordToUse}`);
    console.log(`License: ${license.licenseNumber} (status: ${license.status})`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
