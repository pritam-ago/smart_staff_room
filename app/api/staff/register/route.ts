import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, seatCode, department, faceDescriptor } = body;
    if (!name || !seatCode || !faceDescriptor) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Cast to any to avoid mismatches if Prisma client hasn't been regenerated yet.
    const created = await prisma.staff.create({
      data: ({
        name,
        seatCode,
        department,
        faceDescriptor,
        status: 'out',
      } as any),
    } as any);

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to register' }, { status: 500 });
  }
}
