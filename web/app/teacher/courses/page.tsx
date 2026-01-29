"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { Video, BookOpen, Upload } from "lucide-react";

export default function TeacherCourses() {
  return (
    <DashboardLayout title="My Courses" role="teacher">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <PageHeader
          title="Course Management"
          description="Manage course content and videos"
          action={
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </Button>
          }
        />

        {/* COURSES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-100 shadow-sm">
                    <BookOpen className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Mathematics</CardTitle>
                    <p className="text-sm text-gray-600">Grade 8</p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white border-green-700 shadow-sm">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <Video className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  12 videos uploaded
                </span>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full border-2">
                  Manage Content
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-100">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Science</CardTitle>
                    <p className="text-sm text-gray-500">Grade 7</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Video className="h-4 w-4" />
                <span>8 videos uploaded</span>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Manage Content
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-purple-100">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>English</CardTitle>
                    <p className="text-sm text-gray-500">Grade 9</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Video className="h-4 w-4" />
                <span>15 videos uploaded</span>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Manage Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
