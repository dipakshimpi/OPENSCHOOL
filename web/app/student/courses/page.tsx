"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  Loader2,
  ArrowRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { authedFetch } from "@/lib/api";
import { motion } from "framer-motion";
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
  const [userGrade, setUserGrade] = useState<string | null>(null);

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
        const enrolled = await enrolledRes.json();

        let userGrade = null;
        if (statsRes.ok) {
          const stats = await statsRes.json();
          userGrade = stats.gradeLevel;
          setUserGrade(userGrade);
        }

        // Ensure courses is an array
        const coursesArray = Array.isArray(courses) ? courses : [];
        const enrolledArray = Array.isArray(enrolled) ? enrolled : [];

        setAllCourses(coursesArray);
        setEnrolledIds(enrolledArray.map((e: { course_id: string }) => e.course_id));
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
        alert("Welcome to the course! You can now start learning.");
      } else {
        const data = await res.json();
        alert(data.error || "Enrollment failed.");
      }
    } catch {
      alert("Connection error. Please try again.");
    } finally {
      setEnrollingMap(prev => ({ ...prev, [courseId]: false }));
    }
  };


  // Ensure we always have arrays to work with
  const safeAllCourses = Array.isArray(allCourses) ? allCourses : [];
  const safeEnrolledIds = Array.isArray(enrolledIds) ? enrolledIds : [];

  const enrolledCourses = safeAllCourses.filter(c => safeEnrolledIds.includes(c.id));

  // Filter available courses based on grade level (if set)
  const availableCourses = safeAllCourses.filter(c => {
    // If already enrolled, don't show in explore (unless we want to show everything)
    if (safeEnrolledIds.includes(c.id)) return false;

    // If course is 'General' or has no grade, show it to everyone
    if (c.grade_level === 'General' || !c.grade_level) return true;

    // If user has a grade, and course has a specific grade, match them
    if (userGrade && c.grade_level) {
      return c.grade_level === userGrade;
    }
    return true;
  });


  return (
    <DashboardLayout title="Course Catalog" role="student">
      <div className="max-w-7xl mx-auto space-y-10 pb-20">

        {/* Hero Section */}
        <div className="relative rounded-[2.5rem] bg-indigo-600 p-8 md:p-16 overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-6 max-w-2xl">
            <Badge className="bg-white/20 text-white border-none py-1.5 px-4 font-bold tracking-wider">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              LEARNING HUB
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Unlock Your <span className="text-indigo-200 underline decoration-indigo-400 decoration-8 underline-offset-4">Potential</span> Today.
            </h2>
            <p className="text-indigo-100 text-lg font-medium opacity-90 max-w-lg leading-relaxed">
              Browse our curated list of professional courses and start your journey towards excellence.
            </p>
          </div>
          {/* Abstract Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-[60px]" />
        </div>

        {/* Tabs for Navigation */}
        <Tabs defaultValue="explore" className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl h-14">
              <TabsTrigger value="explore" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                Explore Catalog
              </TabsTrigger>
              <TabsTrigger value="my-courses" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                My Learning
                {enrolledCourses.length > 0 && (
                  <span className="ml-2 bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full text-[10px]">
                    {enrolledCourses.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="explore" className="m-0 focus-visible:ring-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-[400px] rounded-[2rem]" />)}
              </div>
            ) : availableCourses.length > 0 ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {availableCourses.map((course, idx) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    delay={idx * 0.1}
                    isEnrolled={false}
                    onEnroll={() => handleEnroll(course.id)}
                    isEnrolling={enrollingMap[course.id]}
                  />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                <BookOpen className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Wow, you&apos;re a fast learner!</h4>
                <p className="text-slate-400 font-medium">You have already enrolled in all our available courses.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-courses" className="m-0 focus-visible:ring-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-[400px] rounded-[2rem]" />)}
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {enrolledCourses.map((course, idx) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    delay={idx * 0.1}
                    isEnrolled={true}
                  />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                <PlusCircle className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Your Learning Path is Empty</h4>
                <p className="text-slate-400 font-medium mb-8">Ready to start? Head over to the Explore tab and pick your first course!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function CourseCard({
  course,
  delay,
  isEnrolled,
  onEnroll,
  isEnrolling
}: {
  course: Course;
  delay: number;
  isEnrolled: boolean;
  onEnroll?: () => void;
  isEnrolling?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
          {course.thumbnail_url ? (
            <div
              className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
              style={{ backgroundImage: `url(${course.thumbnail_url})` }}
              aria-label={course.title}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-indigo-200" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            {isEnrolled ? (
              <Link href={`/student/courses/${course.id}`}>
                <Button className="bg-white text-slate-900 shadow-xl rounded-full px-6 font-black h-12">
                  Continue Learning
                </Button>
              </Link>
            ) : (
              <Badge className="bg-white/90 text-indigo-600 font-bold px-4 py-2 rounded-full">Explore Lessons</Badge>
            )}
          </div>
          {isEnrolled && (
            <Badge className="absolute top-4 right-4 bg-emerald-500/90 text-white backdrop-blur border-none font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Enrolled
            </Badge>
          )}
        </div>

        <CardContent className="p-8 flex-1 flex flex-col">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              <span className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase">
                {`Grade Level: ${course.grade_level || 'General'}`}
              </span>
            </div>
            <h4 className="font-black text-2xl text-slate-800 dark:text-white leading-tight line-clamp-2">
              {course.title}
            </h4>
            <p className="text-slate-400 text-sm font-medium line-clamp-3 leading-relaxed">
              {course.description || "Learn the fundamentals and advanced concepts in this comprehensive curriculum designed by industry experts."}
            </p>
          </div>

          <div className="pt-8 mt-auto border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 text-xs shadow-inner">
                {course.profiles?.full_name?.charAt(0) || "T"}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{course.profiles?.full_name || "School Faculty"}</p>
              </div>
            </div>

            {isEnrolled ? (
              <Link href={`/student/courses/${course.id}`}>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            ) : (
              <Button
                onClick={onEnroll}
                disabled={isEnrolling}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-2xl font-black px-6"
              >
                {isEnrolling ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Enroll Now"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
