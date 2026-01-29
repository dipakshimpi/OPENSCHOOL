import { BellIcon, MagnifyingGlassIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface Notice {
    id: string;
    title: string;
    content: string;
    priority: string;
    created_at: string;
}

export function Header({ title }: { title: string }) {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [showPanel, setShowPanel] = useState(false);

    useEffect(() => {
        async function fetchNotices() {
            try {
                const res = await fetch("/api/announcements");
                if (res.ok) {
                    const data = await res.json();
                    setNotices(data.slice(0, 5)); // Show last 5
                }
            } catch (err) {
                console.error("Notices fetch error", err);
            }
        }
        fetchNotices();
    }, []);

    return (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 h-16 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight hidden md:block">
                    {title}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block w-64">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search..."
                        className="pl-9 h-9 bg-slate-100 dark:bg-slate-900 border-none focus-visible:ring-primary/20"
                    />
                </div>

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                        onClick={() => setShowPanel(!showPanel)}
                    >
                        <BellIcon className="h-6 w-6" />
                        {notices.length > 0 && (
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-slate-950" />
                        )}
                    </Button>

                    {showPanel && (
                        <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-slate-50 dark:border-white/5 bg-indigo-600 text-white font-bold flex items-center justify-between">
                                <span className="text-sm flex items-center gap-2"><MegaphoneIcon className="w-4 h-4" /> System Notices</span>
                                <Badge className="bg-white/20 text-white border-none">{notices.length}</Badge>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notices.length > 0 ? (
                                    notices.map((n) => (
                                        <div key={n.id} className="p-4 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-center mb-1">
                                                <Badge variant="outline" className="text-[8px] uppercase">{n.priority}</Badge>
                                                <span className="text-[8px] text-slate-400 font-mono italic">{new Date(n.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{n.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center text-slate-400 text-sm">No new notices for you.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm border border-indigo-200 dark:border-indigo-800">
                    AD
                </div>
            </div>
        </header>
    );
}
