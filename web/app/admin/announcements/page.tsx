"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    MegaphoneIcon,
    PaperAirplaneIcon,
    BellIcon
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";

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

export default function AdminAnnouncementsPage() {
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
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="admin" title="System Announcements">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm sticky top-6">
                        <CardHeader className="bg-indigo-600 text-white rounded-t-xl">
                            <CardTitle className="flex items-center gap-2">
                                <MegaphoneIcon className="w-5 h-5" />
                                Post New Notice
                            </CardTitle>
                            <CardDescription className="text-indigo-100">Broadcast a message to users.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Subject</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Campus Maintenance"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Details</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Enter the notification details here..."
                                        rows={4}
                                        required
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Target Audience</Label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                            value={formData.target_role}
                                            onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                                        >
                                            <option value="all">Everyone</option>
                                            <option value="student">Students Only</option>
                                            <option value="teacher">Teachers Only</option>
                                        </select>
                                    </div>
                                </div>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4" disabled={loading}>
                                    <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                                    {loading ? "Sending..." : "Publish Announcement"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* History List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <BellIcon className="w-6 h-6 text-slate-400" />
                        Recent Broadcasts
                    </h3>

                    {announcements.length > 0 ? (
                        announcements.map((item) => (
                            <Card key={item.id} className="border-none shadow-md bg-white hover:shadow-lg transition-all overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-2">
                                            {item.priority === 'urgent' && <Badge className="bg-rose-500 text-white border-none uppercase text-[10px]">Urgent</Badge>}
                                            {item.priority === 'high' && <Badge className="bg-amber-500 text-white border-none uppercase text-[10px]">High</Badge>}
                                            <Badge variant="outline" className="text-[10px] uppercase">{item.target_role}</Badge>
                                        </div>
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleString()}</span>
                                    </div>
                                    <h4 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{item.content}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 border-t pt-4">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">A</div>
                                        <span>Posted by Admin: {item.profiles?.full_name}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <MegaphoneIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500">No announcements have been broadcasted yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
