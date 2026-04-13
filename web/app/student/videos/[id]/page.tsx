"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    Info,
    GraduationCap
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { authedFetch } from "@/lib/api";

interface Video {
    id: string;
    title: string;
    description: string;
    course_id: string;
    courses: { title: string };
}

import { useSession } from "next-auth/react";

export default function VideoWatchPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVideo() {
            try {
                // Fetch specific video (we can filter general videos for now or create a specific endpoint)
                const res = await authedFetch("/api/videos");
                const data: Video[] = await res.json();
                const found = data.find((v: Video) => v.id === params.id);
                setVideo(found || null);
            } catch (error) {
                console.error("Failed to fetch video", error);
            } finally {
                setLoading(false);
            }
        }
        fetchVideo();
    }, [params.id]);

    if (loading) {
        return (
            <DashboardLayout role="student" title="Loading Lesson...">
                <div className="space-y-6">
                    <Skeleton className="aspect-video w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (!video) {
        return (
            <DashboardLayout role="student" title="Error">
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-slate-900">Video not found</h2>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student" title={video.title}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Player Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-2 text-slate-500 hover:text-indigo-600"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Library
                    </Button>

                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
                        <VideoPlayer videoId={video.id} userEmail={session?.user?.email || undefined} />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-slate-900">{video.title}</h2>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                                {video.courses?.title}
                            </Badge>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 text-sm">Video Lesson</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <Info className="w-5 h-5 text-indigo-500" />
                                Description
                            </h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {video.description || "No description provided for this lesson."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Context */}
                <div className="space-y-6">
                    <Card className="bg-white text-slate-900 border border-slate-200 shadow-sm rounded-2xl overflow-hidden p-6">
                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-indigo-600">
                            <GraduationCap className="w-6 h-6" />
                            Next Steps
                        </h3>
                        <div className="space-y-4">
                            <p className="text-slate-500 text-sm font-medium">
                                Finished watching? Mark this lesson as completed to track your progress.
                            </p>
                            <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-bold border-none h-12 rounded-xl transition-all shadow-lg shadow-indigo-100">
                                Mark as Completed
                            </Button>
                        </div>
                    </Card>

                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4 text-indigo-500" />
                            Lesson Tips
                        </h4>
                        <ul className="text-sm text-slate-500 space-y-3 list-none">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                Take notes during the video to reinforce learning.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                Re-watch difficult sections to ensure full understanding.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                Don&apos;t forget to complete the corresponding assignment.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
