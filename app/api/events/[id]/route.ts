import { NextRequest, NextResponse } from 'next/server';
import { Event } from '@/app/lib/db/models';
import connectToDatabase from '@/app/lib/db/connection';
import { Types } from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  const event = await Event.findById(params.id)
    .populate('project')
    .populate('workers');

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(event);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  const body = await request.json();

  if (body.start) {
    body.start = new Date(body.start);
  }
  if (body.end) {
    body.end = new Date(body.end);
  }

  if (body.workers && !Array.isArray(body.workers)) {
    body.workers = [body.workers];
  }

  if (body.workers) {
    body.workers = body.workers.map((workerId: string) => new Types.ObjectId(workerId));
  }

  const event = await Event.findByIdAndUpdate(
    params.id,
    { $set: body },
    { new: true }
  )
    .populate('project')
    .populate('workers');

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(event);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  const event = await Event.findByIdAndDelete(params.id);

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: 'Event deleted successfully' });
} 