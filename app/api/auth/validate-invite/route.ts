import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // In a real app, you would validate the token against your database
    // This is a simplified example
    const isValid = true; // Replace with actual validation logic

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // In a real app, you would fetch the user/invitation data from your database
    const mockInviteData = {
      fullName: 'John Doe', // Replace with actual data
      email: 'john@example.com', // Replace with actual data
      role: 'employee', // Replace with actual data
      companyName: 'Acme Inc.' // Replace with actual data
    };

    return NextResponse.json(mockInviteData);
  } catch (error) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
