"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Clock, User, Edit3, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

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

const DUMMY_TIMETABLE: TimetableEntry[] = [
    { day_of_week: "Monday", period_number: 1, subject: "Advanced Physics", start_time: "08:00", end_time: "09:00", teacher: { full_name: "Dr. Sarah Mitchell" } },
    { day_of_week: "Monday", period_number: 2, subject: "Calculus III", start_time: "09:00", end_time: "10:00", teacher: { full_name: "Prof. James Wilson" } },
    { day_of_week: "Tuesday", period_number: 1, subject: "Organic Chemistry", start_time: "08:00", end_time: "09:00", teacher: { full_name: "Dr. Elena Rossi" } },
    { day_of_week: "Wednesday", period_number: 3, subject: "World History", start_time: "10:00", end_time: "11:00", teacher: { full_name: "Mr. David Brown" } },
    { day_of_week: "Thursday", period_number: 5, subject: "Computer Science", start_time: "13:00", end_time: "14:00", teacher: { full_name: "Ms. Linda Chen" } },
    { day_of_week: "Friday", period_number: 2, subject: "Economics 101", start_time: "09:00", end_time: "10:00", teacher: { full_name: "Dr. Robert Smith" } },
    { day_of_week: "Saturday", period_number: 1, subject: "Physical Education", start_time: "08:00", end_time: "09:00", teacher: { full_name: "Coach Mike" } },
];

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

    const fetchTeachers = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/users?role=teacher&approved=true");
            if (res.ok) {
                const data = await res.json();
                setTeachers(Array.isArray(data) ? data : data.users || []);
            }
        } catch (err) {
            console.error("Failed to fetch teachers", err);
        }
    }, []);

    const fetchTimetable = useCallback(async () => {
        try {
            const res = await fetch(`/api/timetable?class_grade=${selectedClass}&section=${selectedSection}`);
            if (res.ok) {
                const data = await res.json();
                setTimetable(data.length > 0 ? data : DUMMY_TIMETABLE);
            } else {
                setTimetable(DUMMY_TIMETABLE);
            }
        } catch (err) {
            console.error(err);
        }
    }, [selectedClass, selectedSection]);

    useEffect(() => {
        const handler = async () => {
            await fetchTeachers();
        };
        handler();
    }, [fetchTeachers]);

    useEffect(() => {
        const handler = async () => {
            if (selectedClass && selectedSection) {
                await fetchTimetable();
            }
        };
        handler();
    }, [selectedClass, selectedSection, fetchTimetable]);

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
                const errData = await res.json();
                alert(`Failed to save slot: ${errData.error || "Unknown Error"}. ${errData.details || ""}`);
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error(error);
            alert("Error saving slot: " + (error.message || "Network Error"));
        }
    }

    return (
        <DashboardLayout role="admin" title="Master Schedule">
            <div className="max-w-[1600px] mx-auto space-y-10 pb-20 px-4">
                
                {/* 🌟 CLEAN HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Institutional Timetable</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Coordinate classroom sessions and faculty assignments for the current academic term.</p>
                    </div>
                </div>

                {/* 🔍 CONTROLS */}
                <div className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-md border border-slate-100 dark:border-white/5">
                    <div className="flex-1 flex flex-col md:flex-row items-center gap-6 w-full">
                        <div className="w-full md:w-64 space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Class Grade</Label>
                            <select 
                                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-600/20"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                {Array.from({length: 12}, (_, i) => (i+1).toString()).map(c => <option key={c} value={c}>Class {c}</option>)}
                            </select>
                        </div>
                        <div className="w-full md:w-64 space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Section</Label>
                            <select 
                                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-600/20"
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                            >
                                {["A","B","C","D","E"].map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-center">
                        <Button variant="outline" className="rounded-xl h-11 px-6 font-bold text-[10px] uppercase tracking-widest gap-2 bg-slate-50 dark:bg-slate-950 border-none shadow-sm">
                            <Filter className="w-3.5 h-3.5" /> Filter Results
                        </Button>
                    </div>
                </div>

                {/* 📅 TIMETABLE GRID */}
                <div className="overflow-x-auto pb-4">
                    <div className="inline-grid grid-cols-[100px_repeat(6,minmax(200px,1fr))] gap-4 min-w-[1200px]">
                        <div className="h-14 flex items-center justify-center font-bold text-xs text-slate-400 uppercase tracking-widest">Period</div>
                        {DAYS.map(day => (
                            <div key={day} className="h-14 flex items-center justify-center font-bold text-xs text-slate-900 dark:text-white uppercase tracking-widest bg-slate-50 dark:bg-slate-950 rounded-xl">
                                {day}
                            </div>
                        ))}

                        {PERIODS.map(period => (
                            <div key={period} className="contents">
                                <div className="h-40 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-slate-300 dark:text-slate-700">P{period}</div>
                                        <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Slot</div>
                                    </div>
                                </div>
                                {DAYS.map(day => {
                                    const slot = getSlot(day, period);
                                    return (
                                        <div 
                                            key={`${day}-${period}`}
                                            onClick={() => openEdit(day, period)}
                                            className={cn(
                                                "h-40 p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group",
                                                slot 
                                                    ? "bg-white dark:bg-slate-900 border-indigo-500/10 hover:border-indigo-500 hover:shadow-lg" 
                                                    : "bg-slate-50/50 dark:bg-slate-950/20 border-dashed border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20"
                                            )}
                                        >
                                            {slot ? (
                                                <>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">{slot.subject}</h4>
                                                        <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                                                            <User className="w-3 h-3" />
                                                            <span className="text-[10px] font-bold truncate">{slot.teacher?.full_name || 'Unassigned'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            {slot.start_time} - {slot.end_time}
                                                        </div>
                                                        <Edit3 className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="m-auto flex flex-col items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="w-5 h-5 text-slate-400" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Draft Slot</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl border-none p-0 overflow-hidden bg-white dark:bg-slate-900 shadow-2xl">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-xl font-bold tracking-tight">Modify Session Slot</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-slate-500">
                                Update period details for {editingSlot?.day}, Period {editingSlot?.period}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-8 pt-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Educational Subject</Label>
                                <Input 
                                    value={editSubject}
                                    onChange={(e) => setEditSubject(e.target.value)}
                                    placeholder="Enter subject title..."
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none px-4 focus-visible:ring-2 focus-visible:ring-indigo-600/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assigned Faculty</Label>
                                <select 
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-600/20"
                                    value={editTeacherId}
                                    onChange={(e) => setEditTeacherId(e.target.value)}
                                >
                                    <option value="">Select Instructor</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Commencement</Label>
                                    <Input 
                                        type="time"
                                        value={editStartTime}
                                        onChange={(e) => setEditStartTime(e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none px-4 focus-visible:ring-2 focus-visible:ring-indigo-600/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Termination</Label>
                                    <Input 
                                        type="time"
                                        value={editEndTime}
                                        onChange={(e) => setEditEndTime(e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none px-4 focus-visible:ring-2 focus-visible:ring-indigo-600/20"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-8 pt-0 gap-3">
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-xl h-11 px-6 font-bold text-[10px] uppercase tracking-widest">Cancel</Button>
                            <Button onClick={handleSaveSlot} className="flex-1 rounded-xl h-11 bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/10">Synchronize Slot</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
