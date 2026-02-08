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
import {
    BellIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    MapPinIcon,
    ArrowPathIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
    const [saving, setSaving] = useState(false);
    const [fence, setFence] = useState({
        center_lat: "",
        center_lng: "",
        radius_meters: "100",
        name: "Main Campus"
    });
    const [status, setStatus] = useState<string | null>(null);
    const [schoolId, setSchoolId] = useState<string | null>(null);

    useEffect(() => {
        fetchFence();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();
            if (res.ok) {
                setSchoolId(data.school_id);
            }
        } catch {
            console.error("Failed to fetch profile");
        }
    };

    const fetchFence = async () => {
        try {
            const res = await fetch("/api/geo-fences");
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
            const res = await fetch("/api/geo-fences", {
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
        <DashboardLayout title="Settings" role="admin">
            <div className="space-y-6 max-w-4xl mx-auto pb-20">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage system configurations and preferences.</p>
                </div>

                {/* 🆔 NEW: SCHOOL IDENTITY SECTION */}
                <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-6 h-6 text-indigo-200" />
                            <CardTitle className="text-xl">School Identity</CardTitle>
                        </div>
                        <CardDescription className="text-indigo-100">
                            Share this unique ID with your teachers and staff for automatic organization assignment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                            <code className="flex-1 font-mono text-lg font-bold tracking-wider truncate">
                                {schoolId || "Generating ID..."}
                            </code>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-4"
                                onClick={() => {
                                    if (schoolId) {
                                        navigator.clipboard.writeText(schoolId);
                                        alert("School ID copied to clipboard!");
                                    }
                                }}
                            >
                                Copy ID
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 📍 NEW: CAMPUS GEO-FENCE SETTINGS */}
                <Card className="border-2 border-indigo-100 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="h-1.5 bg-indigo-600 w-full" />
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <MapPinIcon className="w-6 h-6 text-indigo-600" />
                            <CardTitle className="text-xl">Campus Geo-Lock Configuration</CardTitle>
                        </div>
                        <CardDescription>
                            Define the physical boundary of your school. Teachers must be within this area to mark attendance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold">Center Latitude</Label>
                                <Input
                                    placeholder="e.g. 18.5204"
                                    value={fence.center_lat}
                                    onChange={(e) => setFence({ ...fence, center_lat: e.target.value })}
                                    className="h-12 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold">Center Longitude</Label>
                                <Input
                                    placeholder="e.g. 73.8567"
                                    value={fence.center_lng}
                                    onChange={(e) => setFence({ ...fence, center_lng: e.target.value })}
                                    className="h-12 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-slate-700 dark:text-slate-300 font-bold">Detection Radius (Meters)</Label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={fence.radius_meters}
                                    onChange={(e) => setFence({ ...fence, radius_meters: e.target.value })}
                                    className="h-12 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="flex items-end gap-3">
                                <Button
                                    onClick={handleUseCurrentLocation}
                                    variant="outline"
                                    className="w-full h-12 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-slate-700 dark:hover:bg-slate-800 font-bold gap-2"
                                >
                                    {status ? (
                                        <CheckCircleIcon className="w-5 h-5 text-emerald-500 animate-bounce" />
                                    ) : (
                                        <MapPinIcon className="w-5 h-5" />
                                    )}
                                    {status || "Capture My Current Location"}
                                </Button>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 italic">
                            Tip: For best results, stand in the center of the school building when capturing location. A 100m radius is recommended for typical campuses.
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handleSaveFence}
                                disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 px-8 h-12 font-bold shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                {saving ? <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> : null}
                                Update Campus Boundary
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <GlobeAltIcon className="w-5 h-5 text-indigo-600" />
                            <CardTitle>General Information</CardTitle>
                        </div>
                        <CardDescription>School details and branding information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>School Name</Label>
                                <Input defaultValue="OpenSchool Academy" />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Email</Label>
                                <Input defaultValue="admin@openschool.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input defaultValue="+1 (555) 123-4567" />
                            </div>
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input defaultValue="https://openschool.com" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button>Save Changes</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BellIcon className="w-5 h-5 text-indigo-600" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>Configure how you receive alerts and updates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="text-base">Email Notifications</Label>
                                <p className="text-sm text-slate-500">Receive daily summaries and critical alerts via email.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors">
                            <div className="space-y-0.5">
                                <Label className="text-base">System Announcements</Label>
                                <p className="text-sm text-slate-500">Show maintenance and update banners on dashboard.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
                            <CardTitle>Security & Access</CardTitle>
                        </div>
                        <CardDescription>Control access policies and password requirements.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="space-y-0.5">
                                <Label className="text-base">Two-Factor Authentication</Label>
                                <p className="text-sm text-slate-500">Enforce 2FA for all admin accounts.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label>Session Timeout (minutes)</Label>
                            <Input type="number" defaultValue="30" className="max-w-[150px]" />
                        </div>
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
}
