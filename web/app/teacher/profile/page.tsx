"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, BookOpen, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileData {
  fullName: string;
  role: string;
  status: string;
  email: string;
  assignedCourses: number;
  memberSince: string;
  teacherId: string;
}

export default function TeacherProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/teacher/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile data.");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Profile" role="teacher">
      <div className="space-y-6">
        {/* PROFILE CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher Information</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error || !profile ? (
              <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg">
                <p>Error: {error || "Profile data not found."}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{profile.fullName}</h3>
                    <p className="text-sm text-gray-500">{profile.role}</p>
                    <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                      {profile.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium">{profile.email}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BookOpen className="h-4 w-4" />
                      <span>Assigned Courses</span>
                    </div>
                    <p className="font-medium">{profile.assignedCourses} courses</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Member Since</span>
                    </div>
                    <p className="font-medium">{profile.memberSince}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>Teacher ID</span>
                    </div>
                    <p className="font-medium">{profile.teacherId}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline">Edit Profile</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
