import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db/connection';
import { Worker } from '@/app/lib/db/models';
import { Types } from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid worker ID' },
        { status: 400 }
      );
    }

    const worker = await Worker.findById(id);
    
    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    worker.isPaid = !worker.isPaid;
    await worker.save();
    
    const updatedWorker = await Worker.findById(id)
      .populate('projects')
      .lean();
    
    return NextResponse.json({ success: true, data: updatedWorker });
  } catch (error) {
    console.error('Error in PUT /api/workers/[id]/toggle-payment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 