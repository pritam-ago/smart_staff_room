import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

function euclidean(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    s += d * d;
  }
  return Math.sqrt(s);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { descriptor } = body;
    if (!descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json({ error: 'Missing descriptor' }, { status: 400 });
    }

  // fetch all and filter in JS to avoid type mismatch until prisma client regenerated
  const allRaw = await prisma.staff.findMany();
  const all = allRaw.filter((s: any) => s.faceDescriptor != null);
    let best: any = null;
    let bestDist = Infinity;
    for (const s of all) {
      try {
  const stored = (s as any).faceDescriptor as any;
        if (!stored) continue;
        const dist = euclidean(descriptor as number[], stored as number[]);
        if (dist < bestDist) {
          bestDist = dist;
          best = s;
        }
      } catch (e) {
        // skip malformed
      }
    }

    // threshold (tunable)
    const THRESHOLD = 0.6;
    if (best && bestDist <= THRESHOLD) {
      return NextResponse.json({ match: best, distance: bestDist });
    }

    return NextResponse.json({ match: null, distance: bestDist });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Recognition failed' }, { status: 500 });
  }
}
