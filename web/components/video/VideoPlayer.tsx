'use client'

import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LockClosedIcon, ShieldCheckIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { authedFetch } from "@/lib/api";

interface VideoPlayerProps {
    videoId: string;
    userEmail?: string;
}

export function VideoPlayer({ videoId, userEmail }: VideoPlayerProps) {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchVideo() {
            try {
                setLoading(true);
                setVideoUrl(null);
                setError(null);

                const res = await authedFetch(`/api/videos/stream/${videoId}`);
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error || `Error ${res.status}`);
                }

                const data = await res.json();
                if (isMounted && data.stream_url) {
                    setVideoUrl(data.stream_url);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load video");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchVideo();
        return () => { isMounted = false; };
    }, [videoId]);

    // Resolve to an absolute URL (required for media element)
    const absoluteUrl = (() => {
        if (!videoUrl) return null;
        if (videoUrl.startsWith('http')) return videoUrl;
        if (typeof window !== 'undefined') return `${window.location.origin}${videoUrl}`;
        return null;
    })();

    if (loading) {
        return <Skeleton className="w-full aspect-video rounded-3xl" />;
    }

    if (error) {
        return (
            <div className="w-full aspect-video bg-slate-950 rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-white/5">
                <ExclamationCircleIcon className="w-12 h-12 text-rose-500 mb-4 opacity-80" />
                <h3 className="text-xl font-black text-white mb-2">Playback Error</h3>
                <p className="text-slate-400 text-sm font-medium max-w-xs">{error}</p>
            </div>
        );
    }

    if (!absoluteUrl) {
        return (
            <div className="w-full aspect-video bg-slate-950 rounded-3xl flex items-center justify-center border border-white/5">
                <LockClosedIcon className="w-10 h-10 text-slate-700" />
            </div>
        );
    }
 
    return (
        <div
            className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Native HTML5 video — guaranteed to fire network requests */}
            <video
                ref={videoRef}
                src={absoluteUrl}
                className="w-full h-full object-contain"
                controls
                preload="metadata"
                playsInline
                controlsList="nodownload"
                disablePictureInPicture
                onError={(e) => {
                    const vid = e.currentTarget;
                    console.error("❌ [Video] Error:", vid.error?.code, vid.error?.message);
                }}
                onLoadedMetadata={() => console.log("✅ [Video] Metadata loaded")}
                onCanPlay={() => console.log("▶️ [Video] Can play")}
            />

            {/* Security Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 pointer-events-none">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    Secure Stream
                </span>
            </div>

            {/* Forensic Watermark */}
            {userEmail && (
                <div className="absolute bottom-12 right-4 pointer-events-none select-none opacity-15">
                    <p className="text-[9px] font-mono text-white tracking-wider">
                        {userEmail} • {new Date().toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
    );
}
