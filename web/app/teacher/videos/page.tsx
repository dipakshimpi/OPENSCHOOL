"use client";

import { useState, useEffect, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Video,
    Plus,
    PlayCircle,
    Clock,
    Trash2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface Video {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    duration: number;
    created_at: string;
    courses: { title: string };
}

function formatDuration(seconds: number) {
    if (!seconds) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function TeacherVideosContent() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVideos() {
            try {
                const url = courseId ? `/api/videos?courseId=${courseId}` : "/api/videos";
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setVideos(data);
                }
            } catch {
                console.error("Failed to fetch videos");
            } finally {
                setLoading(false);
            }
        }
        fetchVideos();
    }, [courseId]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lesson? This cannot be undone.")) return;

        try {
            const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (res.ok) {
                setVideos(videos.filter(v => v.id !== id));
            } else {
                alert(`Failed to delete: ${data.error || "Please try again later."}`);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("A network error occurred. Please check your connection.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 p-6 rounded-2xl border border-white/20 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                        <Video className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {courseId ? "Course Lessons" : "Your Video Lessons"}
                        </h2>
                        <p className="text-slate-500 text-sm">Manage and review your published educational content.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {courseId && (
                        <Link href="/teacher/videos">
                            <Button variant="outline" className="border-slate-200">Clear Filter</Button>
                        </Link>
                    )}
                    <Link href="/teacher/videos/upload">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg px-6">
                            <Plus className="w-5 h-5 mr-2" />
                            Add New Lesson
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)
                ) : videos.length > 0 ? (
                    videos.map((video) => (
                        <Card key={video.id} className="group border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/80 backdrop-blur-sm transform hover:-translate-y-1">
                            <div className="h-40 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                                {video.thumbnail_url ? (
                                    <Image
                                        src={video.thumbnail_url}
                                        alt={video.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-80"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center">
                                        <PlayCircle className="w-16 h-16 text-white/20 group-hover:text-white/50 transition-colors" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <PlayCircle className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300" />
                                </div>
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    <Badge className="bg-indigo-500 border-none shadow-lg">
                                        {video.courses?.title || "Course"}
                                    </Badge>
                                    {video.duration > 0 && (
                                        <Badge variant="secondary" className="bg-black/60 text-white border-none w-fit backdrop-blur-md">
                                            {formatDuration(video.duration)}
                                        </Badge>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(video.id)}
                                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-rose-500 text-white rounded-lg transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <CardContent className="p-5">
                                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    {video.title}
                                </h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10 italic">
                                    {video.description || "No description provided."}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center text-xs text-slate-400">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {new Date(video.created_at).toLocaleDateString()}
                                    </div>
                                    <Link href={`/student/videos/${video.id}`}>
                                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50 font-bold p-0">
                                            Watch Preview →
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-1">No videos found</h3>
                        <p className="text-slate-500 mb-6">Start by adding your first lesson to a course.</p>
                        <Link href="/teacher/videos/upload">
                            <Button variant="outline" className="border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                                Create First Lesson
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div >
    );
}

export default function TeacherVideosPage() {
    return (
        <DashboardLayout role="teacher" title="Video Management">
            <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-3xl" />}>
                <TeacherVideosContent />
            </Suspense>
        </DashboardLayout>
    );
}
