"use client";

import { useState, useEffect, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Megaphone,
    Send,
    Bell,
    Clock,
    User,
    Search,
    Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: string;
    target_role: string;
    created_at: string;
    profiles?: {
        full_name: string;
    };
}

export const dynamic = "force-dynamic";

function AdminAnnouncementsContent() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        priority: "normal",
        target_role: "all"
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        const res = await fetch("/api/announcements");
        if (res.ok) setAnnouncements(await res.json());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormData({ title: "", content: "", priority: "normal", target_role: "all" });
                fetchAnnouncements();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="admin" title="Direct Bulletin">
            <div className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4">
                
                {/* 🌟 CLEAN HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Institutional Announcements</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Broadcast critical updates and notifications across the platform.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Create Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
                            <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-indigo-600" />
                                    New Announcement
                                </CardTitle>
                                <CardDescription className="text-xs font-medium">Create a new notification for the community.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="ann-title" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject Title</Label>
                                        <Input
                                            id="ann-title"
                                            placeholder="Enter announcement subject..."
                                            required
                                            className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none px-4 focus-visible:ring-2 focus-visible:ring-indigo-600/20"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Message Content</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="Compose your message here..."
                                            rows={5}
                                            required
                                            className="rounded-xl bg-slate-50 dark:bg-slate-950 border-none p-4 focus-visible:ring-2 focus-visible:ring-indigo-600/20"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority Level</Label>
                                            <select
                                                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-none text-xs font-bold focus:ring-2 focus:ring-indigo-600/20"
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            >
                                                <option value="normal">Normal</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target Segment</Label>
                                            <select
                                                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-none text-xs font-bold focus:ring-2 focus:ring-indigo-600/20"
                                                value={formData.target_role}
                                                onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                                            >
                                                <option value="all">Everyone</option>
                                                <option value="student">Students Only</option>
                                                <option value="teacher">Teachers Only</option>
                                            </select>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-indigo-500/10" disabled={loading}>
                                        {loading ? "Syncing..." : <Send className="w-4 h-4" />}
                                        {loading ? "Sending..." : "Publish Broadcast"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase italic tracking-tighter">Broadcast Feed</h3>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Search className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{announcements.length} Active Records</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {announcements.map((ann) => (
                                <Card key={ann.id} className="border-none shadow-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden hover:shadow-lg transition-all border border-slate-100 dark:border-white/5">
                                    <CardContent className="p-8">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                                    <Megaphone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight uppercase italic">{ann.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                            <User className="w-3 h-3" />
                                                            {ann.profiles?.full_name || "Admin"}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(ann.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                "rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border-none",
                                                ann.priority === 'urgent' ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400" :
                                                ann.priority === 'high' ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
                                                "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                            )}>
                                                {ann.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                            {ann.content}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="rounded-md border-slate-200 dark:border-white/10 text-[9px] font-bold uppercase tracking-widest">
                                                Recipient: {ann.target_role === 'all' ? 'Community' : ann.target_role}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {announcements.length === 0 && (
                                <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-none shadow-sm">
                                    <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No active announcements found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function AdminAnnouncementsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminAnnouncementsContent />
        </Suspense>
    );
}
