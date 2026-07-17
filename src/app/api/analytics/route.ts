import { NextRequest, NextResponse } from "next/server";

const events: unknown[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    events.push({ ...body, receivedAt: new Date().toISOString() });

    // Keep last 1000 events in memory (MVP; replace with DB/analytics provider in prod)
    if (events.length > 1000) events.shift();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    count: events.length,
    recent: events.slice(-20),
  });
}
