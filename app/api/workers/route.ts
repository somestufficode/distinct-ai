import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db/connection';
import { Worker } from '@/app/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const query: any = {};

    if (projectId) {
      query.projects = projectId;
    }

    const workers = await Worker.find(query)
      .populate('projects')
      .lean();

    return NextResponse.json({ success: true, data: workers });
  } catch (error) {
    console.error('Error in GET /api/workers:', error);
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
    
    const worker = await Worker.create(body);
    const populatedWorker = await worker.populate('projects');
    
    return NextResponse.json(
      { success: true, data: populatedWorker },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/workers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 