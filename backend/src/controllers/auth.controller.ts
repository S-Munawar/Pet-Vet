import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fetch from 'cross-fetch';
import { User, AdminProfile, VetProfile, VetLicense, PetOwnerProfile, RefreshToken } from '../models/models.ts';
import type { IUser, IVetProfile, IAuthResponse, IRegisterRequest, ILoginRequest } from '../types/interfaces.ts';
import { mailer } from '../utils/email.ts';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.ts';
import { getGoogleOAuthURL } from '../utils/google.ts';
import { getMicrosoftOAuthURL } from '../utils/microsoft.ts';

export async function registerHandler(req: Request, res: Response) {
  try {
    const { name, email, password, role, licenseNumber, specialization, experienceYears, clinicName, clinicAddress, authProvider }: IRegisterRequest = req.body;
    if (!name || !email || !role) return res.status(400).json({ message: 'Missing required fields' });
    if (role === 'vet' && !licenseNumber) return res.status(400).json({ message: 'License number required for vets' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    let passwordHash: string | undefined;
    if (password) passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const userPayload: Partial<IUser> = { name, email, role, verificationToken, emailVerified: true };
    if (passwordHash) userPayload.password = passwordHash;
    if (authProvider) userPayload.authProviders = [authProvider];
    const user = (await User.create(userPayload)) as IUser;
    if (role === 'admin') await AdminProfile.create({ user_id: user._id });
    else if (role === 'vet') {
      const license = await VetLicense.findOne({ licenseNumber: licenseNumber!.toUpperCase(), status: 'available' });
      if (!license) { await User.findByIdAndDelete(user._id); return res.status(400).json({ message: 'Invalid or already claimed license' }); }
      
      const vetProfileData: any = { 
        user_id: user._id, 
        licenseNumber: licenseNumber!.toUpperCase()
      };
      
      if (specialization) vetProfileData.specialization = specialization;
      if (experienceYears) vetProfileData.experienceYears = experienceYears;
      if (clinicName) vetProfileData.clinicName = clinicName;
      if (clinicAddress) vetProfileData.clinicAddress = clinicAddress;
      
      const vetProfile = await VetProfile.create(vetProfileData);
      license.status = 'claimed'; license.claimedBy = (vetProfile as any)._id; license.claimedAt = new Date(); await license.save();
    } else if (role === 'pet_owner') {
      await PetOwnerProfile.create({ user_id: user._id });
    }
    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) });
    user.lastLogin = new Date(); await user.save();
    const authResponse: IAuthResponse = { success: true, message: 'Registration successful', data: { accessToken, refreshToken, user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified } } };
    return res.status(201).json(authResponse);
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function verifyEmailHandler(req: Request, res: Response) {
  const { token } = req.query;
  if (!token || typeof token !== 'string') return res.status(400).json({ message: 'Invalid token' });
  const user = await User.findOne({ verificationToken: token }) as IUser | null;
  if (!user) return res.status(400).json({ message: 'Invalid token' });
  user.emailVerified = true; user.verificationToken = undefined; await user.save();
  return res.json({ message: 'Email verified successfully!' });
}

export async function manualVerifyHandler(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  const user = await User.findOne({ email }) as IUser | null;
  if (!user) return res.status(400).json({ message: 'User not found' });
  user.emailVerified = true; user.verificationToken = undefined; await user.save();
  return res.json({ message: 'Email verified manually!' });
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const { email, password }: ILoginRequest = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = (await User.findOne({ email }).select('+password')) as (IUser & { password?: string }) | null;
    if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.emailVerified) return res.status(403).json({ message: 'Email not verified' });
    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) });
    user.lastLogin = new Date(); await user.save();
    const authResponse: IAuthResponse = { success: true, message: 'Login successful', data: { accessToken, refreshToken, user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified } } };
    return res.json(authResponse);
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function refreshHandler(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Missing token' });
    const stored = await RefreshToken.findOne({ token: refreshToken, revoked: false });
    if (!stored) return res.status(401).json({ message: 'Invalid refresh token' });
    const decoded = verifyRefreshToken(refreshToken) as { sub: string };
    const newAccessToken = signAccessToken(decoded.sub);
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(401).json({ message: 'Token expired' });
  }
}

export async function logoutHandler(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (refreshToken) await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true });
  return res.json({ message: 'Logged out successfully' });
}

export async function googleAuthHandler(req: Request, res: Response) {
  const flow = req.query.flow as string | undefined;
  let state: string | undefined;
  if (flow === 'register') state = Buffer.from(JSON.stringify({ flow: 'register' })).toString('base64');
  return res.redirect(getGoogleOAuthURL(state));
}

