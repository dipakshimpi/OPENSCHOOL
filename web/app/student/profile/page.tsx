"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, BookOpen, Calendar, GraduationCap } from "lucide-react";

export default function StudentProfile() {
  return (
    <DashboardLayout title="Profile" role="student">
      <div className="space-y-6">
        {/* PROFILE CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Jane Doe</h3>
                  <p className="text-sm text-gray-500">Grade 8 Student</p>
                  <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">jane.doe@school.com</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <GraduationCap className="h-4 w-4" />
                    <span>Grade</span>
                  </div>
                  <p className="font-medium">Grade 8</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen className="h-4 w-4" />
                    <span>Enrolled Courses</span>
                  </div>
                  <p className="font-medium">6 courses</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Member Since</span>
                  </div>
                  <p className="font-medium">January 2024</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline">Edit Profile</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
