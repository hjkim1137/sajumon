import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
function getSecret(): string {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error('ADMIN_JWT_SECRET environment variable is not set');
  return s;
}
const SECRET = getSecret();

async function hmacSign(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function hmacVerify(payload: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(payload);
  if (expected.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Timing-safe comparison using HMAC (equal-length comparison)
    const encoder = new TextEncoder();
    const keyData = encoder.encode('credential-compare');
    const key = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );

    // Verify email (timing-safe)
    const emailSigA = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode((email || '').toLowerCase())));
    const emailSigB = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(ADMIN_EMAIL.toLowerCase())));
    let emailDiff = 0;
    for (let i = 0; i < emailSigA.length; i++) {
      emailDiff |= emailSigA[i] ^ emailSigB[i];
    }

    // Verify password (timing-safe)
    const pwSigA = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(password || '')));
    const pwSigB = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(ADMIN_PASSWORD)));
    let pwDiff = 0;
    for (let i = 0; i < pwSigA.length; i++) {
      pwDiff |= pwSigA[i] ^ pwSigB[i];
    }

    // Both must match - always check both to prevent user enumeration
    if (emailDiff !== 0 || pwDiff !== 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create signed token
    const exp = Date.now() + 2 * 60 * 60 * 1000; // 2h
    const payload = JSON.stringify({ role: 'admin', exp });
    const signature = await hmacSign(payload);
    const token = btoa(payload) + '.' + signature;

    const response = NextResponse.json({ ok: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7200,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Verify admin token - exported for reuse
export async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;

  const dotIndex = token.indexOf('.');
  if (dotIndex === -1) return false;

  try {
    const payloadB64 = token.substring(0, dotIndex);
    const signature = token.substring(dotIndex + 1);
    const payload = atob(payloadB64);

    const valid = await hmacVerify(payload, signature);
    if (!valid) return false;

    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return false;
    if (data.role !== 'admin') return false;

    return true;
  } catch {
    return false;
  }
}
