import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required.' }, { status: 400 });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const rows = await query<{ id: string; username: string; password_hash: string; status: string }[]>(
      'SELECT id, username, password_hash, status FROM admin_users WHERE username = ? LIMIT 1',
      [username]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const admin = rows[0];
    if (admin.status !== 'active' || admin.password_hash !== hash) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: { id: admin.id, username: admin.username } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
