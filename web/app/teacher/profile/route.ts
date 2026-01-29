import { NextResponse } from "next/server";

export async function GET() {
  // In a real app, you'd get the user ID from the session and query the database
  const profile = {
    fullName: "John Doe",
    role: "Mathematics Teacher",
    status: "Active",
    email: "john.doe@school.com",
    assignedCourses: 4,
    memberSince: "January 2024",
    teacherId: "TCH-2024-001",
  };

  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(profile);
}