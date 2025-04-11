import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db/connection';
import { Worker } from '@/app/lib/db/models';
import { Types } from 'mongoose';

export async function GET(
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

    const worker = await Worker.findById(id)
      .populate('projects')
      .lean();

    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: worker });
  } catch (error) {
    console.error('Error in GET /api/workers/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await request.json();
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid worker ID' },
        { status: 400 }
      );
    }

    const updatedWorker = await Worker.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('projects');
    
    if (!updatedWorker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedWorker });
  } catch (error) {
    console.error('Error in PUT /api/workers/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const deletedWorker = await Worker.findByIdAndDelete(id);
    
    if (!deletedWorker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/workers/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 