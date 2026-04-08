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
import {
    Globe,
    MapPin,
    RefreshCw,
    UserCircle,
    Save,
    Navigation,
    User,
    Lock,
    History
} from "lucide-react";
import { useState, useEffect } from "react";
import { authedFetch } from "@/lib/api";
import { useSession } from "next-auth/react";

export default function AdminSettingsPage() {
    const { status: authStatus } = useSession();
    const [saving, setSaving] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [fence, setFence] = useState({
        center_lat: "",
        center_lng: "",
        radius_meters: "100",
        name: "Main Campus"
    });
    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        bio: "",
        school_id: ""
    });
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        if (authStatus === "authenticated") {
            fetchFence();
            fetchProfile();
        }
    }, [authStatus]);

    const fetchProfile = async () => {
        try {
            const res = await authedFetch("/api/profile");
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
    };

    const fetchFence = async () => {
        try {
            const res = await authedFetch("/api/geo-fences");
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const f = data[0];
                setFence({
                    center_lat: f.center_lat.toString(),
                    center_lng: f.center_lng.toString(),
                    radius_meters: f.radius_meters.toString(),
                    name: f.name
                });
            }
        } catch {
            console.error("Failed to fetch fence");
        }
    };

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

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setStatus("Locating...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFence(prev => ({
                    ...prev,
                    center_lat: position.coords.latitude.toString(),
                    center_lng: position.coords.longitude.toString()
                }));
                setStatus("Location captured!");
                setTimeout(() => setStatus(null), 3000);
            },
            (err) => {
                alert("Failed to get location: " + err.message);
                setStatus(null);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSaveFence = async () => {
        setSaving(true);
        try {
            const res = await authedFetch("/api/admin/geo-fences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...fence,
                    center_lat: parseFloat(fence.center_lat),
                    center_lng: parseFloat(fence.center_lng),
                    radius_meters: parseInt(fence.radius_meters)
                })
            });

            if (res.ok) {
                alert("Campus perimeter updated successfully!");
            } else {
                const err = await res.json();
                alert("Operation failed: " + (err.error || "Unknown error"));
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout role="admin" title="Direct Configuration">
            <div className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4">
                
                {/* 🌟 CLEAN HEADER */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-8 pt-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Preferences</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Manage institutional parameters, campus perimeters, and individual profile synchronization.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Navigation sidebar */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="p-2 space-y-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5">
                            <Button variant="ghost" className="w-full justify-start text-xs font-bold uppercase tracking-widest gap-3 h-11 bg-white dark:bg-slate-900 shadow-sm text-indigo-600 rounded-xl">
                                <User className="w-4 h-4" /> Admin Profile
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-xs font-bold uppercase tracking-widest gap-3 h-11 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                <Navigation className="w-4 h-4" /> Campus Perimeters
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-xs font-bold uppercase tracking-widest gap-3 h-11 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                <Lock className="w-4 h-4" /> Authority & Security
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-xs font-bold uppercase tracking-widest gap-3 h-11 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                <History className="w-4 h-4" /> System Audit Logs
                            </Button>
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="lg:col-span-9 space-y-10">
                        {/* Profile Section */}
                        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
                            <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <UserCircle className="w-5 h-5 text-indigo-600" />
                                    Administrative Profile
                                </CardTitle>
                                <CardDescription className="text-xs font-medium">Update your professional information and institutional credentials.</CardDescription>
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
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Branch ID</Label>
                                        <div className="flex items-center gap-2">
                                            <Input value={profile.school_id} disabled className="h-11 rounded-xl bg-slate-100 dark:bg-slate-950/50 border-none opacity-60 flex-1 font-mono" />
                                            <Badge variant="outline" className="h-11 px-4 rounded-xl border-slate-200 dark:border-white/10 text-[9px] font-bold tracking-widest">VERIFIED</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Professional Summary / Bio</Label>
                                    <Textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="rounded-xl bg-slate-50 dark:bg-slate-950 border-none min-h-[100px]" />
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleSaveProfile} disabled={profileSaving} className="bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white h-12 px-10 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/10 gap-2">
                                        {profileSaving ? "Synchronizing..." : <Save className="w-4 h-4" />}
                                        {profileSaving ? "Saving..." : "Update Profile"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Geo-Fencing Section */}
                        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
                            <CardHeader className="p-8 border-b border-slate-100 dark:border-white/5">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                    Campus Perimeter Configuration
                                </CardTitle>
                                <CardDescription className="text-xs font-medium">Define geographic boundaries for verified attendance and session presence.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase italic tracking-tighter">Locate Campus Hub</h4>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Extract precise coordinates from your current terminal position.</p>
                                    </div>
                                    <Button onClick={handleUseCurrentLocation} variant="outline" className="h-12 px-6 rounded-xl border-2 border-indigo-600/20 font-bold text-[10px] uppercase tracking-[0.2em] gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                                        {status ? status : <Globe className="w-4 h-4 animate-pulse" />}
                                        Capture GPS
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Node Longitude</Label>
                                        <Input value={fence.center_lng} onChange={(e) => setFence({...fence, center_lng: e.target.value})} className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Node Latitude</Label>
                                        <Input value={fence.center_lat} onChange={(e) => setFence({...fence, center_lat: e.target.value})} className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Radius Buffer (Meters)</Label>
                                        <Input type="number" value={fence.radius_meters} onChange={(e) => setFence({...fence, radius_meters: e.target.value})} className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-none" />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleSaveFence} disabled={saving} className="bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white h-12 px-10 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/10 gap-2">
                                        {saving ? "Deploying..." : <RefreshCw className="w-4 h-4" />}
                                        {saving ? "Saving..." : "Synchronize Perimeter"}
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
