import { NextRequest, NextResponse } from 'next/server';
import { WorkItem } from '@/app/lib/db/models';
import dbConnect from '@/app/lib/db/connection';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const workerId = searchParams.get('workerId');

    const query: any = {};

    if (projectId) {
      query.project = new Types.ObjectId(projectId);
    }

    if (workerId) {
      query.worker = new Types.ObjectId(workerId);
    }

    const workItems = await WorkItem.find(query)
      .populate('project')
      .sort({ dateAdded: -1 });

    return NextResponse.json(workItems);
  } catch (error) {
    console.error('Error in GET /api/work-items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    if (!body.project || !body.item || !body.type || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const workItem = await WorkItem.create(body);
    const populatedWorkItem = await WorkItem.findById(workItem._id)
      .populate('project');

    return NextResponse.json(populatedWorkItem);
  } catch (error) {
    console.error('Error in POST /api/work-items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 