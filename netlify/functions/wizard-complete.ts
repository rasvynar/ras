import crypto from 'crypto';
import { dbStore } from '../../src/db.js';

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  let payload: any = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const {
    brandName,
    emailAdmin,
    adminName,
    adminPassword,
    phoneBusiness,
    addressBusiness
  } = payload || {};

  if (!brandName || !emailAdmin || !adminPassword || !phoneBusiness || !addressBusiness) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'All configuration parameters are required' })
    };
  }

  // Idempotency: if already installed, do not duplicate admin
  const settings = await dbStore.getSettings();
  if (settings.installationCompleted) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Installation already completed. No changes applied.'
      })
    };
  }

  // Save settings
  settings.brandName = brandName;
  settings.emailAdmin = emailAdmin;
  settings.phoneBusiness = String(phoneBusiness).replace(/^0/, '62');
  settings.addressBusiness = addressBusiness;
  settings.installationCompleted = true;
  await dbStore.setSettings(settings);

  // Create admin account (same semantics as server.ts)
  const users = await dbStore.getUsers();

  const normalizedEmail = String(emailAdmin).toLowerCase();
  const existsAdmin = users.some(
    (u: any) => String(u.email).toLowerCase() === normalizedEmail && (u as any).role === 'SUPER_ADMIN'
  );

  if (!existsAdmin) {
    // In server.ts they store a sha256 hash in (user as any).passwordHash
    const hashPassword = crypto.createHash('sha256').update(String(adminPassword)).digest('hex');

    const newAdmin: any = {
      id: `usr-${Date.now()}`,
      fullName: adminName || 'Principal Director',
      email: normalizedEmail,
      phoneNumber: String(phoneBusiness).replace(/^0/, '62'),
      address: addressBusiness,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
      membershipLevel: 'PLATINUM',
      loyaltyPoints: 500
    };

    (newAdmin as any).passwordHash = hashPassword;

    users.push(newAdmin);
    await dbStore.setUsers(users);
  } else {
    // If admin exists but installation flag was false, just activate settings.
    await dbStore.setUsers(users);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Atelier configured successfully. Admin credentials mapped.'
    })
  };
}

