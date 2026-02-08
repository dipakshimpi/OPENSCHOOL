"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    const [selectedClass, setSelectedClass] = useState("10");
    const [selectedSection, setSelectedSection] = useState("A");
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    // const [loading, setLoading] = useState(false); // Removed unused

    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchTimetable();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClass, selectedSection]);

    async function fetchTimetable() {
        // setLoading(true);
        try {
            const res = await fetch(`/api/timetable?class_grade=${selectedClass}&section=${selectedSection}`);
            if (res.ok) {
                const data = await res.json();
                setTimetable(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            // setLoading(false);
        }
    }

    function getSlot(day: string, period: number) {
        return timetable.find(t => t.day_of_week === day && t.period_number === period);
    }

    return (
        <DashboardLayout role="student" title="Class Timetable">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Timetable</h2>
                        <p className="text-slate-500 text-sm">View your weekly class schedule.</p>
                    </div>

                    <div className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm border">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-400">Class</Label>
                            <Input
                                className="w-16 h-8 text-center"
                                value={selectedClass}
                                onChange={e => setSelectedClass(e.target.value)}
                                placeholder="10"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-400">Section</Label>
                            <Input
                                className="w-16 h-8 text-center"
                                value={selectedSection}
                                onChange={e => setSelectedSection(e.target.value)}
                                placeholder="A"
                            />
                        </div>
                        <Button variant="ghost" size="sm" onClick={fetchTimetable}>View</Button>
                    </div>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b bg-indigo-50/50 pb-4">
                        <CardTitle className="text-lg text-indigo-900">
                            Weekly Schedule: Class {selectedClass}-{selectedSection}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-indigo-100/50 text-indigo-900/70 font-semibold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 border-r border-indigo-100">Day</th>
                                    {PERIODS.map(p => (
                                        <th key={p} className="px-4 py-3 border-r border-indigo-100 min-w-[120px]">
                                            Period {p}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS.map(day => (
                                    <tr key={day} className="border-b last:border-0 border-indigo-50 hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-semibold bg-indigo-50/30 border-r border-indigo-100 text-slate-700">{day}</td>
                                        {PERIODS.map(period => {
                                            const slot = getSlot(day, period);
                                            return (
                                                <td key={period} className="px-2 py-2 border-r border-indigo-50">
                                                    {slot ? (
                                                        <div className="flex flex-col h-full bg-white p-2 rounded border border-indigo-100 shadow-sm">
                                                            <span className="font-bold text-indigo-700">{slot.subject}</span>
                                                            <span className="text-xs text-slate-500 mt-1">
                                                                {slot.teacher?.full_name || "TBA"}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 mt-0.5">
                                                                {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="min-h-[60px] flex items-center justify-center text-slate-300 text-xs italic">
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
            </div>
        </DashboardLayout>
    );
}
