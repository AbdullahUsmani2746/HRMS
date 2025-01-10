import connectDB from '@/utils/dbConnect';
import Allownce from '@/models/Employee/allownces.models';
import Deduction from '@/models/Employee/deduction.models';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();

    // Get query parameters (allowances, deductions, or both)
    const { searchParams } = new URL(request.url);
    const allowances = searchParams.get('allowances');
    const deductions = searchParams.get('deductions');

    // Initialize response data object
    let responseData = {};

    // Fetch allowances if the 'allowances' query parameter exists
    if (allowances) {
      const allowanceIds = allowances.split(','); // Split the comma-separated IDs
      const allowncesData = await Allownce.find({ _id: { $in: allowanceIds } });
      responseData.allowances = allowncesData;
    }

    // Fetch deductions if the 'deductions' query parameter exists
    if (deductions) {
      const deductionIds = deductions.split(','); // Split the comma-separated IDs
      const deductionsData = await Deduction.find({ _id: { $in: deductionIds } });
      responseData.deductions = deductionsData;
    }

    // If neither allowances nor deductions are specified, fetch both
    if (!allowances && !deductions) {
      const allowncesData = await Allownce.find();
      const deductionsData = await Deduction.find();
      responseData = {
        allowances: allowncesData,
        deductions: deductionsData,
      };
    }

    // Return the data as a JSON response
    return NextResponse.json({ success: true, data: responseData }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
