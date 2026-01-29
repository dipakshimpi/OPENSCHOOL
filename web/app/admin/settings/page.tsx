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
    SwatchIcon
} from "@heroicons/react/24/outline";

export default function AdminSettingsPage() {
    return (
        <DashboardLayout title="Settings" role="admin">
            <div className="space-y-6 max-w-4xl mx-auto">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage system configurations and preferences.</p>
                </div>

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

                {/* Appearance Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <SwatchIcon className="w-5 h-5 text-indigo-600" />
                            <CardTitle>Appearance</CardTitle>
                        </div>
                        <CardDescription>Customize the look and feel of the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="space-y-0.5">
                                <Label className="text-base">Dark Mode Default</Label>
                                <p className="text-sm text-slate-500">Set dark mode as the default theme for new users.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
}
