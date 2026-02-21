"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

interface TimetableEntry {
    id?: string;
    day_of_week: string;
    period_number: number;
    subject: string;
    class_grade: string;
    section: string;
    start_time?: string;
    end_time?: string;
}

export default function TeacherTimetablePage() {
    const { data: session, status } = useSession();
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

    useEffect(() => {
        async function fetchMyTimetable() {
            if (status !== "authenticated" || !session?.user?.id) return;

            try {
                const res = await fetch(`/api/timetable?teacher_id=${session.user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setTimetable(data);
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchMyTimetable();
    }, [session, status]);

    function getSlot(day: string, period: number) {
        return timetable.find(t => t.day_of_week === day && t.period_number === period);
    }

    return (
        <DashboardLayout role="teacher" title="My Schedule">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Teaching Schedule</h2>
                    <p className="text-slate-500 text-sm">Your assigned classes for the week.</p>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b bg-emerald-50/50 pb-4">
                        <CardTitle className="text-lg text-emerald-900">
                            Weekly Teaching Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-emerald-100/50 text-emerald-900/70 font-semibold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 border-r border-emerald-100">Day</th>
                                    {PERIODS.map(p => (
                                        <th key={p} className="px-4 py-3 border-r border-emerald-100 min-w-[120px]">
                                            Period {p}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS.map(day => (
                                    <tr key={day} className="border-b last:border-0 border-emerald-50 hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-semibold bg-emerald-50/30 border-r border-emerald-100 text-slate-700">{day}</td>
                                        {PERIODS.map(period => {
                                            const slot = getSlot(day, period);
                                            return (
                                                <td key={period} className="px-2 py-2 border-r border-emerald-50">
                                                    {slot ? (
                                                        <div className="flex flex-col h-full bg-white p-2 rounded border border-emerald-100 shadow-sm border-l-4 border-l-emerald-500">
                                                            <span className="font-bold text-slate-900">{slot.subject}</span>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600 font-bold">
                                                                    Class {slot.class_grade}-{slot.section}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 mt-1">
                                                                {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="min-h-[60px] flex items-center justify-center text-slate-300 text-xs">
                                                            -
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
            </div>
        </DashboardLayout>
    );
}
