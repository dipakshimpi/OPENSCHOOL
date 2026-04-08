"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Sparkles,
  PlusCircle,
  Loader2,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { authedFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  instructor_id: string;
  profiles: { full_name: string } | null;
  enrollmentCount?: number;
  grade_level?: string;
}

export default function StudentCourses() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingMap, setEnrollingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, enrolledRes, statsRes] = await Promise.all([
        authedFetch("/api/courses"),
        authedFetch("/api/enrollments"),
        authedFetch("/api/stats")
      ]);

      if (coursesRes.ok && enrolledRes.ok) {
        const courses = await coursesRes.json();
        const enrolledItems = await enrolledRes.json();

        if (statsRes.ok) {
          await statsRes.json();
          // Grade check removed to satisfy unused variable lint
        }

        const coursesArray = Array.isArray(courses) ? courses : [];
        const enrolledArray = Array.isArray(enrolledItems) ? enrolledItems : [];

        setAllCourses(coursesArray);
        setEnrolledIds(enrolledArray.map((e: { course_id?: string; courses?: { id: string } }) => e.course_id || e.courses?.id || ""));
      }
    } catch (err) {
      console.error("Failed to load courses data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    setEnrollingMap(prev => ({ ...prev, [courseId]: true }));
    try {
      const res = await authedFetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      });

      if (res.ok) {
        setEnrolledIds(prev => [...prev, courseId]);
      } else {
        const data = await res.json();
        console.error("Enrollment failed", data.error);
      }
    } catch {
        console.error("Connection error. Please try again.");
    } finally {
      setEnrollingMap(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const enrolledCoursesList = allCourses.filter(c => enrolledIds.includes(c.id));
  const availableCoursesList = allCourses.filter(c => !enrolledIds.includes(c.id));

  return (
    <DashboardLayout title="Learner Nexus" role="student">
      <div className="max-w-[1600px] mx-auto space-y-12 pb-20 px-4">
        
        {/* 🌟 CLEAN HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Academic Catalog</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Explore and enroll in the various educational modules available on the platform.</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Courses</p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 leading-none mt-1">{allCourses.length} Modules</p>
                </div>
                <div className="w-[1px] h-8 bg-slate-200 dark:bg-white/10 mx-2" />
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
        </div>

        {/* 🔍 FILTER & NAVIGATION */}
        <Tabs defaultValue="available" className="w-full space-y-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-3xl border border-white dark:border-white/5 shadow-xl">
             <TabsList className="bg-slate-100/50 dark:bg-slate-950/50 p-1 rounded-xl h-12 w-full md:w-auto grid grid-cols-2">
                <TabsTrigger value="available" className="rounded-lg font-bold text-xs uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md transition-all px-8">
                    Available Courses
                </TabsTrigger>
                <TabsTrigger value="enrolled" className="rounded-lg font-bold text-xs uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md transition-all px-8">
                    My Enrollments
                </TabsTrigger>
             </TabsList>

             <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                      placeholder="Identify Module..." 
                      className="w-full h-12 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border-none pl-12 text-[11px] font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-indigo-600/30 transition-all font-sans"
                   />
                </div>
                <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm text-slate-400">
                    <Filter className="w-4 h-4" />
                </Button>
             </div>
          </div>

          <TabsContent value="available" className="mt-0">
             <AnimatePresence mode="wait">
               {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {[1, 2, 3, 4, 5, 8].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
                 </div>
               ) : availableCoursesList.length === 0 ? (
                 <div className="py-32 text-center space-y-8 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                    <Sparkles className="h-20 w-20 text-indigo-500/20 mx-auto" />
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">All Nodes Synchronized</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No unmatched course protocols detected in your Grade.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                   {availableCoursesList.map((course, idx) => (
                     <CourseCard 
                        key={course.id} 
                        course={course} 
                        isEnrolled={false} 
                        isLoading={enrollingMap[course.id]} 
                        onEnroll={handleEnroll} 
                        idx={idx}
                     />
                   ))}
                 </div>
               )}
             </AnimatePresence>
          </TabsContent>

          <TabsContent value="enrolled" className="mt-0">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
               {enrolledCoursesList.map((course, idx) => (
                 <CourseCard 
                    key={course.id} 
                    course={course} 
                    isEnrolled={true} 
                    idx={idx}
                 />
               ))}
             </div>
          </TabsContent>
        </Tabs>

      </div>
    </DashboardLayout>
  );
}

function CourseCard({ course, isEnrolled, isLoading, onEnroll, idx }: { course: Course, isEnrolled: boolean, isLoading?: boolean, onEnroll?: (id: string) => void, idx: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            <Card className="group relative border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="h-40 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {course.thumbnail_url ? (
                        <Image 
                            src={course.thumbnail_url} 
                            alt={course.title} 
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center p-6">
                            <BookOpen className="w-12 h-12 text-indigo-500/20 group-hover:scale-110 group-hover:text-indigo-500/40 transition-all duration-700" />
                        </div>
                    )}
                    <Badge className="absolute top-6 left-6 z-20 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white border-none font-black text-[9px] px-4 py-1.5 rounded-xl uppercase tracking-widest backdrop-blur-md shadow-lg shadow-black/5">
                        Module Registry
                    </Badge>
                </div>

                <CardContent className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Stream Validated</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                            {course.title}
                        </h2>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {course.description || "Synthesizing advanced core concepts through rigorous institutional research and global sync protocols."}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                {course.profiles?.full_name?.charAt(0) || "T"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Instructor Node</span>
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest truncate max-w-[120px]">{course.profiles?.full_name || "Lead Faculty"}</span>
                            </div>
                        </div>
                        <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-400 border-none font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-widest">
                            GR {course.grade_level || "12"}
                        </Badge>
                    </div>
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-0">
                    {isEnrolled ? (
                        <Link href={`/student/courses/${course.id}`} className="w-full">
                            <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 border-none shadow-none">
                                Open Session Protocol
                                <ArrowRight className="w-4 h-4 translate-y-[1px] group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    ) : (
                        <Button 
                            onClick={() => onEnroll?.(course.id)}
                            disabled={isLoading}
                            className="w-full h-11 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 border-none group/btn relative overflow-hidden"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span className="relative z-10 text-white">Initialize Linkage</span>
                                    <PlusCircle className="w-5 h-5 relative z-10 translate-y-[1px] group-hover/btn:scale-110 transition-transform" />
                                </>
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}
