"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone } from "lucide-react";

interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: string;
    target_role: string;
    created_at: string;
}

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
            <div className="space-y-4 w-full">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[2rem] bg-muted" />)}
            </div>
        );
    }

    if (notices.length === 0) {
        return (
            <div className="w-full py-12 bg-muted/50 rounded-[2.5rem] border-2 border-dashed border-border text-center flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Megaphone className="w-6 h-6" />
                </div>
                <p className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.3em]">Signal Flatline • No Notices</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full">
            {notices.map((item, idx) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Card className="border-none shadow-xl bg-card text-card-foreground hover:shadow-2xl transition-all duration-300 group overflow-hidden rounded-[2rem] border border-border">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <Badge className={cn(
                                    "px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest border-none shadow-inner",
                                    item.priority === 'urgent' ? 'bg-destructive text-destructive-foreground animate-pulse' :
                                    item.priority === 'high' ? 'bg-amber-500 text-white' :
                                    'bg-primary text-primary-foreground'
                                )}>
                                    {item.priority} Protocol
                                </Badge>
                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-black text-xl text-card-foreground group-hover:text-primary transition-colors uppercase tracking-tight leading-none mb-3">{item.title}</h4>
                            <p className="text-xs text-muted-foreground font-bold leading-relaxed line-clamp-3">{item.content}</p>
                            <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full group-hover:scale-150 transition-all" />
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Campus Broadcast Hub</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
