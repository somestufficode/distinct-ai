import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db/connection';
import { WorkItem } from '@/app/lib/db/models';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workItemId } = await context.params;
    await dbConnect();

    if (!Types.ObjectId.isValid(workItemId)) {
      return NextResponse.json(
        { error: 'Invalid work item ID' },
        { status: 400 }
      );
    }

    const workItem = await WorkItem.findById(workItemId)
      .populate('project')
      .populate('workers')
      .lean();

    if (!workItem) {
      return NextResponse.json(
        { error: 'Work item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(workItem);
  } catch (error) {
    console.error('Error in GET /api/work-items/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workItemId } = await context.params;
    await dbConnect();
    const body = await request.json();

    const updatedWorkItem = await WorkItem.findByIdAndUpdate(
      workItemId,
      { $set: body },
      { new: true, runValidators: true }
    ).populate(['project', 'workers']);

    if (!updatedWorkItem) {
      return NextResponse.json(
        { error: 'Work item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedWorkItem);
  } catch (error) {
    console.error('Error in PUT /api/work-items/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workItemId } = await context.params;
    await dbConnect();

    const deletedWorkItem = await WorkItem.findByIdAndDelete(workItemId);

    if (!deletedWorkItem) {
      return NextResponse.json(
        { error: 'Work item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Work item deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/work-items/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
