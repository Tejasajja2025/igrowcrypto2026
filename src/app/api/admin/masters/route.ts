import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query('SELECT id, name, host, port, api_key AS apiKey, description, active, created_at AS createdAt, updated_at AS updatedAt FROM master_servers ORDER BY id DESC');
    return NextResponse.json({ success: true, masters: rows });
  } catch (error) {
    console.error('Masters GET error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const host = String(body.host || '').trim();
    const port = Number(body.port || 0);
    const apiKey = body.apiKey ? String(body.apiKey) : null;
    const description = body.description ? String(body.description) : null;

    if (!name || !host) {
      return NextResponse.json({ success: false, error: 'name and host are required.' }, { status: 400 });
    }

    const result = await query('INSERT INTO master_servers (name, host, port, api_key, description, active) VALUES (?, ?, ?, ?, ?, 1)', [name, host, port, apiKey, description]);

    // mysql2 returns insertion metadata as result; fetch the inserted id if possible
    const insertedId = (result as any)?.insertId || null;

    const inserted = await query('SELECT id, name, host, port, api_key AS apiKey, description, active, created_at AS createdAt, updated_at AS updatedAt FROM master_servers WHERE id = ? LIMIT 1', [insertedId]);

    return NextResponse.json({ success: true, master: (inserted && inserted[0]) || null });
  } catch (error) {
    console.error('Masters POST error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
