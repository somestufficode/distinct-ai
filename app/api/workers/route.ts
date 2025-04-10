import { NextRequest, NextResponse } from 'next/server';
import  dbConnect from '@/app/lib/db/connection';
import { Worker } from '@/app/lib/db/models';
import { errorResponse, successResponse, validationErrorResponse } from '@/app/lib/api-utils';

export async function GET() {
  try {
    await dbConnect();
    const workers = await Worker.find({}).sort({ createdAt: -1 });
    return successResponse(workers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    return errorResponse('Failed to fetch workers', 500, error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();
    
    const worker = await Worker.create(body);
    return successResponse(worker, 'Worker created successfully', 201);
  } catch (error) {
    console.error('Error creating worker:', error);
    return errorResponse('Failed to create worker', 500, error);
  }
} 