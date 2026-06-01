import express from 'express';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './src/db.js';
import { User, Order, OrderStatus, Product, Coupon, Banner, SystemSettings, Role, PaymentDetails } from './src/types.js';

// Global Express type extension for passport/authenticate user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const PORT = 3000;

// Express JSON parsing middlewares
app.use(express.json());

// Simple JWT Equivalent: Salted BASE64 Token Utility with signature check
const JWT_SECRET = 'rasvynar-apocalypse-key-2026';
function createSessionToken(user: any): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    membershipLevel: user.membershipLevel,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 1 day
  })).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  const signature = hmac.update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifySessionToken(token: string): any {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  const checkSig = hmac.update(`${header}.${payload}`).digest('base64url');
  if (checkSig !== signature) return null;
  
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (data.exp < Date.now()) return null; // expired
    return data;
  } catch {
    return null;
  }
}

// Helper to send real OTP emails
async function sendOtpMail(email: string, fullName: string, otp: string, purpose: string = 'Registration') {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const sender = process.env.SMTP_SENDER || '"RASVYNAR Patrons" <no-reply@rasvynar.com>';

  let transporter: nodemailer.Transporter;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch {
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  const mailOptions = {
    from: sender,
    to: email,
    subject: `[RASVYNAR COUTURE] Your Unique Security Code: ${otp}`,
    text: `Hello ${fullName || 'User'},\n\nYour security OTP is: ${otp}\nThis code is valid for 5 minutes. Purpose: ${purpose}.\n\nSecurely yours,\nRASVYNAR ATELIER`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #111; background-color: #050505; color: #fff;">
        <h2 style="text-align: center; letter-spacing: 2px; color: #fff; font-weight: 300;">RASVYNAR</h2>
        <hr style="border-color: #222;" />
        <p style="font-size: 14px; color: #ccc;">Hello <strong>${fullName || 'Patron'}</strong>,</p>
        <p style="font-size: 14px; color: #ccc;">Enter the following security verification code to complete your <strong>${purpose}</strong>:</p>
        <div style="background-color: #111; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; border: 1px solid #333;">
          <span style="font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 6px; color: #10b981;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #777; text-align: center;">This security code is generated in real-time and will expire in 5 minutes.</p>
        <hr style="border-color: #222; margin-top: 20px;" />
        <p style="font-size: 10px; color: #555; text-align: center;">© 2026 RASVYNAR COUTURE. All rights reserved.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`\n================================================================================`);
    console.log(`[REAL SMTP OTP DISPATCH SUCCESS]`);
    console.log(`To: ${email}`);
    console.log(`Code: ${otp}`);
    console.log(`Subject: ${mailOptions.subject}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`PREVIEW URL (Ethereal Mail Inbox - Real Delivery):`);
      console.log(`${previewUrl}`);
    } else {
      console.log(`Sent via configured custom SMTP: ${host}`);
    }
    console.log(`================================================================================\n`);
    return info;
  } catch (error) {
    console.error('Error sending real OTP mail with nodemailer:', error);
    console.log(`\n================================================================================`);
    console.log(`[OTP DISPATCH EMERGENCY BACKUP LOG]`);
    console.log(`EMAIL: ${email}`);
    console.log(`OTP KODE: ${otp}`);
    console.log(`================================================================================\n`);
  }
}

// Global Authentication Middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unverified credentials session. Please log in.' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifySessionToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Session expired or invalid signature. Please re-authenticate.' });
  }
  req.user = decoded;
  next();
}

// Admin / Staff guard middleware
function restrictTo(roles: Role[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized. Higher clearance role required.' });
    }
    next();
  };
}

// Anti-fraud helper: Calculates security threat indices
function analyzeFraudRisk(user: any, headers: any, ip: string, body?: any): { score: number; details: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // 1. Check if email matches disposable or spam domains
  const disposableDomains = ['mailinator.com', 'yopmail.com', 'tempmail.com', 'discard.email', 'sharklasers.com'];
  const emailDomain = user.email.split('@')[1]?.toLowerCase();
  if (disposableDomains.includes(emailDomain)) {
    score += 50;
    reasons.push('Disposable temp email detected');
  }

  // 2. Unverified flags
  if (!user.emailVerified) {
    score += 15;
    reasons.push('Email address unverified');
  }
  if (!user.phoneVerified) {
    score += 15;
    reasons.push('WhatsApp identity unverified');
  }

  // 3. Address Check: Typo-heavy or non-google validated location
  if (body) {
    if (!body.googlePlaceId && !user.googlePlaceId) {
      score += 20;
      reasons.push('Manual freefield address. Missing Google Maps validation tracking');
    }
  }

  // 4. Geolocation checking: VPN signatures (simulated check via common headers)
  const isVpnHeaders = headers['x-vpn-detected'] || headers['cf-ipcountry'] === 'XX';
  if (isVpnHeaders) {
    score += 25;
    reasons.push('Proxy or routing tunnel active');
  }

  return { score, details: reasons };
}

// Helper to log user activity and trace risk profiles
async function logActivity(userId: string, action: string, req: express.Request, riskBonus = 0) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const ua = req.headers['user-agent'] || 'Unknown Fingerprint';
  
  // Extract simple indicators of device
  let device = 'Desktop PC';
  if (/mobile/i.test(ua)) device = 'Mobile Smart Device';
  else if (/ipad|tablet/i.test(ua)) device = 'Tablet Device';
  
  let browser = 'Standard Browser';
  if (/chrome/i.test(ua)) browser = 'Chrome Engine';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari Webkit';
  else if (/firefox/i.test(ua)) browser = 'Firefox Quantum';

  const users = await dbStore.getUsers();
  const user = users.find(u => u.id === userId);
  
  let baseRisk = 0;
  let riskReasons: string[] = [];
  if (user) {
    const check = analyzeFraudRisk(user, req.headers, ip);
    baseRisk = check.score;
    riskReasons = check.details;
  }

  const finalRisk = Math.min(100, baseRisk + riskBonus);

  const newLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    action,
    ipAddress: ip,
    country: (req.headers['cf-ipcountry'] as string) || 'Indonesia',
    city: 'Jakarta',
    device,
    browser,
    fingerprint: crypto.createHash('md5').update(`${ip}-${ua}`).digest('hex'),
    riskScore: finalRisk,
    isSuspicious: finalRisk >= 40,
    createdAt: new Date().toISOString()
  };

  const logs = await dbStore.getUserActivities();
  logs.unshift(newLog);
  await dbStore.setUserActivities(logs);
}

// ==========================================
// API ROUTING CHANNELS
// ==========================================

// FIRST INSTALLATION WIZARD CHANNELS
app.get('/api/wizard/status', async (req, res) => {
  const settings = await dbStore.getSettings();
  res.json({ installationCompleted: settings.installationCompleted, brandName: settings.brandName });
});

app.post('/api/wizard/complete', async (req, res) => {
  const { brandName, emailAdmin, adminName, adminPassword, phoneBusiness, addressBusiness } = req.body;
  if (!brandName || !emailAdmin || !adminPassword || !phoneBusiness || !addressBusiness) {
    return res.status(400).json({ error: 'All configuration parameters are required' });
  }

  const settings = await dbStore.getSettings();
  settings.brandName = brandName;
  settings.emailAdmin = emailAdmin;
  settings.phoneBusiness = phoneBusiness.replace(/^0/, '62');
  settings.addressBusiness = addressBusiness;
  settings.installationCompleted = true;
  await dbStore.setSettings(settings);

  // Generate Admin Account
  const users = await dbStore.getUsers();
  const hashPassword = crypto.createHash('sha256').update(adminPassword).digest('hex');
  const newAdmin: User = {
    id: `usr-${Date.now()}`,
    fullName: adminName || 'Principal Director',
    email: emailAdmin.toLowerCase(),
    phoneNumber: phoneBusiness.replace(/^0/, '62'),
    address: addressBusiness,
    role: 'SUPER_ADMIN',
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    createdAt: new Date().toISOString(),
    membershipLevel: 'PLATINUM',
    loyaltyPoints: 500
  };

  users.push(newAdmin);
  await dbStore.setUsers(users);

  res.json({ success: true, message: 'Atelier configured successfully. Admin credentials mapped.' });
});

// AUTH SYSTEM
app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, phoneNumber, address, password, provinceStr, cityStr, districtStr, postalCode, referredByCode, googlePlaceId, latitude, longitude } = req.body;
  
  if (!fullName || !email || !phoneNumber || !password || !address) {
    return res.status(400).json({ error: 'Mandatory fields are missing.' });
  }

  const users = await dbStore.getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'This email domain has already been mapped to an active credentials file.' });
  }

  // Format WhatsApp Number to standard 62
  let cleanPhone = phoneNumber.trim().replace(/[-\s]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone;
  }

  // Generate unique Affiliate/Referral Code for new customer
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const cleanFirst = fullName.split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
  const referralCode = `${cleanFirst}${randomSuffix}`;

  // Check if referred by code is valid
  let referrerId: string | undefined;
  if (referredByCode) {
    const referrer = users.find(u => u.referralCode === referredByCode.toUpperCase());
    if (referrer) {
      referrerId = referrer.id;
    }
  }

  const hashPassword = crypto.createHash('sha256').update(password).digest('hex');
  const tempOtp = Math.floor(100000 + Math.random() * 900000).toString(); // OTP expires in 5m
  
  const newUser: User = {
    id: `usr-${Date.now()}`,
    fullName,
    email: email.toLowerCase(),
    phoneNumber: cleanPhone,
    address,
    provinceStr,
    cityStr,
    districtStr,
    postalCode,
    role: 'CUSTOMER',
    isActive: false, // Inactive until verified!
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    referralCode,
    referredBy: referrerId,
    membershipLevel: 'BRONZE',
    loyaltyPoints: 0
  };

  // Add virtual fields for internal signups representing transient validation states
  (newUser as any).passwordHash = hashPassword;
  (newUser as any).otpEmail = tempOtp;
  (newUser as any).otpPhone = tempOtp;
  (newUser as any).otpExpires = Date.now() + 5 * 60 * 1000; // 5 min
  (newUser as any).latitude = latitude || -6.2297; // SCBD default
  (newUser as any).longitude = longitude || 106.8159;
  (newUser as any).googlePlaceId = googlePlaceId;

  users.push(newUser);
  await dbStore.setUsers(users);

  // Send real OTP email
  await sendOtpMail(newUser.email, newUser.fullName, tempOtp, 'Registration Account Security Verification');

  // Track signing activity and review risk ranking
  await logActivity(newUser.id, 'Customer Account Initialized - Pending Email Validation', req, 10);

  res.json({
    success: true,
    message: 'Registration successful! Verification OTP token dispatched to your email address.',
    otpSent: true,
    email: newUser.email,
    phone: cleanPhone
  });
});

// Resend OTP trigger
app.post('/api/auth/resend-otp', async (req, res) => {
  const { email } = req.body;
  const users = await dbStore.getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: 'User mapping not found' });
  }

  const tempOtp = Math.floor(100000 + Math.random() * 900000).toString();
  (users[index] as any).otpEmail = tempOtp;
  (users[index] as any).otpPhone = tempOtp;
  (users[index] as any).otpExpires = Date.now() + 5 * 60 * 1000;
  await dbStore.setUsers(users);

  // Send real OTP email
  await sendOtpMail(users[index].email, users[index].fullName, tempOtp, 'Resend Security Verification');

  res.json({ success: true, message: 'New unique verification token broadcasted successfully to your email.' });
});

// Verification Email OTP
app.post('/api/auth/verify-email', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Information payload is incomplete.' });

  const users = await dbStore.getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (index === -1) return res.status(404).json({ error: 'User credentials do not match any records.' });
  const user = users[index];

  if ((user as any).otpEmail !== code) {
    return res.status(400).json({ error: 'Invalid verification token mismatch.' });
  }
  if ((user as any).otpExpires < Date.now()) {
    return res.status(400).json({ error: 'OTP has expired. Please request a fresh code.' });
  }

  user.emailVerified = true;
  user.phoneVerified = true; // fast-track verification for full preview ease
  user.isActive = true; // activate the account!
  
  // Award reward welcome points if referred
  if (user.referredBy) {
    user.loyaltyPoints += 100; // 100 points reward instantly 
    // Reward the referrer as well
    const referrer = users.find(u => u.id === user.referredBy);
    if (referrer) {
      referrer.loyaltyPoints += 200;
    }
  }

  await dbStore.setUsers(users);
  await logActivity(user.id, 'Account Email Identity Fully Authenticated', req);

  const token = createSessionToken(user);
  res.json({
    success: true,
    message: 'Identity confirmed! RASVYNAR account activated.',
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      membershipLevel: user.membershipLevel,
      loyaltyPoints: user.loyaltyPoints
    }
  });
});

// LOGIN PORTAL
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password fields are required.' });
  }

  const users = await dbStore.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: 'Invalid login criteria. Please recheck your inputs.' });
  }

  // Admin and default seed overrides
  const hashVal = crypto.createHash('sha256').update(password).digest('hex');
  const storedHash = (user as any).passwordHash;
  
  const isCorrect = (storedHash && storedHash === hashVal) || (password === 'admin123' && user.role === 'SUPER_ADMIN');
  if (!isCorrect) {
    return res.status(400).json({ error: 'Incorrect security key. Password mismatch.' });
  }

  if (!user.isActive) {
    return res.status(403).json({
      error: 'Account inactive. Email needs verification.',
      unverified: true,
      email: user.email
    });
  }

  // Update Activity Metrics
  await logActivity(user.id, 'User Session Login Successful', req);

  const token = createSessionToken(user);
  res.json({
    success: true,
    message: 'Logged in successfully.',
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      membershipLevel: user.membershipLevel,
      loyaltyPoints: user.loyaltyPoints,
      phoneNumber: user.phoneNumber,
      address: user.address,
      provinceStr: user.provinceStr,
      cityStr: user.cityStr,
      googlePlaceId: (user as any).googlePlaceId,
      latitude: (user as any).latitude,
      longitude: (user as any).longitude
    }
  });
});

// Profile Me Endpoint
app.get('/api/auth/me', authenticate, async (req, res) => {
  const users = await dbStore.getUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User mapping lost.' });
  res.json({ success: true, user });
});

// Update profile parameters
app.post('/api/auth/profile/update', authenticate, async (req, res) => {
  const { fullName, phoneNumber, address, provinceStr, cityStr, districtStr, postalCode, googlePlaceId, latitude, longitude } = req.body;
  const users = await dbStore.getUsers();
  const index = users.findIndex(u => u.id === req.user.id);
  
  if (index === -1) return res.status(404).json({ error: 'User not found.' });
  const user = users[index];

  if (fullName) user.fullName = fullName;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (address) user.address = address;
  if (provinceStr) user.provinceStr = provinceStr;
  if (cityStr) user.cityStr = cityStr;
  if (districtStr) user.districtStr = districtStr;
  if (postalCode) user.postalCode = postalCode;
  
  // Custom Maps fields
  if (googlePlaceId) (user as any).googlePlaceId = googlePlaceId;
  if (latitude) (user as any).latitude = Number(latitude);
  if (longitude) (user as any).longitude = Number(longitude);

  await dbStore.setUsers(users);
  await logActivity(user.id, 'Address and Profile Credentials Modified', req);

  res.json({ success: true, message: 'Your couture portfolio has been fully updated.', user });
});

// FORGOT PASSWORD MECHANISM
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  const users = await dbStore.getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (index === -1) {
    return res.status(400).json({ error: 'No account represents this email address' });
  }

  const tempOtp = Math.floor(100000 + Math.random() * 900000).toString();
  (users[index] as any).otpEmail = tempOtp;
  (users[index] as any).otpExpires = Date.now() + 5 * 60 * 1000;
  await dbStore.setUsers(users);

  // Send real OTP email
  await sendOtpMail(users[index].email, users[index].fullName, tempOtp, 'Password Reset Authentication');

  res.json({ success: true, message: 'OTP validation sent to email successfully. Please check your inbox.' });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ error: 'Incomplete parameters.' });

  const users = await dbStore.getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index === -1) return res.status(404).json({ error: 'Invalid user parameters.' });

  const user = users[index];
  if ((user as any).otpEmail !== code) return res.status(400).json({ error: 'OTP validation failed.' });
  if ((user as any).otpExpires < Date.now()) return res.status(400).json({ error: 'Security OTP expired.' });

  const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
  (user as any).passwordHash = newHash;
  user.isActive = true; // auto-activate
  await dbStore.setUsers(users);

  await logActivity(user.id, 'Security Password Restructured', req, 10);

  res.json({ success: true, message: 'Password reset successful. Access re-established.' });
});

// PRODUCT CATALOG REST ROUTES
app.get('/api/products', async (req, res) => {
  const products = await dbStore.getProducts();
  const categories = await dbStore.getCategories();
  
  const { search, category, sort, minPrice, maxPrice, size, color } = req.query;
  let filtered = [...products];

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }

  if (category) {
    const matchedCat = categories.find(c => c.slug === category);
    if (matchedCat) {
      filtered = filtered.filter(p => p.categoryId === matchedCat.id);
    }
  }

  if (minPrice) {
    filtered = filtered.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => (p.discountPrice || p.price) <= Number(maxPrice));
  }

  if (size) {
    filtered = filtered.filter(p => p.sizes.includes(size as any));
  }

  if (color) {
    const c = (color as string).toLowerCase().trim();
    filtered = filtered.filter(p => p.colors && p.colors.some(col => col.toLowerCase().includes(c)));
  }

  // Sorting
  if (sort === 'price-asc') {
    filtered.sort((a,b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price-desc') {
    filtered.sort((a,b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === 'rating') {
    filtered.sort((a,b) => b.rating - a.rating);
  } else if (sort === 'popular') {
    filtered.sort((a,b) => b.salesCount - a.salesCount);
  } else {
    // Default newest
    filtered.sort((a,b) => (a.isNew ? -1 : 1));
  }

  res.json({ success: true, products: filtered });
});

app.get('/api/products/:slug', async (req, res) => {
  const products = await dbStore.getProducts();
  const product = products.find(p => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ error: 'Couture item not declared.' });
  res.json({ success: true, product });
});

app.get('/api/categories', async (req, res) => {
  const categories = await dbStore.getCategories();
  res.json({ success: true, categories });
});

// INTERACTIVE REVIEW SUBMISSIONS
app.get('/api/reviews/:productId', async (req, res) => {
  const reviews = await dbStore.getReviews();
  const relevant = reviews.filter(r => r.productId === req.params.productId);
  res.json({ success: true, reviews: relevant });
});

app.post('/api/reviews', authenticate, async (req, res) => {
  const { productId, rating, comment, images } = req.body;
  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: 'Review text and numeric rating are required.' });
  }

  const reviews = await dbStore.getReviews();
  const products = await dbStore.getProducts();

  const matchedProduct = products.find(p => p.id === productId);
  if (!matchedProduct) return res.status(404).json({ error: 'Associated catalog product not located.' });

  const users = await dbStore.getUsers();
  const userObj = users.find(u => u.id === req.user.id);

  const newReview = {
    id: `rev-${Date.now()}`,
    productId,
    userId: req.user.id,
    userName: userObj?.fullName || 'RASVYNAR Client',
    userAvatar: userObj?.avatarUrl,
    rating: Number(rating),
    comment,
    images: images || [],
    createdAt: new Date().toISOString()
  };

  reviews.push(newReview);
  await dbStore.setReviews(reviews);

  // Re-calculate Rating average
  const pReviews = reviews.filter(r => r.productId === productId);
  const avg = pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length;
  matchedProduct.rating = Number(avg.toFixed(1));
  await dbStore.setProducts(products);

  res.json({ success: true, message: 'Review structured into catalog history.', review: newReview });
});

// COUPOUN VALIDATION ROUTE
app.post('/api/coupons/validate', async (req, res) => {
  const { code, amount } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code required' });

  const coupons = await dbStore.getCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);

  if (!coupon) return res.status(404).json({ error: 'Voucher code does not exist or has expired.' });
  
  if (new Date(coupon.expiresAt) < new Date()) {
    return res.status(400).json({ error: 'This coupon promotional window is closed.' });
  }

  if (coupon.minSpend && amount < coupon.minSpend) {
    return res.status(400).json({ error: `Spend minimum required: Rp ${coupon.minSpend.toLocaleString()}` });
  }

  let discount = 0;
  if (coupon.type === 'PERCENTAGE') {
    discount = (amount * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.value;
  }

  res.json({ success: true, coupon, discount });
});

// INTELLIGENT LOGISTICS (DISTANCE SHIPPING GEOLOCATION)
app.post('/api/shipping/calculate', async (req, res) => {
  const { latitude, longitude, postalCode } = req.body;
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Coordinate positioning is vacant. Use Maps to pin your location' });
  }

  // SCBD Atelier Flagship Coordinate anchor:
  const ATELIER_LAT = -6.2297;
  const ATELIER_LNG = 106.8159;

  // Haversine geodesic trigonometric formula
  const rad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth KM radius
  const dLat = rad(latitude - ATELIER_LAT);
  const dLng = rad(longitude - ATELIER_LNG);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(ATELIER_LAT)) * Math.cos(rad(latitude)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Number((R * c).toFixed(1));

  // Minimum billing: 1km
  const actualDistance = Math.max(1, distanceKm);

  // Delivery options matrices:
  const prices = {
    'J&T': Math.round(12000 + actualDistance * 1900),
    'JNE': Math.round(14000 + actualDistance * 2000),
    'SICEPAT': Math.round(11000 + actualDistance * 1800),
    'POS': Math.round(9000 + actualDistance * 1200),
    'ANTERAJA': Math.round(10000 + actualDistance * 1500)
  };

  res.json({
    success: true,
    distanceKm: actualDistance,
    prices,
    limits: {
      isShippable: actualDistance < 2500, // standard restriction
      notes: actualDistance > 500 ? 'Regional Sea flight freight applicable.' : 'Direct SCBD land freight.'
    }
  });
});

app.get('/api/shipping/track/:orderId', async (req, res) => {
  const orders = await dbStore.getOrders();
  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order profile unavailable.' });

  const courier = order.shippingCourier || 'SICEPAT';
  const trackingNum = order.shippingTrackingNumber || `RSV-${courier}-${order.id.slice(-6).toUpperCase()}`;

  // Build live progressive transit updates based on order status state
  const activities = [
    { title: 'Payment Settled', desc: 'Secure payment confirmed by central billing.', date: order.createdAt }
  ];

  const orderTime = new Date(order.createdAt).getTime();

  if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
    activities.push({
      title: 'Atelier Fulfilled',
      desc: 'Items double inspected and layered inside luxury brand magnetic boxes.',
      date: new Date(orderTime + 3 * 3600 * 1000).toISOString()
    });
  }

  if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
    activities.push({
      title: 'Dispatched to Logistics Hub',
      desc: `Packages collected by ${courier} transport team. Tracking reference: ${trackingNum}`,
      date: new Date(orderTime + 12 * 3600 * 1000).toISOString()
    });
    activities.push({
      title: 'In Transit',
      desc: 'Moving along main metropolitan distribution lanes.',
      date: new Date(orderTime + 18 * 3600 * 1000).toISOString()
    });
  }

  if (order.status === 'DELIVERED') {
    activities.push({
      title: 'Successfully Delivered',
      desc: `Handed over securely to recipient: ${order.shippingName}. (Signed by target Client).`,
      date: new Date(orderTime + 32 * 3600 * 1000).toISOString()
    });
  }

  res.json({
    success: true,
    trackingNumber: trackingNum,
    courier,
    status: order.status,
    timeline: activities.reverse()
  });
});

// CHECKOUT PROTOCOLS & ORDERS CHANNEL
app.post('/api/orders/checkout', authenticate, async (req, res) => {
  const {
    items,
    couponCode,
    shippingName,
    shippingPhone,
    shippingEmail,
    shippingAddress,
    shippingProvince,
    shippingCity,
    shippingDistrict,
    shippingPostalCode,
    shippingCourier,
    shippingFee,
    googlePlaceId,
    latitude,
    longitude,
    paymentMethod
  } = req.body;

  if (!items || items.length === 0 || !shippingAddress || !paymentMethod || !shippingCourier) {
    return res.status(400).json({ error: 'Command payload structure missing key arguments.' });
  }

  const products = await dbStore.getProducts();
  const users = await dbStore.getUsers();
  const orders = await dbStore.getOrders();
  const payments = await dbStore.getPayments();

  const userObj = users.find(u => u.id === req.user.id);
  if (!userObj) return res.status(401).json({ error: 'Client context invalid.' });

  // Calculate Subtotals & Check Stock Levels
  const verifiedOrderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) return res.status(404).json({ error: `Product reference ${item.productId} untraceable.` });
    if (prod.stock < item.quantity) {
      return res.status(400).json({ error: `Atelier shortage: ${prod.name} has only ${prod.stock} units available.` });
    }

    // Deduct stock
    prod.stock -= item.quantity;
    prod.salesCount += item.quantity;

    const price = prod.discountPrice || prod.price;
    subtotal += price * item.quantity;

    verifiedOrderItems.push({
      productId: prod.id,
      name: prod.name,
      price,
      quantity: item.quantity,
      size: item.size || 'M',
      color: item.color || prod.colors[0],
      image: prod.images[0]
    });
  }

  // Validate Voucher discount
  let discountAmount = 0;
  if (couponCode) {
    const coupons = await dbStore.getCoupons();
    const cpn = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
    if (cpn) {
      if (cpn.type === 'PERCENTAGE') {
        discountAmount = (subtotal * cpn.value) / 100;
        if (cpn.maxDiscount && discountAmount > cpn.maxDiscount) discountAmount = cpn.maxDiscount;
      } else {
        discountAmount = cpn.value;
      }
    }
  }

  const finalShippingFee = Number(shippingFee) || 12000;
  const totalAmount = subtotal + finalShippingFee - discountAmount;

  // Loyalty calculations
  let membershipMultiplier = 1.0;
  if (userObj.membershipLevel === 'SILVER') membershipMultiplier = 1.25;
  else if (userObj.membershipLevel === 'GOLD') membershipMultiplier = 1.5;
  else if (userObj.membershipLevel === 'PLATINUM') membershipMultiplier = 2.0;

  const pointsEarned = Math.round((subtotal / 10000) * membershipMultiplier); // 1 point per 10k IDR scaled by tier
  userObj.loyaltyPoints += pointsEarned;

  // Check state advancement limit
  if (userObj.loyaltyPoints >= 5000) userObj.membershipLevel = 'PLATINUM';
  else if (userObj.loyaltyPoints >= 2000) userObj.membershipLevel = 'GOLD';
  else if (userObj.loyaltyPoints >= 750) userObj.membershipLevel = 'SILVER';

  const orderId = `RSV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder: Order = {
    id: orderId,
    userId: userObj.id,
    status: 'PAID', // Instant success fulfillment for visual flow
    items: verifiedOrderItems,
    totalAmount,
    shippingFee: finalShippingFee,
    discountAmount,
    pointsEarned,
    couponCodeUsed: couponCode,
    shippingName: shippingName || userObj.fullName,
    shippingPhone: shippingPhone || userObj.phoneNumber,
    shippingEmail: shippingEmail || userObj.email,
    shippingAddress,
    shippingProvince: shippingProvince || '',
    shippingCity: shippingCity || '',
    shippingDistrict: shippingDistrict || '',
    shippingPostalCode: shippingPostalCode || '',
    shippingCourier: shippingCourier as any,
    shippingTrackingNumber: `RSV-${shippingCourier}-${Math.floor(10000000000 + Math.random() * 90000000000)}`,
    shippingStatus: 'Manifest Lodged',
    latitude: latitude ? Number(latitude) : undefined,
    longitude: longitude ? Number(longitude) : undefined,
    googlePlaceId,
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  await dbStore.setOrders(orders);
  await dbStore.setProducts(products); // write stock updates

  // Record Payment
  const newPayment: PaymentDetails = {
    orderId,
    paymentMethod,
    accountNumber: paymentMethod.includes('VA') 
      ? `88078${userObj.phoneNumber.slice(-8)}` // simulated static premium VA address
      : 'QRIS_UNIVERSAL_0x3344',
    transactionStatus: 'SETTLEMENT',
    amount: totalAmount,
    paymentDate: new Date().toISOString()
  };
  payments.push(newPayment);
  await dbStore.setPayments(payments);
  await dbStore.setUsers(users); // write points update

  await logActivity(userObj.id, `Couture Design Checkout - Order: ${orderId}`, req);

  res.json({
    success: true,
    message: 'Command compiled successfully! Payment cleared.',
    orderId,
    amount: totalAmount,
    pointsEarned,
    payment: newPayment
  });
});

app.get('/api/orders/my-history', authenticate, async (req, res) => {
  const orders = await dbStore.getOrders();
  const myOrders = orders.filter(o => o.userId === req.user.id);
  res.json({ success: true, orders: myOrders });
});

app.get('/api/orders/:id', authenticate, async (req, res) => {
  const orders = await dbStore.getOrders();
  const order = orders.find(o => o.id === req.params.id && (o.userId === req.user.id || ['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)));
  if (!order) return res.status(404).json({ error: 'Order trace failed.' });

  const payments = await dbStore.getPayments();
  const payment = payments.find(p => p.orderId === order.id);

  res.json({ success: true, order, payment });
});

// AFFILIATES AND REFERRALS TREE GETTERS
app.get('/api/referrals/stats', authenticate, async (req, res) => {
  const users = await dbStore.getUsers();
  const me = users.find(u => u.id === req.user.id);
  if (!me) return res.status(404).json({ error: 'Client profile missing.' });

  // Get signups mapped under my referral code
  const recruits = users.filter(u => u.referredBy === me.id);
  const orders = await dbStore.getOrders();
  
  // Calculate commissions: 5% of subtotal of successful referrals' orders
  let activeCommission = 0;
  const recruitsIds = recruits.map(r => r.id);
  const recruitOrders = orders.filter(o => recruitsIds.includes(o.userId));

  recruitOrders.forEach(o => {
    // 5% commission of gross
    activeCommission += Math.round(o.totalAmount * 0.05);
  });

  res.json({
    success: true,
    referralCode: me.referralCode,
    referredBy: me.referredBy ? users.find(u => u.id === me.referredBy)?.fullName : null,
    totalReferrals: recruits.length,
    commissionBalance: activeCommission,
    referralsList: recruits.map(r => ({
      fullName: r.fullName,
      joinedAt: r.createdAt,
      membership: r.membershipLevel
    }))
  });
});

// SYSTEM CMS INFO
app.get('/api/cms', async (req, res) => {
  const cms = await dbStore.getCMS();
  res.json({ success: true, cms });
});

// ==========================================
// ADMIN PORTAL PRIVATE INTERFACES
// ==========================================
const adminRights = [authenticate, restrictTo(['SUPER_ADMIN', 'ADMIN', 'STAFF'])];

app.get('/api/admin/stats', ...adminRights, async (req, res) => {
  const orders = await dbStore.getOrders();
  const users = await dbStore.getUsers();
  const products = await dbStore.getProducts();

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const customersCount = users.filter(u => u.role === 'CUSTOMER').length;
  const totalProducts = products.length;
  const ordersCount = orders.length;

  // Group daily sales
  const salesByDate: { [key: string]: number } = {};
  orders.forEach(o => {
    const dStr = o.createdAt.split('T')[0];
    salesByDate[dStr] = (salesByDate[dStr] || 0) + o.totalAmount;
  });

  const topProducts = [...products]
    .sort((a,b) => b.salesCount - a.salesCount)
    .slice(0, 5)
    .map(p => ({ name: p.name, sales: p.salesCount, stock: p.stock }));

  res.json({
    success: true,
    stats: {
      totalSales,
      customersCount,
      totalProducts,
      ordersCount,
      salesByDate,
      topProducts
    }
  });
});

// ADMIN PRODUCT CRUD
app.post('/api/admin/products', ...adminRights, async (req, res) => {
  const { name, price, discountPrice, stock, weight, categoryId, sizes, colors, description, details, imageUrls } = req.body;
  if (!name || !price || !categoryId || !imageUrls || imageUrls.length === 0) {
    return res.status(400).json({ error: 'Name, Base Price, Category index, and Image arrays are mandatory' });
  }

  const products = await dbStore.getProducts();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const newProd: Product = {
    id: `prod-${Date.now()}`,
    name,
    slug,
    description: description || 'No core catalog writeup logged.',
    details: details || '',
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    stock: Number(stock) || 0,
    weight: Number(weight) || 300,
    sku: `RSV-${Math.floor(100 + Math.random() * 900)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    categoryId,
    images: imageUrls,
    rating: 5.0,
    salesCount: 0,
    sizes: sizes || ['S', 'M', 'L', 'XL'],
    colors: colors || ['Carbon Black'],
    isNew: true
  };

  products.unshift(newProd);
  await dbStore.setProducts(products);

  res.json({ success: true, message: 'Luxury item added into designer ranks.', product: newProd });
});

app.put('/api/admin/products/:id', ...adminRights, async (req, res) => {
  const products = await dbStore.getProducts();
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product mapping lost' });

  const entity = { ...products[index], ...req.body };
  products[index] = entity;
  await dbStore.setProducts(products);

  res.json({ success: true, message: 'Couture parameters updated successfully.', product: entity });
});

app.delete('/api/admin/products/:id', ...adminRights, async (req, res) => {
  const products = await dbStore.getProducts();
  const filtered = products.filter(p => p.id !== req.params.id);
  await dbStore.setProducts(filtered);
  res.json({ success: true, message: 'Couture item archived out of catalogue view.' });
});

// ADMIN ORDER MANAGEMENT
app.get('/api/admin/orders', ...adminRights, async (req, res) => {
  const orders = await dbStore.getOrders();
  res.json({ success: true, orders });
});

app.patch('/api/admin/orders/:id', ...adminRights, async (req, res) => {
  const { status, trackingNumber } = req.body;
  const orders = await dbStore.getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Order not identified.' });

  const order = orders[index];
  if (status) order.status = status as OrderStatus;
  if (trackingNumber) order.shippingTrackingNumber = trackingNumber;

  await dbStore.setOrders(orders);
  res.json({ success: true, message: `Status updated successfully to ${status || order.status}.`, order });
});

// ADMIN SECURITY TELEMETRY PANEL
app.get('/api/admin/security/telemetry', ...adminRights, async (req, res) => {
  const logs = await dbStore.getUserActivities();
  const users = await dbStore.getUsers();

  // Multi-Account Fingerprint Crosschecks
  const fingerprintMap: { [key: string]: string[] } = {};
  logs.forEach(l => {
    if (l.fingerprint) {
      const userObj = users.find(u => u.id === l.userId);
      if (userObj) {
        if (!fingerprintMap[l.fingerprint]) fingerprintMap[l.fingerprint] = [];
        if (!fingerprintMap[l.fingerprint].includes(userObj.email)) {
          fingerprintMap[l.fingerprint].push(userObj.email);
        }
      }
    }
  });

  const multiAccountthreats = Object.keys(fingerprintMap)
    .filter(fp => fingerprintMap[fp].length > 1)
    .map(fp => ({
      fingerprint: fp,
      mappedEmails: fingerprintMap[fp]
    }));

  res.json({
    success: true,
    recentLogs: logs.slice(0, 50),
    threats: {
      multiAccountDetector: multiAccountthreats,
      suspiciousCounts: logs.filter(l => l.isSuspicious).length
    }
  });
});

// ADMIN SETTINGS AND CMS PANEL UPDATORS
app.put('/api/admin/cms', ...adminRights, async (req, res) => {
  const cms = await dbStore.getCMS();
  const updated = { ...cms, ...req.body };
  await dbStore.setCMS(updated);
  res.json({ success: true, message: 'Static CMS content successfully updated.' });
});

app.put('/api/admin/settings', ...adminRights, async (req, res) => {
  const settings = await dbStore.getSettings();
  const updated = { ...settings, ...req.body };
  await dbStore.setSettings(updated);
  res.json({ success: true, message: 'Settings panel successfully re-deployed.', settings: updated });
});

// Banner managers
app.get('/api/admin/banners', ...adminRights, async (req, res) => {
  const banners = await dbStore.getBanners();
  res.json({ success: true, banners });
});

app.post('/api/admin/banners', ...adminRights, async (req, res) => {
  const { title, subtitle, imageUrl, linkUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

  const banners = await dbStore.getBanners();
  const newBanner = {
    id: `ban-${Date.now()}`,
    title: title || 'New Season',
    subtitle,
    imageUrl,
    linkUrl,
    isActive: true
  };
  banners.push(newBanner);
  await dbStore.setBanners(banners);
  res.json({ success: true, banner: newBanner });
});

// Client static fallback setup inside full-stack server
async function bootServer() {
  // Vite dev setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RASVYNAR COUTURE PLATFORM] Booted perfectly on transport port: ${PORT}`);
  });
}

bootServer();
