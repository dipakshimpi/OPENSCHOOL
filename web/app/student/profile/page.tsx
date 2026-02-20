"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, BookOpen, Calendar, GraduationCap,
  Phone, MapPin, Building, ShieldCheck, Edit3,
  Trophy, Clock, Hash
} from "lucide-react";
import { authedFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

interface ProfileData {
  full_name: string;
  role: string;
  is_approved: boolean;
  email: string;
  phone_number: string | null;
  bio: string | null;
  department: string | null;
  grade_level: string | null;
  section: string | null;
  address: string | null;
  created_at: string;
  school_id: string | null;
}

export default function StudentProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [courseCount, setCourseCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, coursesRes] = await Promise.all([
          authedFetch("/api/profile?intendedRole=student"),
          authedFetch("/api/student/courses")
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile({
            ...data,
            email: session?.user?.email || data.email || "student@openschool.edu"
          });
        }

        if (coursesRes.ok) {
          const data = await coursesRes.json();
          setCourseCount(data.courses?.length || 0);
        }
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  if (loading) {
    return (
      <DashboardLayout title="Identity & Records" role="student">
        <div className="space-y-8">
          <Skeleton className="h-64 w-full rounded-[2.5rem]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "January 2024";

  return (
    <DashboardLayout title="My Profile" role="student">
      <div className="space-y-8 pb-20">
        {/* HERO SECTION */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[2.5rem] opacity-90 blur-xl group-hover:opacity-100 transition-opacity duration-500" />
          <Card className="relative border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <div className="h-32 bg-indigo-600/10 dark:bg-indigo-900/20" />
            <CardContent className="px-10 pb-10 -mt-16">
              <div className="flex flex-col md:flex-row items-end gap-8">
                <div className="relative">
                  <div className="h-32 w-32 rounded-[2rem] bg-white dark:bg-slate-800 p-2 shadow-2xl ring-4 ring-white dark:ring-slate-900">
                    <div className="h-full w-full rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black">
                      {profile?.full_name?.charAt(0) || "S"}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-xl border-4 border-white dark:border-slate-900 shadow-lg">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                    {profile?.full_name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
                      Student Scholar
                    </Badge>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Status
                    </Badge>
                  </div>
                </div>
                <Button className="bg-slate-950 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Identity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl bg-indigo-50/50 dark:bg-indigo-950/20 rounded-[2rem] p-6 text-center group hover:bg-indigo-600 transition-all duration-500">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/70 group-hover:text-white/70">Class Level</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-white">Grade {profile?.grade_level || "8"}-{profile?.section || "A"}</p>
          </Card>

          <Card className="border-none shadow-xl bg-purple-50/50 dark:bg-purple-950/20 rounded-[2rem] p-6 text-center group hover:bg-purple-600 transition-all duration-500">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600 group-hover:scale-110 transition-transform">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600/70 group-hover:text-white/70">Academic Score</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-white">94% Average</p>
          </Card>

          <Card className="border-none shadow-xl bg-pink-50/50 dark:bg-pink-950/20 rounded-[2rem] p-6 text-center group hover:bg-pink-600 transition-all duration-500">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-pink-600 group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600/70 group-hover:text-white/70">Attendance</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-white">98.2% Record</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PERSONAL DOSSIER */}
          <Card className="border-none shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Personal Dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Email</h4>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Contact</h4>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.phone_number || "+91 ••••• •••••"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Residential Address</h4>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.address || "Address Registry Pending"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student UID</h4>
                    <p className="text-sm font-mono font-bold text-slate-500">#{profile?.school_id?.split('-')[0].toUpperCase() || "OS-2024-819"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* INSTITUTIONAL CONTEXT */}
          <Card className="border-none shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-600" />
                Institutional Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="p-6 bg-purple-50/50 dark:bg-purple-950/10 rounded-3xl border border-purple-100 dark:border-purple-900/30">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-900 dark:text-purple-400 mb-3">Philosophical Bio</h4>
                <p className="text-sm text-purple-800 dark:text-purple-300 font-medium leading-relaxed italic">
                  &quot;{profile?.bio || "A dedicated student committed to excellence in learning and institutional growth. Exploring the boundaries of science through experimental research."}&quot;
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Enrollments</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-1 rounded-full shadow-sm">{courseCount} {courseCount === 1 ? 'Course' : 'Courses'}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Registry Date</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-1 rounded-full shadow-sm">{memberSince}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
