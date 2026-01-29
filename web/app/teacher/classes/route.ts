import { NextResponse } from "next/server";

export async function GET() {
  const classes = [
    {
      id: "1",
      title: "Mathematics – Grade 8",
      schedule: "Mon, Wed, Fri",
      time: "9:00 AM – 9:45 AM",
      studentCount: 30,
      status: "Active",
    },
    {
      id: "2",
      title: "Science – Grade 7",
      schedule: "Tue, Thu",
      time: "10:00 AM – 10:45 AM",
      studentCount: 28,
      status: "Scheduled",
    },
    {
      id: "3",
      title: "English – Grade 9",
      schedule: "Mon, Wed, Fri",
      time: "2:00 PM – 2:45 PM",
      studentCount: 32,
      status: "Active",
    },
  ];

  return NextResponse.json({ classes });
}