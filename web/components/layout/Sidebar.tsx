"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home,
    BookOpen,
    Users,
    Calendar,
    Video,
    Settings,
    LogOut,
    GraduationCap,
    Megaphone,
    UserCircle,
    BadgeCheck,
    LayoutGrid,
    UserPlus,
    Sparkles
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";


interface SidebarProps {
    role: "admin" | "teacher" | "student";
}

interface NavigationLink {
    href: string;
    label: string;
    icon: React.ElementType;
}

const ROLE_COLORS: Record<string, string> = {
    admin: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    teacher: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    student: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const ROLE_LABELS: Record<string, string> = {
    admin: "Administrator",
    teacher: "Faculty",
    student: "Learner",
};

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();

    const links: Record<string, NavigationLink[]> = {
        admin: [
            { href: "/admin", label: "Dashboard", icon: Home },
            { href: "/admin/courses", label: "Courses", icon: BookOpen },
            { href: "/admin/users", label: "User Management", icon: Users },
            { href: "/admin/teachers", label: "Teachers", icon: GraduationCap },
            { href: "/admin/students", label: "Students", icon: UserPlus },
            { href: "/admin/approvals", label: "Approvals", icon: BadgeCheck },
            { href: "/admin/timetable", label: "Timetable", icon: LayoutGrid },
            { href: "/admin/announcements", label: "Notices", icon: Megaphone },
        ],
        teacher: [
            { href: "/teacher", label: "Dashboard", icon: Home },
            { href: "/teacher/classes", label: "My Classes", icon: Users },
            { href: "/teacher/timetable", label: "Timetable", icon: LayoutGrid },
            { href: "/teacher/attendance", label: "Attendance", icon: Calendar },
            { href: "/teacher/videos", label: "Lesson Gallery", icon: Video },
        ],
        student: [
            { href: "/student", label: "Dashboard", icon: Home },
            { href: "/student/courses", label: "My Courses", icon: BookOpen },
            { href: "/student/timetable", label: "Timetable", icon: LayoutGrid },
            { href: "/student/attendance", label: "Attendance", icon: Calendar },
            { href: "/student/videos", label: "Video Library", icon: Video },
        ],
    };

    const navLinks = links[role];

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border z-50 flex flex-col font-sans">
            {/* Brand */}
            <div className="h-20 flex items-center px-6 gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 flex-shrink-0 rotate-3">
                    <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex flex-col leading-tight">
                    <span className="font-black text-foreground text-base tracking-tighter uppercase italic">OpenSchool</span>
                    <Badge
                        className={cn(
                            "text-[8px] px-1.5 py-0 h-3.5 border-none font-black uppercase tracking-[0.15em] w-fit",
                            ROLE_COLORS[role]
                        )}
                        variant="outline"
                    >
                        {ROLE_LABELS[role]}
                    </Badge>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
                <div className="pb-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 px-4">Workspace</p>
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                            >
                                {isActive && (
                                    <span className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                                )}
                                <Icon
                                    className={cn(
                                        "w-5 h-5 flex-shrink-0 transition-all duration-300",
                                        isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                                    )}
                                />
                                <span className="truncate tracking-tight">{link.label}</span>
                                {isActive && (
                                    <Sparkles className="ml-auto w-3 h-3 text-primary animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="pt-8">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 px-4">Security & Access</p>
                    {[
                        { href: `/${role}/profile`, label: "Identity", icon: UserCircle },
                        { href: `/${role}/settings`, label: "Registry Settings", icon: Settings },
                    ].map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span className="truncate tracking-tight">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 mt-auto">
                <button
                    onClick={async () => {
                        await signOut({ callbackUrl: "/auth/login" });
                    }}
                    className="w-full flex items-center justify-center gap-3 h-12 text-sm font-black uppercase tracking-widest text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all duration-300 group"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                    <span>Clear Session</span>
                </button>
            </div>
        </aside>
    );
}
