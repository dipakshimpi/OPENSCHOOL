import { NextResponse } from "next/server";

export async function GET() {
  // In the future, you would fetch this data from your database
  const courses = [
    {
      id: "math-g8",
      title: "Mathematics",
      grade: "Grade 8",
      videoCount: 12,
    },
    {
      id: "sci-g7",
      title: "Science",
      grade: "Grade 7",
      videoCount: 8,
    },
    {
      id: "eng-g9",
      title: "English",
      grade: "Grade 9",
      videoCount: 15,
    },
  ];

  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json({ courses });
}