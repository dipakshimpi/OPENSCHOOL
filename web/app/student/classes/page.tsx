"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Users, User } from "lucide-react";

export default function StudentClasses() {
  return (
    <DashboardLayout title="My Classes" role="student">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h2 className="text-lg font-semibold">Class Schedule</h2>
          <p className="text-sm text-gray-500">
            View your enrolled classes and schedule
          </p>
        </div>

        {/* CLASSES LIST */}
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Mathematics – Grade 8</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Mon, Wed, Fri
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        9:00 AM – 9:45 AM
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Mr. Sharma
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-md bg-blue-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Science – Grade 7</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Tue, Thu
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        10:00 AM – 10:45 AM
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Ms. Patel
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-md bg-purple-100">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">English – Grade 9</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Mon, Wed, Fri
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        2:00 PM – 2:45 PM
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Mrs. Kumar
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
