"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, User, BookOpen, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion } from "framer-motion";

interface EnrolledClass {
  id: string;
  title: string;
  instructor: string;
  videoCount: number;
}

export default function StudentClasses() {
  const [classes, setClasses] = useState<EnrolledClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/courses")
      .then(res => res.json())
      .then(data => {
        setClasses(data.courses || []);
      })
      .catch(err => console.error("Failed to load classes", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Study Schedule" role="student">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">

        {/* Banner Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <Badge className="bg-white/20 text-white border-none px-4 py-1.5 font-bold tracking-widest">ENROLLED SESSIONS</Badge>
            <h2 className="text-4xl font-black tracking-tight">Your Academic Calendar</h2>
            <p className="text-indigo-100 font-medium opacity-90">Keep track of your active courses and upcoming virtual sessions here.</p>
          </div>
          <Calendar className="absolute right-0 bottom-0 w-64 h-64 text-white/10 -mb-12 -mr-12" />
        </div>

        {/* Classes List */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-indigo-600 rounded-full shadow-glow" />
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Active Classes</h3>
          </div>

          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 p-8">
              <CardTitle className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Schedule Overview</CardTitle>
              <CardDescription className="text-slate-400 font-medium">Auto-generated based on your active enrollments.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {loading ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-3xl w-full mb-4" />)
                ) : classes.length > 0 ? (
                  classes.map((cls, idx) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shadow-inner">
                          <BookOpen className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{cls.title}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 text-indigo-500">
                              <Calendar className="h-4 w-4" />
                              Mon, Wed, Fri
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              10:00 AM – 11:30 AM
                            </span>
                            <span className="flex items-center gap-1.5">
                              <User className="h-4 w-4" />
                              {cls.instructor}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 md:mt-0 flex items-center gap-4">
                        <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-none px-4 py-2 rounded-xl font-black text-[10px] tracking-wider uppercase">
                          ACTIVE SESSION
                        </Badge>
                        <Link href={`/student/courses/${cls.id}`}>
                          <Button size="icon" variant="ghost" className="rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all h-12 w-12">
                            <ArrowRight className="w-5 h-5" />
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">You are not attending any classes currently.</p>
                    <Link href="/student/courses" className="mt-6 block">
                      <Button variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-black rounded-xl">Browse Catalog</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
