"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, BookOpen, GraduationCap,
  Phone, MapPin, Building, ShieldCheck, Edit3,
  Trophy, Clock
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
        <div className="space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout title="My Profile" role="student">
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        {/* HERO SECTION */}
        <div className="relative">
          <Card className="relative border border-slate-200 dark:border-white/5 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5" />
            <CardContent className="px-6 pb-6 -mt-12">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-2xl bg-white dark:bg-slate-800 p-1.5 shadow-xl ring-2 ring-slate-100 dark:ring-slate-800">
                    <div className="h-full w-full rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {profile?.full_name?.charAt(0) || "S"}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 rounded-lg border-2 border-white dark:border-slate-900 shadow-md">
                    <ShieldCheck className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {profile?.full_name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Student Scholar
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider gap-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      Active Status
                    </Badge>
                  </div>
                </div>
                <Button className="bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold uppercase text-[9px] tracking-widest px-6 h-10 rounded-xl shadow-lg shadow-indigo-500/5 backdrop-blur-md transition-all active:scale-95 flex items-center gap-2">
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Identity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl p-4 text-center group hover:bg-indigo-600 transition-all duration-300">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 text-indigo-600 group-hover:bg-white transition-all">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white/70">Class Level</h3>
            <p className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-white">Grade {profile?.grade_level || "8"}-{profile?.section || "A"}</p>
          </Card>
 
          <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl p-4 text-center group hover:bg-purple-600 transition-all duration-300">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 text-purple-600 group-hover:bg-white transition-all">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white/70">Academic Score</h3>
            <p className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-white">94% Average</p>
          </Card>
 
          <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl p-4 text-center group hover:bg-pink-600 transition-all duration-300">
            <div className="w-10 h-10 bg-pink-50 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 text-pink-600 group-hover:bg-white transition-all">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white/70">Attendance</h3>
            <p className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-white">98.2% Record</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PERSONAL DOSSIER */}
          <Card className="border border-slate-200 dark:border-white/5 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                Personal Dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Verified Email</h4>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{profile?.email}</p>
                  </div>
                </div>
 
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Mobile Contact</h4>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{profile?.phone_number || "+91 ••••• •••••"}</p>
                  </div>
                </div>
 
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Residential Address</h4>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{profile?.address || "Address Registry Pending"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
 
          {/* INSTITUTIONAL CONTEXT */}
          <Card className="border border-slate-200 dark:border-white/5 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-600" />
                Institutional Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-purple-900 dark:text-purple-400 mb-2">Philosophical Bio</h4>
                <p className="text-xs text-purple-800 dark:text-purple-300 font-medium leading-relaxed italic">
                  &quot;{profile?.bio || "A dedicated student committed to excellence in learning."}&quot;
                </p>
              </div>
 
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Core Enrollments</span>
                </div>
                <span className="text-[10px] font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-1 rounded-full">{courseCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
