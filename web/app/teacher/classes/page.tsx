"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Users } from "lucide-react";

export default function TeacherClasses() {
  return (
    <DashboardLayout title="My Classes" role="teacher">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h2 className="text-lg font-semibold">Class Schedule</h2>
          <p className="text-sm text-gray-500">
            Manage your class periods and sessions
          </p>
        </div>

        {/* CLASSES LIST */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
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
                        <Users className="h-4 w-4" />
                        30 students
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Active
                  </Badge>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
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
                        <Users className="h-4 w-4" />
                        28 students
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Scheduled</Badge>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
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
                        <Users className="h-4 w-4" />
                        32 students
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Active
                  </Badge>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
