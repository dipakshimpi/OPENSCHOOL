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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    BellIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    MapPinIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    UserCircleIcon,
    DevicePhoneMobileIcon
} from "@heroicons/react/24/outline";
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
            }
        );
    };

    const handleSaveFence = async () => {
        setSaving(true);
        try {
            const res = await authedFetch("/api/geo-fences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    center_lat: parseFloat(fence.center_lat),
                    center_lng: parseFloat(fence.center_lng),
                    radius_meters: parseInt(fence.radius_meters),
                    name: fence.name
                })
            });

            if (res.ok) {
                alert("School boundary updated successfully!");
                fetchProfile(); // Re-fetch to see if school_id changed
            } else {
                const err = await res.json();
                alert("Error: " + err.error);
            }
        } catch {
            alert("Failed to save boundary");
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout title="Platform Configuration" role="admin">
            <div className="space-y-8 max-w-5xl mx-auto pb-20">

                <div className="flex items-end justify-between border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Admin Control Panel</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Global system settings and institutional branding.</p>
                    </div>
                </div>

                {/* 👤 NEW: ADMIN PERSONAL PROFILE */}
                <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                                <UserCircleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Personal Profile</CardTitle>
                                <CardDescription>Your administrative identity visible to the institution.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] tracking-widest">Full Administrative Name</Label>
                                <Input
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    placeholder="Enter your full name"
                                    className="h-12 bg-white dark:bg-slate-950 border-slate-200"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] tracking-widest">Contact Phone (Verified)</Label>
                                <Input
                                    value={profile.phone_number}
                                    onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                                    placeholder="+91 00000 00000"
                                    className="h-12 bg-white dark:bg-slate-950 border-slate-200"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] tracking-widest">Administrative Bio / Signature</Label>
                                <Textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell the school community about yourself..."
                                    className="min-h-[120px] bg-white dark:bg-slate-950 border-slate-200 resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={handleSaveProfile}
                                disabled={profileSaving}
                                className="bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold h-12 px-10 rounded-xl transition-all shadow-lg"
                            >
                                {profileSaving ? <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> : null}
                                Save Profile Details
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 🆔 SCHOOL IDENTITY SECTION */}
                <Card className="border-none shadow-2xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800 text-white overflow-hidden">
                    <CardHeader className="pb-2 p-8">
                        <div className="flex items-center gap-3">
                            <ShieldCheckIcon className="w-7 h-7 text-indigo-300" />
                            <CardTitle className="text-2xl font-black tracking-tight">Institutional Token</CardTitle>
                        </div>
                        <CardDescription className="text-indigo-100 font-medium opacity-90">
                            Distribute this code specifically to Teachers. Students using this will inherit your school domain.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20">
                            <div className="flex-1 space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">System Registry ID</p>
                                <code className="block font-mono text-2xl font-black tracking-[0.1em] truncate">
                                    {profile.school_id || "Awaiting Anchor..."}
                                </code>
                            </div>
                            <Button
                                variant="secondary"
                                className="bg-white text-indigo-700 hover:bg-slate-100 font-black uppercase text-[11px] tracking-widest px-8 h-14 rounded-2xl shadow-xl transition-all active:scale-95"
                                onClick={() => {
                                    if (profile.school_id) {
                                        navigator.clipboard.writeText(profile.school_id);
                                        alert("Institutional ID copied to high-security clipboard!");
                                    }
                                }}
                            >
                                Copy Secure ID
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 📍 CAMPUS GEO-FENCE SETTINGS */}
                <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                                <MapPinIcon className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Geo-Attendance Boundary</CardTitle>
                                <CardDescription className="font-medium">Define the precise circular zone for verified attendance capture.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-6 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <Label className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Ground Latitude</Label>
                                <Input
                                    placeholder="e.g. 18.5204"
                                    value={fence.center_lat}
                                    onChange={(e) => setFence({ ...fence, center_lat: e.target.value })}
                                    className="h-14 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Ground Longitude</Label>
                                <Input
                                    placeholder="e.g. 73.8567"
                                    value={fence.center_lng}
                                    onChange={(e) => setFence({ ...fence, center_lng: e.target.value })}
                                    className="h-14 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Security Radius (m)</Label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={fence.radius_meters}
                                    onChange={(e) => setFence({ ...fence, radius_meters: e.target.value })}
                                    className="h-14 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Button
                                onClick={handleUseCurrentLocation}
                                variant="outline"
                                className="flex-1 w-full h-14 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase text-[11px] tracking-widest gap-2 hover:bg-slate-50 rounded-2xl transition-all"
                            >
                                {status ? (
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <DevicePhoneMobileIcon className="w-5 h-5 text-indigo-500" />
                                )}
                                {status || "Synchronize with My Satellite Position"}
                            </Button>
                            <Button
                                onClick={handleSaveFence}
                                disabled={saving}
                                className="w-full sm:w-auto h-14 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none"
                            >
                                {saving ? <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> : null}
                                Update Control Boundary
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Platform Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BellIcon className="w-5 h-5 text-indigo-600" />
                                <CardTitle className="text-lg font-bold">Admin Notifications</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <Label className="text-sm font-bold">New Teacher Alerts</Label>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <GlobeAltIcon className="w-5 h-5 text-indigo-600" />
                                <CardTitle className="text-lg font-bold">Regional Standards</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <Label className="text-sm font-bold">Metric System (m/km)</Label>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </DashboardLayout>
    );
}
