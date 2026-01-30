"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Users } from "lucide-react";

export default function TeacherAttendance() {
  return (
    <DashboardLayout title="Mark Attendance" role="teacher">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h2 className="text-lg font-semibold">Attendance Marking</h2>
          <p className="text-sm text-gray-500">
            Mark attendance for your current class session
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mathematics – Grade 8</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Today, 9:00 AM – 9:45 AM
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Active Session
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Location Status */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Location Verified</p>
                <p className="text-sm text-green-700">
                  Your location has been verified and you can mark attendance
                </p>
              </div>
            </div>

            {/* Student List */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">
                  Student List (30 students)
                </p>
              </div>
              <div className="space-y-2">
                {[
                  "Ravi Kumar",
                  "Priya Sharma",
                  "Amit Patel",
                  "Sneha Reddy",
                  "Vikram Singh",
                ].map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-md border p-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">{name}</span>
                    <Switch defaultChecked={true} />
                  </div>
                ))}
                <div className="text-center py-2 text-sm text-gray-500">
                  ... and 25 more students
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border">
              <div>
                <p className="text-sm text-gray-500">Total Present</p>
                <p className="text-2xl font-semibold">28 / 30</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-semibold">93%</p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button className="flex-1">Submit Attendance</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
