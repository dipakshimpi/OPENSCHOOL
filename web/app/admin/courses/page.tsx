"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { 
  BookOpen, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Clock, 
  MoreVertical, 
  Users, 
  Plus,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  created_at: string;
  thumbnail_url?: string;
  profiles: {
    full_name: string;
  } | null;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <DashboardLayout title="Academic Catalog" role="admin">
      <div className="max-w-[1600px] mx-auto space-y-12 pb-20 px-4">
        
        {/* 🌟 CLEAN HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Course Management</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Create, edit, and organize educational content across the platform.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-slate-100/50 dark:bg-slate-950/50 p-1 rounded-lg border border-slate-200 dark:border-white/5">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setView("grid")}
                        className={cn("h-8 w-8 rounded-md transition-all", view === "grid" ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600" : "text-slate-400")}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setView("list")}
                        className={cn("h-8 w-8 rounded-md transition-all", view === "list" ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600" : "text-slate-400")}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
                <Link href="/admin/courses/create">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 h-10 px-4 rounded-lg font-semibold text-sm gap-2 shadow-md transition-all active:scale-95 text-white">
                    <Plus className="h-4 w-4" />
                    Add New Course
                  </Button>
                </Link>
            </div>
        </div>

        {/* 🔍 FILTER & SEARCH BAR */}
        <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-4 flex flex-col md:flex-row items-center gap-4 border border-white dark:border-white/5">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input 
                    placeholder="Identify Module by Title or Instructor..." 
                    className="w-full h-12 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border-none pl-12 text-[11px] font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-indigo-600/30 transition-all outline-none"
                />
            </div>
            <Button variant="ghost" className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 text-slate-500">
                <Filter className="w-4 h-4" />
                Filter Protocols
            </Button>
        </Card>

        {/* 📚 COURSE GRID/LIST */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-80 rounded-[2.5rem]" />)}
            </div>
          ) : courses.length > 0 ? (
            <motion.div 
               key={view}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.4 }}
               className={cn(
                 "grid gap-8",
                 view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
               )}
            >
              {courses.map((course) => (
                <Card 
                  key={course.id} 
                  className="group border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Thumbnail / Header */}
                  <div className="h-36 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {course.thumbnail_url ? (
                        <Image 
                            src={course.thumbnail_url} 
                            alt={course.title} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-110" 
                            unoptimized 
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center relative">
                            <BookOpen className="w-12 h-12 text-indigo-500/20" />
                        </div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white border-none font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-md shadow-sm">
                        Course
                    </Badge>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight tracking-tight truncate">
                        {course.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                             <Users className="w-3.5 h-3.5 text-slate-400" />
                             <span className="text-[10px] font-bold text-slate-500 truncate">{course.profiles?.full_name || "Faculty"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Zap className="w-3.5 h-3.5 text-slate-400" />
                             <span className="text-[10px] font-bold text-slate-500">Universal</span>
                        </div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-6 pb-6 pt-0 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400 mt-2">
                            <Clock className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">{new Date(course.created_at).toLocaleDateString()}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="mt-4 h-8 w-8 rounded-full text-slate-400 hover:text-indigo-600">
                             <MoreVertical className="w-4 h-4" />
                        </Button>
                  </CardFooter>
                </Card>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5">
               <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No educational modules synchronized.</p>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
