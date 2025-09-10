import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const apiBase = process.env.API_BASE_URL!;
    // 1) พยายามเอา bearer จาก header ที่ client ส่งมา (เผื่อเรียกตรง)
    const viaHeader = req.headers.get('authorization');

    // 2) ถ้าไม่มี ให้เอา token จาก NextAuth (ฝั่ง server)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const bearer =
      viaHeader ??
      (token && (token as any).accessToken ? `Bearer ${(token as any).accessToken}` : undefined);

    if (!bearer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const r = await fetch(`${apiBase}/trade/assets`, {
      headers: { accept: 'application/json', authorization: bearer },
      cache: 'no-store',
    });

    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (e) {
    return NextResponse.json({ error: 'proxy failed' }, { status: 500 });
  }
}
