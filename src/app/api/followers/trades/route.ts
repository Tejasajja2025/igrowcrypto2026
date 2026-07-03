import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Followers trades endpoint is active' });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  return NextResponse.json({ message: 'Followers trades POST received', payload });
}
