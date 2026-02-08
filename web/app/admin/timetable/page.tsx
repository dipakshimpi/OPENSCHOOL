"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusIcon } from "@heroicons/react/24/outline";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

interface Teacher {
    id: string;
    full_name: string;
}

interface TimetableEntry {
    id?: string;
    day_of_week: string;
    period_number: number;
    subject: string;
    teacher_id?: string;
    teacher?: { full_name: string };
    start_time?: string;
    end_time?: string;
}

export default function AdminTimetablePage() {
    const [selectedClass, setSelectedClass] = useState("10");
    const [selectedSection, setSelectedSection] = useState("A");
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    // Edit Modal State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<{ day: string, period: number } | null>(null);
    const [editSubject, setEditSubject] = useState("");
    const [editTeacherId, setEditTeacherId] = useState("");
    const [editStartTime, setEditStartTime] = useState("09:00");
    const [editEndTime, setEditEndTime] = useState("10:00");

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchTimetable();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClass, selectedSection]);

    async function fetchTeachers() {
        try {
            const res = await fetch("/api/admin/users?role=teacher&approved=true"); // fetch active teachers
            if (res.ok) {
                const data = await res.json();
                setTeachers(Array.isArray(data) ? data : data.users || []);
            }
        } catch (err) {
            console.error("Failed to fetch teachers", err);
        }
    }

    async function fetchTimetable() {
        try {
            const res = await fetch(`/api/timetable?class_grade=${selectedClass}&section=${selectedSection}`);
            if (res.ok) {
                const data = await res.json();
                setTimetable(data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    function getSlot(day: string, period: number) {
        return timetable.find(t => t.day_of_week === day && t.period_number === period);
    }

    function openEdit(day: string, period: number) {
        setEditingSlot({ day, period });
        const existing = getSlot(day, period);
        if (existing) {
            setEditSubject(existing.subject);
            setEditTeacherId(existing.teacher_id || "");
            setEditStartTime(existing.start_time || "09:00");
            setEditEndTime(existing.end_time || "10:00");
        } else {
            setEditSubject("");
            setEditTeacherId("");
            setEditStartTime("09:00");
            setEditEndTime("10:00");
        }
        setIsEditOpen(true);
    }

    async function handleSaveSlot() {
        if (!editingSlot) return;

        try {
            const payload = {
                class_grade: selectedClass,
                section: selectedSection,
                day_of_week: editingSlot.day,
                period_number: editingSlot.period,
                subject: editSubject,
                teacher_id: editTeacherId || null,
                start_time: editStartTime,
                end_time: editEndTime
            };

            const res = await fetch("/api/timetable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsEditOpen(false);
                fetchTimetable();
            } else {
                alert("Failed to save slot. Check for conflicts or missing fields.");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving slot");
        }
    }

    return (
        <DashboardLayout role="admin" title="Class Timetable">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Timetable</h2>
                        <p className="text-slate-500 text-sm">Schedule classes and assign teachers for each period.</p>
                    </div>

                    <div className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm border">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-400">Class</Label>
                            <Input
                                className="w-20 h-8"
                                value={selectedClass}
                                onChange={e => setSelectedClass(e.target.value)}
                                placeholder="10"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-400">Section</Label>
                            <Input
                                className="w-20 h-8"
                                value={selectedSection}
                                onChange={e => setSelectedSection(e.target.value)}
                                placeholder="A"
                            />
                        </div>
                        <Button variant="ghost" size="sm" onClick={fetchTimetable}>Load</Button>
                    </div>
                </div>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <CardTitle className="text-lg flex justify-between items-center">
                            <span>Weekly Schedule: Class {selectedClass}-{selectedSection}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 border-r">Day / Period</th>
                                    {PERIODS.map(p => (
                                        <th key={p} className="px-4 py-3 border-r min-w-[120px]">
                                            Period {p}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS.map(day => (
                                    <tr key={day} className="border-b last:border-0 hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-semibold bg-slate-50 border-r">{day}</td>
                                        {PERIODS.map(period => {
                                            const slot = getSlot(day, period);
                                            return (
                                                <td
                                                    key={period}
                                                    className="px-2 py-2 border-r relative group cursor-pointer hover:bg-indigo-50/50 transition-colors"
                                                    onClick={() => openEdit(day, period)}
                                                >
                                                    {slot ? (
                                                        <div className="flex flex-col h-full justify-center min-h-[60px]">
                                                            <span className="font-bold text-indigo-700">{slot.subject}</span>
                                                            <span className="text-xs text-slate-500 truncate">
                                                                {slot.teacher?.full_name || "No Teacher"}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">
                                                                {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="min-h-[60px] flex items-center justify-center text-slate-200">
                                                            <PlusIcon className="w-5 h-5 group-hover:text-indigo-300" />
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

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Schedule Slot</DialogTitle>
                        <DialogDescription>
                            {editingSlot?.day}, Period {editingSlot?.period}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                placeholder="Mathematics, English..."
                                value={editSubject}
                                onChange={e => setEditSubject(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Assigned Teacher</Label>
                            <select
                                className="w-full h-9 rounded-md border border-input bg-white dark:bg-slate-950 px-3 py-1 text-base shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                value={editTeacherId}
                                onChange={(e) => setEditTeacherId(e.target.value)}
                            >
                                <option value="" disabled>Select Teacher</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.full_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input type="time" value={editStartTime} onChange={e => setEditStartTime(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input type="time" value={editEndTime} onChange={e => setEditEndTime(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveSlot}>Save Schedule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
