"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, BookOpen, Play } from "lucide-react";

export default function StudentCourses() {
  return (
    <DashboardLayout title="My Courses" role="student">
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h2 className="text-lg font-semibold">Enrolled Courses</h2>
          <p className="text-sm text-gray-500">
            Access course content and videos
          </p>
        </div>

        {/* COURSES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Mathematics</CardTitle>
                    <p className="text-sm text-gray-500">Grade 8</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Enrolled
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Video className="h-4 w-4" />
                <span>12 videos available</span>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  View Content
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
                  Enrolled
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Video className="h-4 w-4" />
                <span>8 videos available</span>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  View Content
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
                  Enrolled
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Video className="h-4 w-4" />
                <span>15 videos available</span>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  View Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
