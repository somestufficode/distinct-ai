import { NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db/connection';
import { WorkItem } from '@/app/lib/db/models';
import { errorResponse, notFoundResponse, successResponse } from '@/app/lib/api-utils';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;
    
    const workItem = await WorkItem.findById(id).populate('project', 'name');
    
    if (!workItem) {
      return notFoundResponse('Work item not found');
    }
    
    return successResponse(workItem);
  } catch (error) {
    return errorResponse(`Failed to fetch work item ${params.id}`, 500, error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();
    
    const updatedWorkItem = await WorkItem.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('project', 'name');
    
    if (!updatedWorkItem) {
      return notFoundResponse('Work item not found');
    }
    
    return successResponse(updatedWorkItem, 'Work item updated successfully');
  } catch (error) {
    return errorResponse(`Failed to update work item ${params.id}`, 500, error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;
    
    const deletedWorkItem = await WorkItem.findByIdAndDelete(id);
    
    if (!deletedWorkItem) {
      return notFoundResponse('Work item not found');
    }
    
    return successResponse(null, 'Work item deleted successfully');
  } catch (error) {
    return errorResponse(`Failed to delete work item ${params.id}`, 500, error);
  }
} 