"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, ArrowLeft, Loader2, User } from "lucide-react";
import Link from "next/link";

interface Teacher {
    id: string;
    full_name: string;
    email: string;
}

export default function AdminCreateCoursePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [teacherError, setTeacherError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        thumbnail_url: "",
        instructor_id: "",
        grade_level: "",
    });

    useEffect(() => {
        // Fetch approved teachers
        fetch("/api/admin/users?role=teacher&approved=true")
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch teachers');
                return res.json();
            })
            .then(data => {
                const teacherList = Array.isArray(data) ? data : (data.users || []);
                setTeachers(teacherList);
                if (teacherList.length === 0) {
                    setTeacherError("No approved teachers found. Please approve teachers first.");
                }
            })
            .catch(err => {
                console.error("Failed to load teachers", err);
                setTeacherError("Failed to load teachers. Please try again.");
            })
            .finally(() => setLoadingTeachers(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.instructor_id) {
            alert("Please select an instructor for this course.");
            return;
        }

        if (!formData.grade_level) {
            alert("Please select a grade level.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/admin/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Course created successfully!");
                router.push("/admin/courses");
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
        <DashboardLayout title="Create Course (Admin)" role="admin">
            <div className="max-w-2xl mx-auto space-y-6">
                <Link href="/admin/courses" className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course Management
                </Link>

                <Card className="border-2 border-slate-200 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8">
                        <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">Direct Course Creation</CardTitle>
                        <CardDescription className="text-indigo-100">
                            As an admin, you can create courses and assign them to any approved teacher.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Course Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Advanced Mathematics - Grade 10"
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
                                    placeholder="Describe what students will learn in this course..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full min-h-[120px] rounded-md border-2 border-slate-200 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instructor_id">Assign Instructor *</Label>
                                {loadingTeachers ? (
                                    <div className="text-sm text-slate-400">Loading teachers...</div>
                                ) : teacherError ? (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-sm text-amber-800 font-medium">{teacherError}</p>
                                        <p className="text-xs text-amber-600 mt-2">
                                            Go to <Link href="/admin/users" className="underline font-bold">Admin → Users</Link> to approve teachers.
                                        </p>
                                    </div>
                                ) : (
                                    <select
                                        id="instructor_id"
                                        value={formData.instructor_id}
                                        onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                                        required
                                        className="w-full rounded-md border-2 border-slate-200 bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                    >
                                        <option value="">-- Select a Teacher --</option>
                                        {teachers.map(teacher => {
                                            const displayName = teacher.full_name || teacher.email || `Teacher ${teacher.id.slice(0, 8)}`;
                                            return (
                                                <option key={teacher.id} value={teacher.id}>
                                                    {displayName} {teacher.email && `(${teacher.email})`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                )}
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    Only approved teachers are shown
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade_level">Grade Level *</Label>
                                <select
                                    id="grade_level"
                                    value={formData.grade_level}
                                    onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                                    required
                                    className="w-full rounded-md border-2 border-slate-200 bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                >
                                    <option value="">-- Select Grade Level --</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                                        <option key={grade} value={grade.toString()}>
                                            Grade {grade}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="thumbnail_url">Thumbnail URL (Optional)</Label>
                                <Input
                                    id="thumbnail_url"
                                    placeholder="https://images.unsplash.com/photo-..."
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
                                    "Create Course"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
