import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SECRET = process.env.ADMIN_JWT_SECRET || 'fallback-secret';

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
    const { password } = await request.json();

    if (!ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
    }

    // Timing-safe comparison using HMAC (equal-length comparison)
    const encoder = new TextEncoder();
    const keyData = encoder.encode('password-compare');
    const key = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const sigA = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(password || '')));
    const sigB = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(ADMIN_PASSWORD)));

    let diff = 0;
    for (let i = 0; i < sigA.length; i++) {
      diff |= sigA[i] ^ sigB[i];
    }

    if (diff !== 0) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Create signed token
    const exp = Date.now() + 24 * 60 * 60 * 1000; // 24h
    const payload = JSON.stringify({ role: 'admin', exp });
    const signature = await hmacSign(payload);
    const token = btoa(payload) + '.' + signature;

    const response = NextResponse.json({ ok: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
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
