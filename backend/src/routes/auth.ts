import express, { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fetch from "cross-fetch";
import { User } from "../models/models.ts";
import { RefreshToken } from "../models/RefreshToken.ts";
import { mailer } from "../utils/email.ts";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.ts";
import { getGoogleOAuthURL } from "../utils/google.ts";
import { getMicrosoftOAuthURL } from "../utils/microsoft.ts";


const router: Router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await User.create({
      name,
      email,
      password: passwordHash,
      role,
      verificationToken,
      emailVerified: false,
    });

    const verifyURL = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    await mailer.sendMail({
      to: email,
      subject: "Verify your email",
      html: `<p>Hello ${name},</p>
             <p>Please verify your email by clicking:</p>
             <a href="${verifyURL}" target="_blank">Verify Email</a>`
    });

    return res.status(201).json({
      message: "Registration successful! Check your email for verification link."
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: "Invalid token" });
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) return res.status(400).json({ message: "Invalid token" });

  user.emailVerified = true;
  user.verificationToken = null;
  await user.save();

  return res.json({ message: "Email verified successfully!" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  if (!user.emailVerified)
    return res.status(403).json({ message: "Email not verified" });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  });

  user.lastLogin = new Date();
  await user.save();

  return res.json({
    accessToken,
    refreshToken,
    user: { email: user.email, name: user.name, role: user.role }
  });
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Missing token" });

  const stored = await RefreshToken.findOne({ token: refreshToken, revoked: false });
  if (!stored) return res.status(401).json({ message: "Invalid refresh token" });

  try {
    const decoded = verifyRefreshToken(refreshToken) as any;
    const newAccessToken = signAccessToken(decoded.sub);

    return res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(401).json({ message: "Token expired" });
  }
});

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true });
  return res.json({ message: "Logged out successfully" });
});

router.get("/google", (req, res) => {
  return res.redirect(getGoogleOAuthURL());
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code as string;

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

    if (!idToken) return res.status(400).json({ message: "No ID Token" });

    const payload = JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64").toString()
    );

    const { email, name, picture, sub } = payload;

    if (!email) return res.status(400).json({ message: "Email not provided" });

    // Find by provider
    let user = await User.findOne({
      authProviders: { $elemMatch: { provider: "google", providerId: sub } }
    });

    // If not found, check if email exists → link provider
    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        user.authProviders.push({
          provider: "google",
          providerId: sub
        });
      } else {
        // Create new social-only user
        user = await User.create({
          name,
          email,
          emailVerified: true, // Google email is verified
          role: "pet_owner",   // default; can adjust
          authProviders: [{ provider: "google", providerId: sub }],
        });
      }

      await user.save();
    }

    // Issue tokens
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });

    // Redirect or respond JSON
    const redirectUrl = `${process.env.CLIENT_URL}/social-auth` +
    `?accessToken=${accessToken}` +
    `&refreshToken=${refreshToken}` +
    `&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }))}`;

    // return res.json({
    //   message: "Google login successful",
    //   accessToken,
    //   refreshToken,
    //   user: {
    //     id: user.id,
    //     email: user.email,
    //     name: user.name
    //   }
    // });

    return res.redirect(redirectUrl);

  } catch (err) {
    console.error("Google OAuth error:", err);
    return res.status(500).json({ message: "Failed to authenticate" });
  }
});

router.get("/microsoft", (req, res) => {
  return res.redirect(getMicrosoftOAuthURL());
});

router.get("/microsoft/callback", async (req, res) => {
  const code = req.query.code as string;

  try {
    // Exchange code for tokens
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
    if (!id_token) return res.status(400).json({ message: "No ID token returned" });

    // Decode Microsoft id_token (same as JWT parsing)
    const payload = JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());
    const { email, name, sub } = payload;

    if (!email) return res.status(400).json({ message: "Email missing from Microsoft account" });

    // Find user by provider
    let user = await User.findOne({
      authProviders: { $elemMatch: { provider: "microsoft", providerId: sub } }
    });

    // If no provider match, find by email
    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        user.authProviders.push({
          provider: "microsoft",
          providerId: sub
        });
      } else {
        user = await User.create({
          name: name ?? email.split("@")[0],
          email,
          role: "pet_owner",   // default
          emailVerified: true, // Microsoft gives verified email
          authProviders: [{ provider: "microsoft", providerId: sub }],
        });
      }

      await user.save();
    }

    // Issue JWTs
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    // Store refresh token
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });

    // return res.json({
    //   message: "Microsoft login successful",
    //   accessToken,
    //   refreshToken,
    //   user: { id: user.id, email: user.email, name: user.name }
    // });

    // instead of res.json({ accessToken, refreshToken, user })
    const redirectUrl = `${process.env.CLIENT_URL}/social-auth` +
      `?accessToken=${accessToken}` +
      `&refreshToken=${refreshToken}` +
      `&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }))}`;

    return res.redirect(redirectUrl);


  } catch (err) {
    console.error("Microsoft OAuth error:", err);
    return res.status(500).json({ message: "Microsoft authentication failed" });
  }
});

export default router;
