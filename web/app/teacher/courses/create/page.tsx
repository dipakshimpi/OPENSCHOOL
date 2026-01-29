"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateCoursePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        thumbnail_url: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push("/teacher/courses");
                router.refresh();
            } else {
                const error = await response.json();
                alert(error.error || "Failed to create course");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout title="Create Course" role="teacher">
            <div className="max-w-2xl mx-auto space-y-6">
                <Link href="/teacher/courses" className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Courses
                </Link>

                <Card className="border-2 border-slate-200 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8">
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">New Course Details</CardTitle>
                        <CardDescription className="text-indigo-100">
                            Fill in the information below to launch your new course.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Advanced Chemistry"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="border-2 focus-visible:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <textarea
                                    id="description"
                                    placeholder="Describe what students will learn..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full min-h-[120px] rounded-md border-2 border-slate-200 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="thumbnail_url">Thumbnail URL (Optional)</Label>
                                <Input
                                    id="thumbnail_url"
                                    placeholder="https://images.unsplash.com/..."
                                    value={formData.thumbnail_url}
                                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                    className="border-2 focus-visible:ring-indigo-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg shadow-lg shadow-indigo-200"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Launch Course"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
