"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail, BookOpen, Calendar,
  Briefcase, Award, GraduationCap, Phone,
  MapPin, Edit3, Users, Zap
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
  address: string | null;
  created_at: string;
  school_id: string | null;
}

export default function TeacherProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [videoCount, setVideoCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, videoRes] = await Promise.all([
          authedFetch("/api/profile?intendedRole=teacher"),
          authedFetch("/api/videos")
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile({
            ...data,
            email: session?.user?.email || data.email || "teacher@openschool.edu"
          });
        }

        if (videoRes.ok) {
          const data = await videoRes.json();
          setVideoCount(data?.length || 0);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  if (loading) {
    return (
      <DashboardLayout title="Faculty Records" role="teacher">
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
    <DashboardLayout title="Faculty Profile" role="teacher">
      <div className="space-y-8 pb-20">
        {/* HERO SECTION */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-[2.5rem] opacity-90 blur-xl group-hover:opacity-100 transition-opacity duration-500" />
          <Card className="relative border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <div className="h-32 bg-emerald-600/10 dark:bg-emerald-900/20" />
            <CardContent className="px-10 pb-10 -mt-16">
              <div className="flex flex-col md:flex-row items-end gap-8">
                <div className="relative">
                  <div className="h-32 w-32 rounded-[2rem] bg-white dark:bg-slate-800 p-2 shadow-2xl ring-4 ring-white dark:ring-slate-900">
                    <div className="h-full w-full rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl font-black">
                      {profile?.full_name?.charAt(0) || "T"}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-indigo-500 rounded-xl border-4 border-white dark:border-slate-900 shadow-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                    {profile?.full_name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
                      Senior Faculty
                    </Badge>
                    <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest gap-1">
                      {profile?.department || "Department of Science"}
                    </Badge>
                  </div>
                </div>
                <Button className="bg-slate-950 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Refine Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl bg-emerald-50/50 dark:bg-emerald-950/20 rounded-[2rem] p-6 text-center group hover:bg-emerald-600 transition-all duration-500">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/70 group-hover:text-white/70">Lectures</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-white">{videoCount} {videoCount === 1 ? 'Lecture' : 'Lectures'}</p>
          </Card>

          <Card className="border-none shadow-xl bg-indigo-50/50 dark:bg-indigo-950/20 rounded-[2rem] p-6 text-center group hover:bg-indigo-600 transition-all duration-500">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/70 group-hover:text-white/70">Students</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-white">450+ Enrolled</p>
          </Card>

          <Card className="border-none shadow-xl bg-amber-50/50 dark:bg-amber-950/20 rounded-[2rem] p-6 text-center group hover:bg-amber-600 transition-all duration-500">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/70 group-hover:text-white/70">Rating</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-white">4.9 / 5.0</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* FACULTY DOSSIER */}
          <Card className="border-none shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                Professional Dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Email</h4>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Contact</h4>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.phone_number || "+91 ••••• •••••"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Office Location</h4>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.address || "Admin Block, Sector 4"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tenure Since</h4>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{memberSince}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ACADEMIC PHILOSOPHY */}
          <Card className="border-none shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                Academic Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="p-6 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-900 dark:text-indigo-400 mb-3">Teaching Objective</h4>
                <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium leading-relaxed italic">
                  &quot;{profile?.bio || "Empowering the next generation of innovators through rigorous academic inquiry and practical application of scientific principles."}&quot;
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {["Quantum Physics", "Organic Chemistry", "Material Science"].map((skill) => (
                    <span key={skill} className="text-[10px] font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 uppercase tracking-tighter">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
