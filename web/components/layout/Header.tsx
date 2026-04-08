"use client";

import { Bell, Search, Megaphone, LogOut, UserCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { authedFetch } from "@/lib/api";

interface Notice {
    id: string;
    title: string;
    content: string;
    priority: string;
    created_at: string;
}

const PRIORITY_STYLES: Record<string, string> = {
    high: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
    low: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
};

export function Header({ title }: { title: string }) {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [userInitials, setUserInitials] = useState("U");
    const [userName, setUserName] = useState("User");
    const [userRole, setUserRole] = useState("student");

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await authedFetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    if (data.full_name) {
                        const initials = data.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                        setUserInitials(initials);
                        setUserName(data.full_name);
                        setUserRole(data.role || "student");
                    }
                }
            } catch (err) {
                console.error("Profile fetch error", err);
            }
        }
        fetchProfile();
    }, []);

    useEffect(() => {
        async function fetchNotices() {
            try {
                const res = await authedFetch("/api/announcements");
                if (res.ok) {
                    const data = await res.json();
                    setNotices(data.slice(0, 5));
                }
            } catch (err) {
                console.error("Notices fetch error", err);
            }
        }
        fetchNotices();
    }, []);

    return (
        <header className="sticky top-0 z-[100] h-16 px-6 flex items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Left: Page Title */}
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold text-foreground tracking-tight hidden md:block">
                    {title}
                </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-full">
                    <Search className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
                        >
                            <Bell className="h-4 w-4" />
                            {notices.length > 0 && (
                                <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                        align="end" 
                        sideOffset={8}
                        className="w-80 p-0 rounded-2xl shadow-2xl border-border bg-popover text-popover-foreground overflow-hidden z-[99999]"
                    >
                        <div className="px-5 py-4 bg-muted/50 flex items-center justify-between border-b border-border">
                            <div className="flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Notice Registry</span>
                            </div>
                            <Badge className="bg-primary/10 text-primary border-none text-[10px] h-5 px-2 font-bold hover:bg-primary/20">
                                {notices.length}
                            </Badge>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto">
                            {notices.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {notices.map((n) => (
                                        <div key={n.id} className="p-5 hover:bg-muted/50 transition-all cursor-pointer group">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge className={cn("text-[9px] uppercase font-bold h-4 px-1.5 border-none", PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.low)}>
                                                    {n.priority}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                    {new Date(n.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors uppercase italic tracking-tighter">
                                                {n.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-medium leading-relaxed">
                                                {n.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 px-6 text-center space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                                        <Bell className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-foreground uppercase tracking-widest">No Active Alerts</p>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">You have scanned all recent updates.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        align="end" 
                        sideOffset={12}
                        className="w-56 p-1.5 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-foreground z-[99999]"
                    >
                        <div className="px-3 py-3 border-b border-slate-100 dark:border-white/5 mb-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Signed in as</p>
                            <p className="text-xs font-bold text-foreground truncate uppercase tracking-tighter">{userName}</p>
                        </div>
                        <DropdownMenuItem asChild>
                            <a href={`/${userRole}/profile`} className="flex items-center gap-3 cursor-pointer py-2 px-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 group">
                                <UserCircle className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                                My Profile
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`/${userRole}/settings`} className="flex items-center gap-3 cursor-pointer py-2 px-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 group">
                                <Settings className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                                Settings
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1.5 bg-slate-100 dark:bg-white/5" />
                        <DropdownMenuItem
                            className="flex items-center gap-3 py-2 px-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 cursor-pointer text-[10px] font-bold uppercase tracking-widest group"
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        >
                            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
