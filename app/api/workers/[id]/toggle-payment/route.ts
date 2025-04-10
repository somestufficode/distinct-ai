import { NextRequest, NextResponse } from 'next/server';
import { Worker } from '@/app/lib/db/models';
import connectToDatabase from '@/app/lib/db/connection';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  const worker = await Worker.findById(params.id);

  if (!worker) {
    return NextResponse.json(
      { error: 'Worker not found' },
      { status: 404 }
    );
  }

  worker.isPaid = !worker.isPaid;
  await worker.save();

  return NextResponse.json(worker);
} 