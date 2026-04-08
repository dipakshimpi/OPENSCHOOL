"use client";

import { useState, useEffect } from "react";
import { Megaphone, X } from "lucide-react";

interface Announcement {
    id: string;
    title: string;
    priority: string;
}

import { authedFetch } from "@/lib/api";

export function UrgentNotice() {
    const [urgentNotice, setUrgentNotice] = useState<Announcement | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        async function fetchNotices() {
            try {
                const res = await authedFetch("/api/announcements");
                if (res.ok) {
                    const data = await res.json();
                    const urgent = data.find((n: Announcement) => n.priority === 'urgent');

                    if (urgent) {
                        // Check if THIS specific notice has been dismissed before
                        const isDismissed = localStorage.getItem(`dismissed_notice_${urgent.id}`);
                        if (!isDismissed) {
                            setUrgentNotice(urgent);
                        }
                    }
                }
            } catch {
                console.error("Failed to fetch urgent notice");
            }
        }
        fetchNotices();
    }, []);

    const handleDismiss = () => {
        if (urgentNotice) {
            localStorage.setItem(`dismissed_notice_${urgentNotice.id}`, 'true');
            setDismissed(true);
        }
    };

    if (!urgentNotice || dismissed) return null;

    return (
        <div className="bg-destructive text-destructive-foreground px-6 py-3 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
                <div className="bg-destructive/80 p-2 rounded-lg animate-pulse">
                    <Megaphone className="w-5 h-5 text-destructive-foreground" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                    <span className="font-black uppercase tracking-widest text-[10px] bg-background text-destructive px-2 py-0.5 rounded-full">
                        Urgent Notice
                    </span>
                    <span className="font-medium text-sm md:text-base">
                        {urgentNotice.title}
                    </span>
                </div>
            </div>
            <button
                onClick={handleDismiss}
                className="p-1 hover:bg-destructive/80 rounded-lg transition-colors"
                title="Dismiss"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}
