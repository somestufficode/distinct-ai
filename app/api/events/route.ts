import { NextRequest, NextResponse } from 'next/server';
import { Event } from '@/app/lib/db/models';
import connectToDatabase from '@/app/lib/db/connection';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  await connectToDatabase();

  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const workType = searchParams.get('workType');
  const workerId = searchParams.get('workerId');

  const query: any = {};

  if (projectId) {
    query.project = new Types.ObjectId(projectId);
  }

  if (startDate && endDate) {
    query.start = { $gte: new Date(startDate) };
    query.end = { $lte: new Date(endDate) };
  }

  if (workType) {
    query.workType = workType;
  }

  if (workerId) {
    query.workers = new Types.ObjectId(workerId);
  }

  const events = await Event.find(query)
    .populate('project')
    .populate('workers')
    .sort({ start: 1 });

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  await connectToDatabase();

  const body = await request.json();

  if (!body.title || !body.start || !body.end || !body.project || !body.location || !body.workers || !body.workType) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const start = new Date(body.start);
  const end = new Date(body.end);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date format' },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.workers)) {
    body.workers = [body.workers];
  }

  body.workers = body.workers.map((workerId: string) => new Types.ObjectId(workerId));

  const event = await Event.create(body);
  const populatedEvent = await Event.findById(event._id)
    .populate('project')
    .populate('workers');

  return NextResponse.json(populatedEvent);
} 