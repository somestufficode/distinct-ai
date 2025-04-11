import { NextRequest, NextResponse } from 'next/server';
import { WorkItem } from '@/app/lib/db/models';
import dbConnect from '@/app/lib/db/connection';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const workerId = searchParams.get('workerId');
    const query: any = {};

    if (projectId) {
      query.project = projectId;
    }
    if (workerId) {
      query.workers = workerId;
    }

    const workItems = await WorkItem.find(query)
      .populate('project')
      .populate('workers')
      .lean();

    return NextResponse.json({ success: true, data: workItems });
  } catch (error) {
    console.error('Error in GET /api/work-items:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const workItem = await WorkItem.create(body);
    const populatedWorkItem = await workItem
      .populate(['project', 'workers']);
    
    return NextResponse.json(
      { success: true, data: populatedWorkItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/work-items:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 