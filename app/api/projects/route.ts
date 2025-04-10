import { NextRequest, NextResponse } from 'next/server';
import { Project } from '@/app/lib/db/models';
import dbConnect from '@/app/lib/db/connection';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (ownerId) {
      query.owner = new Types.ObjectId(ownerId);
    }

    const projects = await Project.find(query)
      .populate('owner')
      .sort({ startDate: 1 });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
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

    if (!body.name || !body.description || !body.startDate || !body.endDate || !body.budget || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    body.owner = "6507ef235b44a60a65899312";

    if (body.startDate) {
      body.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      body.endDate = new Date(body.endDate);
    }

    if (typeof body.budget === 'string') {
      body.budget = parseFloat(body.budget);
    }

    const project = await Project.create(body);
    const populatedProject = await Project.findById(project._id)
      .populate('owner');

    return NextResponse.json(populatedProject);
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 