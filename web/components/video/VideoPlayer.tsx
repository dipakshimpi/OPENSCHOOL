'use client'

import { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { Skeleton } from "@/components/ui/skeleton";
import { LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

interface VideoPlayerProps {
    videoId: string;
    userEmail?: string;
}

export function VideoPlayer({ videoId, userEmail }: VideoPlayerProps) {
    const [videoData, setVideoData] = useState<{ stream_url: string; title: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        async function fetchVideo() {
            try {
                const res = await fetch(`/api/videos/stream/${videoId}`);
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Failed to load video");
                }
                const data = await res.json();
                setVideoData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchVideo();
    }, [videoId]);

    // Prevent basic inspection/theft
    const preventContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    if (loading) return <Skeleton className="w-full aspect-video rounded-3xl" />;

    if (error) {
        return (
            <div className="w-full aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white border border-slate-800 p-6 text-center">
                <LockClosedIcon className="w-12 h-12 text-rose-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Access Denied</h3>
                <p className="text-slate-400 max-w-sm">{error}</p>
            </div>
        );
    }

    return (
        <div
            className="relative group w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            onContextMenu={preventContextMenu}
        >
            <iframe
                src={videoData?.stream_url}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-presentation"
            />

            {/* Premium Security Overlays */}

            {/* 1. Static Watermark */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full pointer-events-none">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">
                    Verified Secure Stream
                </span>
            </div>

            {/* 2. Dynamic User Watermark (Changes position or stays subtle) */}
            {userEmail && (
                <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none select-none">
                    <p className="text-xs font-mono text-white tracking-widest">
                        {userEmail} • {new Date().toLocaleDateString()}
                    </p>
                </div>
            )}

            {/* 3. Anti-Screenshot/Theft Branding */}
            <div className="absolute inset-0 border-[20px] border-transparent group-hover:border-white/5 transition-all duration-700 pointer-events-none" />
        </div>
    );
}
