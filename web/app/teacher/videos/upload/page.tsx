"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpTrayIcon, VideoCameraIcon, FilmIcon } from "@heroicons/react/24/outline";
import { getUploadToken } from "@/app/actions/get-upload-token";

interface Course {
    id: string;
    title: string;
}

export default function UploadVideoPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    // Form State
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");

    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>("");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/courses");
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch {
            console.error("Failed to fetch courses");
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file || !title || !selectedCourse) {
            alert("Please fill in all required fields and select a file.");
            return;
        }

        setIsUploading(true);
        setUploadStatus("Authenticating...");

        try {
            // 1. Get Auth Token from Server (Secure)
            const { token, error } = await getUploadToken();
            if (error || !token) throw new Error(error || "Failed to get auth token");

            // 2. Prepare Direct Upload to PeerTube
            setUploadStatus("Uploading directly to Video Server...");
            const formData = new FormData();
            formData.append("videofile", file);
            formData.append("channelId", "1");
            formData.append("name", title);
            formData.append("privacy", "1");
            if (description) formData.append("description", description);

            // 3. Send to PeerTube (Bypassing Vercel Limit)
            const peerTubeUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
            // Check if we are using the proxied API route or direct
            // We need to hit the PeerTube API directly to avoid Vercel Limits
            // AND we need to use the public URL (ngrok)

            const uploadRes = await fetch(`${peerTubeUrl}/api/v1/videos/upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true"
                },
                body: formData
            });

            if (!uploadRes.ok) {
                const errText = await uploadRes.text();
                throw new Error(`Upload Failed: ${errText}`);
            }

            const videoData = await uploadRes.json();
            const videoUrl = videoData.video.url || `${peerTubeUrl}/w/${videoData.video.shortUUID}`;

            setUploadStatus("Linking to Course...");

            // 4. Save metadata to Supabase (via existing server action, but just for DB)
            // We need a separate action for this or modify the existing one.
            // For now, let's just use a simple API call to save the reference
            const saveRes = await fetch("/api/videos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    course_id: selectedCourse,
                    peertube_url: videoUrl
                })
            });

            if (!saveRes.ok) throw new Error("Failed to save video to course database");

            setUploadStatus("Success! Redirecting...");
            setTimeout(() => {
                router.push("/teacher/videos");
            }, 1000);

        } catch (error: unknown) {
            console.error("Upload Error:", error);
            const message = error instanceof Error ? error.message : "An unknown error occurred";
            alert(message);
            setIsUploading(false);
            setUploadStatus("");
        }
    };

    return (
        <DashboardLayout role="teacher" title="Upload New Lesson">
            <div className="max-w-3xl mx-auto pb-12">
                <Card className="shadow-xl border-indigo-100 dark:border-slate-800">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 border-b border-indigo-50 dark:border-slate-800 pb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                <ArrowUpTrayIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Upload Video Lesson</CardTitle>
                                <CardDescription>
                                    Publish a new video directly to your course. We handle the hosting securely.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleUpload} className="space-y-8">

                            {/* Course Selector */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold text-slate-700">Select Course</Label>
                                <select
                                    className="flex h-12 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    <option value="" disabled>Select a course...</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                                {courses.length === 0 && !loadingCourses && (
                                    <p className="text-sm text-rose-500">No courses found. Please create a course first.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Video Details */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-slate-700">Lesson Title</Label>
                                        <Input
                                            placeholder="e.g. Introduction to Algebra"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="h-12 border-slate-200 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-slate-700">Description</Label>
                                        <Textarea
                                            placeholder="What will students learn in this video?"
                                            className="min-h-[140px] border-slate-200 resize-none font-medium"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* File Drop Area (Visual) */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold text-slate-700">Video File</Label>
                                    <div className={`
                                        border-2 border-dashed rounded-xl h-[260px] flex flex-col items-center justify-center p-6 text-center transition-all
                                        ${file ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 bg-slate-50'}
                                    `}>
                                        <input
                                            type="file"
                                            accept="video/mp4,video/webm,video/ogg"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="video-upload"
                                        />
                                        <label htmlFor="video-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                            {file ? (
                                                <>
                                                    <FilmIcon className="w-16 h-16 text-emerald-500 mb-4" />
                                                    <p className="font-bold text-slate-900 text-lg max-w-[200px] truncate">{file.name}</p>
                                                    <p className="text-sm text-slate-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                    <Button variant="outline" size="sm" className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-100">Change File</Button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                                        <VideoCameraIcon className="w-8 h-8 text-indigo-500" />
                                                    </div>
                                                    <p className="font-bold text-slate-700 text-lg">Click to Browse</p>
                                                    <p className="text-sm text-slate-400 mt-2 px-4">Supports MP4, WebM. Max 500MB recommended.</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 flex items-center justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    disabled={isUploading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isUploading || !file || !selectedCourse}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                                >
                                    {isUploading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 border-2 border-white/30 border-top-white rounded-full animate-spin"></span>
                                            {uploadStatus || "Uploading..."}
                                        </span>
                                    ) : (
                                        "Start Upload"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
