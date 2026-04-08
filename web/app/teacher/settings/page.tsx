"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Save, User, Lock, History } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { authedFetch } from "@/lib/api";
import { useSession } from "next-auth/react";

export default function TeacherSettingsPage() {
    const { status: authStatus } = useSession();
    const [profileSaving, setProfileSaving] = useState(false);
    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        bio: "",
        school_id: ""
    });

    const fetchProfile = useCallback(async () => {
        try {
            const res = await authedFetch("/api/profile?intendedRole=teacher");
            const data = await res.json();
            if (res.ok) {
                setProfile({
                    full_name: data.full_name || "",
                    email: data.email || "",
                    phone_number: data.phone_number || "",
                    bio: data.bio || "",
                    school_id: data.school_id || ""
                });
            }
        } catch {
            console.error("Failed to fetch profile");
        }
    }, []);

    useEffect(() => {
        if (authStatus === "authenticated") {
            fetchProfile();
        }
    }, [authStatus, fetchProfile]);

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        try {
            const res = await authedFetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: profile.full_name,
                    phone_number: profile.phone_number,
                    bio: profile.bio
                })
            });

            if (res.ok) {
                alert("Profile updated successfully!");
            } else {
                const err = await res.json();
                alert("Update failed: " + (err.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Profile save error", error);
            alert("Failed to save profile changes.");
        } finally {
            setProfileSaving(false);
        }
    };

    return (
        <DashboardLayout role="teacher" title="Registry Settings">
            <div className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4">
                
                {/* Clean Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Registry Settings</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Manage your personal profile and institutional credentials.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Navigation sidebar */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="p-2 space-y-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5">
                            <Button variant="ghost" className="w-full justify-start text-xs font-bold uppercase tracking-widest gap-3 h-11 bg-white dark:bg-slate-900 shadow-sm text-purple-600 rounded-xl">
                                <User className="w-4 h-4" /> My Profile
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-xs font-bold uppercase tracking-widest gap-3 h-11 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                <Lock className="w-4 h-4" /> Account Security
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-xs font-bold uppercase tracking-widest gap-3 h-11 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                <History className="w-4 h-4" /> Active Sessions
                            </Button>
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="lg:col-span-9 space-y-10">
                        {/* Profile Section */}
                        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
                            <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <UserCircle className="w-5 h-5 text-purple-600" />
                                    Faculty Profile
                                </CardTitle>
                                <CardDescription className="text-xs font-medium">Update your professional information.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Academic Name</Label>
                                        <Input value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Registered Email</Label>
                                        <Input value={profile.email} disabled className="h-11 rounded-xl bg-slate-100 dark:bg-slate-950/50 border-none opacity-60" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Contact</Label>
                                        <Input value={profile.phone_number} onChange={(e) => setProfile({...profile, phone_number: e.target.value})} className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Hub</Label>
                                        <div className="flex items-center gap-2">
                                            <Input value={profile.school_id || "Unassigned"} disabled className="h-11 rounded-xl bg-slate-100 dark:bg-slate-950/50 border-none opacity-60 flex-1 font-mono" />
                                            {profile.school_id ? (
                                                <Badge variant="outline" className="h-11 px-4 rounded-xl border-slate-200 dark:border-white/10 text-[9px] font-bold tracking-widest text-emerald-600">VERIFIED</Badge>
                                            ) : (
                                                <Badge variant="outline" className="h-11 px-4 rounded-xl border-slate-200 dark:border-white/10 text-[9px] font-bold tracking-widest text-amber-500">PENDING</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Professional Summary / Bio</Label>
                                    <Textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="rounded-xl bg-slate-50 dark:bg-slate-950 border-none min-h-[100px]" />
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleSaveProfile} disabled={profileSaving} className="bg-purple-600 hover:bg-black dark:hover:bg-purple-700 text-white h-12 px-10 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-purple-500/10 gap-2">
                                        {profileSaving ? "Synchronizing..." : <Save className="w-4 h-4" />}
                                        {profileSaving ? "Saving..." : "Update Profile"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
