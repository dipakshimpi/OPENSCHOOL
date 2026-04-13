"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail, BookOpen, GraduationCap,
  Briefcase, Award, Phone,
  Edit3, Users, Zap
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
    <DashboardLayout title="Faculty Profile" role="teacher">
      <div className="max-w-[1200px] mx-auto space-y-10 pb-20 px-4">
        
        {/* 🌟 REFINED COMPACT HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
                {profile?.full_name?.charAt(0) || "T"}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-lg border-2 border-white dark:border-slate-950 shadow-md">
                <Award className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{profile?.full_name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Badge className="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 font-bold text-[8px] px-2 py-0.5 rounded-md uppercase tracking-widest">
                  Senior Faculty
                </Badge>
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  {profile?.department || "General Sciences"}
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" className="border-slate-200 dark:border-white/10 h-10 px-5 rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <Edit3 className="w-3.5 h-3.5" />
            Refine Identity
          </Button>
        </div>

        {/* 📊 COMPACT KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-800/50">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Lectures</p>
              <div className="text-xl font-black">{videoCount} <span className="text-[10px] text-slate-400 uppercase ml-1">Sessions</span></div>
            </div>
          </Card>

          <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-800/50">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Student Reach</p>
              <div className="text-xl font-black">450+ <span className="text-[10px] text-emerald-500 uppercase ml-1">Acitve</span></div>
            </div>
          </Card>

          <Card className="border border-slate-200 dark:border-white/5 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 border border-amber-100 dark:border-amber-800/50">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Instruction Score</p>
              <div className="text-xl font-black">4.9 <span className="text-[10px] text-slate-400 uppercase ml-1">Performance</span></div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* FACULTY DOSSIER */}
          <Card className="border border-slate-200 dark:border-white/5 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-600" />
                Professional Dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Institutional Email</h4>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{profile?.email}</p>
                  </div>
                </div>
 
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Mobile Contact</h4>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{profile?.phone_number || "+91 ••••• •••••"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
 
          {/* ACADEMIC PHILOSOPHY */}
          <Card className="border border-slate-200 dark:border-white/5 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                Academic Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-900 dark:text-indigo-400 mb-2">Teaching Objective</h4>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium leading-relaxed italic">
                  &quot;{profile?.bio || "Empowering the next generation innovators."}&quot;
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {["Quantum Physics", "Chemistry"].map((skill) => (
                  <span key={skill} className="text-[9px] font-bold text-slate-600 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-white/5 uppercase tracking-tighter">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
