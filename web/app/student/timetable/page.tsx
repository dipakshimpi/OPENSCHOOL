"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

interface TimetableEntry {
    id?: string;
    day_of_week: string;
    period_number: number;
    subject: string;
    teacher?: { full_name: string };
    start_time?: string;
    end_time?: string;
}

export default function StudentTimetablePage() {
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            try {
                const profileRes = await fetch("/api/profile");
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    setSelectedClass(profile.grade_level);
                    setSelectedSection(profile.section);

                    if (profile.grade_level && profile.section) {
                        const ttRes = await fetch(`/api/timetable?class_grade=${profile.grade_level}&section=${profile.section}`);
                        if (ttRes.ok) {
                            const ttData = await ttRes.json();
                            setTimetable(ttData);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    function getSlot(day: string, period: number) {
        return timetable.find(t => t.day_of_week === day && t.period_number === period);
    }

    return (
        <DashboardLayout role="student" title="Class Timetable">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Timetable</h2>
                        <p className="text-slate-500 text-sm">Official weekly schedule for your assigned section.</p>
                    </div>

                    <div className="flex gap-4 items-center bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 shadow-inner">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current Grade</span>
                            <span className="font-bold text-indigo-900">{selectedClass ? `Class ${selectedClass}` : '--'}</span>
                        </div>
                        <div className="w-px h-8 bg-indigo-200" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Section</span>
                            <span className="font-bold text-indigo-900">{selectedSection ? `Section ${selectedSection}` : '--'}</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="h-96 w-full bg-white animate-pulse rounded-[2rem] border-2 border-slate-50 flex items-center justify-center">
                        <div className="text-slate-400 font-medium">Synchronizing Schedule...</div>
                    </div>
                ) : selectedClass && selectedSection ? (
                    <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden rounded-[2rem]">
                        <CardHeader className="border-b bg-indigo-600 text-white pb-6">
                            <CardTitle className="text-xl">
                                Weekly Schedule: {selectedClass}-{selectedSection}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-black uppercase text-[10px] tracking-[0.2em]">
                                    <tr>
                                        <th className="px-6 py-4 border-r border-slate-100 dark:border-slate-800">Day</th>
                                        {PERIODS.map(p => (
                                            <th key={p} className="px-6 py-4 border-r border-slate-100 dark:border-slate-800 min-w-[140px]">
                                                Period {p}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DAYS.map(day => (
                                        <tr key={day} className="border-b last:border-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-black text-indigo-600 bg-indigo-50/30 border-r border-slate-100 dark:border-slate-800 uppercase tracking-widest text-xs">{day}</td>
                                            {PERIODS.map(period => {
                                                const slot = getSlot(day, period);
                                                return (
                                                    <td key={period} className="px-3 py-3 border-r border-slate-100 dark:border-slate-800">
                                                        {slot ? (
                                                            <div className="flex flex-col h-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-all">
                                                                <div className="absolute top-0 right-0 w-1 h-full bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                <span className="font-black text-slate-800 dark:text-white mb-1 line-clamp-1">{slot.subject}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 mb-2 truncate">
                                                                    {slot.teacher?.full_name || "School Faculty"}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full w-fit">
                                                                    {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="min-h-[80px] flex items-center justify-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                                                Free
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">Schedule Unavailable</h3>
                        <p className="text-slate-500">Please make sure you are assigned to a Class and Section by the administrator.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
