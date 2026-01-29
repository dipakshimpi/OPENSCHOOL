"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeftIcon,
    InformationCircleIcon,
    AcademicCapIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "@/components/video/VideoPlayer";

interface Video {
    id: string;
    title: string;
    description: string;
    peertube_url: string;
    course_id: string;
    courses: { title: string };
}

export default function VideoWatchPage() {
    const params = useParams();
    const router = useRouter();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVideo() {
            try {
                // Fetch specific video (we can filter general videos for now or create a specific endpoint)
                const res = await fetch("/api/videos");
                const data = await res.json();
                const found = data.find((v: any) => v.id === params.id);
                setVideo(found);
            } catch (error) {
                console.error("Failed to fetch video");
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
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Back to Library
                    </Button>

                    {/* Secure Video Player - Uses Proxy API */}
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
                        <VideoPlayer videoId={video.id} />
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
                                <InformationCircleIcon className="w-5 h-5 text-indigo-500" />
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
                    <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-none shadow-xl rounded-2xl overflow-hidden p-6">
                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                            <AcademicCapIcon className="w-6 h-6 text-indigo-400" />
                            Next Steps
                        </h3>
                        <div className="space-y-4">
                            <p className="text-indigo-200 text-sm">
                                Finished watching? Mark this lesson as completed to track your progress.
                            </p>
                            <Button className="w-full bg-white text-indigo-900 hover:bg-slate-100 font-bold border-none h-12">
                                Mark as Completed
                            </Button>
                        </div>
                    </Card>

                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                        <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                            <InformationCircleIcon className="w-4 h-4" />
                            Lesson Tips
                        </h4>
                        <ul className="text-xs text-amber-700 space-y-2 list-disc list-inside">
                            <li>Take notes during the video.</li>
                            <li>Re-watch difficult sections.</li>
                            <li>Don't forget to complete the corresponding assignment.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
