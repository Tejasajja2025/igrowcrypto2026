import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const contentTable = 'site_content';

async function ensureContentTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS ${contentTable} (
      id VARCHAR(50) PRIMARY KEY,
      json_data LONGTEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

function parseJsonData(value: any) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

export async function GET() {
  try {
    await ensureContentTable();
    const rows = await query(`SELECT json_data FROM ${contentTable} WHERE id = ? LIMIT 1`, ['site']);
    const content = rows.length ? parseJsonData(rows[0].json_data) : null;
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid content payload.' }, { status: 400 });
  }

  try {
    await ensureContentTable();
    await query(`
      INSERT INTO ${contentTable} (id, json_data)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE json_data = VALUES(json_data)
    `, ['site', JSON.stringify(payload)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Content save error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
