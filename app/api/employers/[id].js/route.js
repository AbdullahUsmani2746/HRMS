// pages/api/employers/[id].js

import { NextResponse } from 'next/server';
import connectDB from '@/app/utils/dbConnect';
import Employer from '@/app/models/employer.models';

export async function DELETE(request) {
  await connectDB();
  try {
    const { id } = request.query; // Extract ID from query parameters

    const deletedEmployer = await Employer.findByIdAndDelete(id);
    if (!deletedEmployer) {
      return NextResponse.json({ message: 'Employer not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Employer deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting employer:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