export async function googleAuthCallbackHandler(req: Request, res: Response) {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({ message: "No authorization code" });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code"
      })
    });

    const tokens = await tokenResponse.json();
    const idToken = tokens.id_token;

    if (!idToken) {
      return res.status(400).json({ message: "No ID Token" });
    }

    const payload = JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64").toString()
    );

    const { email, name, sub } = payload;

    if (!email) {
      return res.status(400).json({ message: "Email not provided" });
    }

    // Check if this is a registration flow
    const rawState = req.query.state as string | undefined;
    if (rawState) {
      try {
        const stateObj = JSON.parse(Buffer.from(rawState, 'base64').toString('utf8'));
        if (stateObj && stateObj.flow === 'register') {
          const redirectUrl = `${process.env.CLIENT_URL}/social-register?provider=google&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || '')}&providerId=${encodeURIComponent(sub)}`;
          return res.redirect(redirectUrl);
        }
      } catch (err) {
        console.warn('Invalid state parameter', err);
      }
    }

    // Find by provider
    let user = (await User.findOne({
      authProviders: { $elemMatch: { provider: "google", providerId: sub } }
    })) as IUser | null;

    // If not found by provider, try email
    if (!user) {
      user = (await User.findOne({ email })) as IUser | null;

      if (user) {
        // Link social provider to existing account
        user.authProviders.push({ provider: "google", providerId: sub });
        await user.save();
      } else {
        // No existing account
        const redirectUrl = `${process.env.CLIENT_URL}/social-auth?error=account_not_found&provider=google&email=${encodeURIComponent(email)}`;
        return res.redirect(redirectUrl);
      }
    }

    // Issue tokens
    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });

    user.lastLogin = new Date();
    await user.save();

    const redirectUrl = `${process.env.CLIENT_URL}/social-auth` +
      `?accessToken=${accessToken}` +
      `&refreshToken=${refreshToken}` +
      `&user=${encodeURIComponent(JSON.stringify({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      }))}`;

    return res.redirect(redirectUrl);

  } catch (err) {
    console.error("Google OAuth error:", err);
    return res.status(500).json({ message: "Failed to authenticate" });
  }
};

export async function microsoftAuthHandler (req: Request, res: Response) {
  const flow = req.query.flow as string | undefined;
  let state: string | undefined;
  
  if (flow === 'register') {
    state = Buffer.from(JSON.stringify({ flow: 'register' })).toString('base64');
  }
  
  return res.redirect(getMicrosoftOAuthURL(state));
};

export async function microsoftAuthCallbackHandler (req: Request, res: Response) {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({ message: "No authorization code" });
  }

  try {
    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
        grant_type: "authorization_code",
      })
    });

    const tokenData = await tokenRes.json();
    const { id_token } = tokenData;
    
    if (!id_token) {
      return res.status(400).json({ message: "No ID token returned" });
    }

    const payload = JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());
    const { email, name, sub } = payload;

    if (!email) {
      return res.status(400).json({ message: "Email missing from Microsoft account" });
    }

    // Check if this is a registration flow
    const rawState = req.query.state as string | undefined;
    if (rawState) {
      try {
        const stateObj = JSON.parse(Buffer.from(rawState, 'base64').toString('utf8'));
        if (stateObj && stateObj.flow === 'register') {
          const redirectUrl = `${process.env.CLIENT_URL}/social-register?provider=microsoft&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || '')}&providerId=${encodeURIComponent(sub)}`;
          return res.redirect(redirectUrl);
        }
      } catch (err) {
        console.warn('Invalid state parameter', err);
      }
    }

    // Find user by provider
    let user = (await User.findOne({
      authProviders: { $elemMatch: { provider: "microsoft", providerId: sub } }
    })) as IUser | null;

    // If no provider match, find by email
    if (!user) {
      user = (await User.findOne({ email })) as IUser | null;

      if (user) {
        user.authProviders.push({ provider: "microsoft", providerId: sub });
        await user.save();
      } else {
        const redirectUrl = `${process.env.CLIENT_URL}/social-auth?error=account_not_found&provider=microsoft&email=${encodeURIComponent(email)}`;
        return res.redirect(redirectUrl);
      }
    }

    // Issue JWTs
    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });

    user.lastLogin = new Date();
    await user.save();

    const redirectUrl = `${process.env.CLIENT_URL}/social-auth` +
      `?accessToken=${accessToken}` +
      `&refreshToken=${refreshToken}` +
      `&user=${encodeURIComponent(JSON.stringify({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      }))}`;

    return res.redirect(redirectUrl);

  } catch (err) {
    console.error("Microsoft OAuth error:", err);
    return res.status(500).json({ message: "Microsoft authentication failed" });
  }
};

export { getGoogleOAuthURL, getMicrosoftOAuthURL };
