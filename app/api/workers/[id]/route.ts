import { NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db/connection';
import { Worker } from '@/app/lib/db/models';
import { errorResponse, notFoundResponse, successResponse } from '@/app/lib/api-utils';
import { IEvent } from '@/app/lib/db/models/Event';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;
    
    const worker = await Worker.findById(id)
      .populate('user', 'name email')
      .populate('projects', 'name status');
    
    if (!worker) {
      return notFoundResponse('Worker not found');
    }
    
    return successResponse(worker);
  } catch (error) {
    return errorResponse(`Failed to fetch worker ${params.id}`, 500, error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();
    
    const updatedWorker = await Worker.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedWorker) {
      return notFoundResponse('Worker not found');
    }
    
    return successResponse(updatedWorker, 'Worker updated successfully');
  } catch (error) {
    return errorResponse(`Failed to update worker ${params.id}`, 500, error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;
    
    const deletedWorker = await Worker.findByIdAndDelete(id);
    
    if (!deletedWorker) {
      return notFoundResponse('Worker not found');
    }
    
    return successResponse(null, 'Worker deleted successfully');
  } catch (error) {
    return errorResponse(`Failed to delete worker ${params.id}`, 500, error);
  }
} 