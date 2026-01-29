"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MegaphoneIcon } from "@heroicons/react/24/outline";

interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: string;
    target_role: string;
    created_at: string;
}

export function AnnouncementsWidget({ role = "all" }: { role?: string }) {
    const [notices, setNotices] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotices() {
            try {
                const res = await fetch("/api/announcements");
                if (res.ok) {
                    const data = await res.json();
                    const filtered = data.filter((n: Announcement) => n.target_role === 'all' || n.target_role === role);
                    setNotices(filtered.slice(0, 3));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchNotices();
    }, [role]);


    if (loading) {
        return (
            <>
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </>
        );
    }

    if (notices.length === 0) {
        return (
            <div className="col-span-full py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                <MegaphoneIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm italic">No recent campus announcements.</p>
            </div>
        );
    }

    return (
        <>
            {notices.map((item) => (
                <Card key={item.id} className="border-none shadow-sm bg-white/50 backdrop-blur-md hover:shadow-md transition-all group overflow-hidden">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className={`text-[8px] uppercase tracking-wider ${item.priority === 'urgent' ? 'bg-red-50 text-red-600 border-red-100' :
                                item.priority === 'high' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-slate-50 text-slate-600 border-slate-100'
                                }`}>
                                {item.priority}
                            </Badge>
                            <span className="text-[9px] text-slate-400 font-medium">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{item.content}</p>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}
