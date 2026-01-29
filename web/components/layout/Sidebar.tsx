"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    HomeIcon,
    BookOpenIcon,
    UsersIcon,
    CalendarIcon,
    VideoCameraIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    AcademicCapIcon,
    MegaphoneIcon,
    UserCircleIcon
} from "@heroicons/react/24/outline";
import { supabaseClient } from "@/lib/supabase/client";

interface SidebarProps {
    role: "admin" | "teacher" | "student";
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();

    const links = {
        admin: [
            { href: "/admin", label: "Dashboard", icon: HomeIcon },
            { href: "/admin/courses", label: "Courses", icon: BookOpenIcon },
            { href: "/admin/teachers", label: "Teachers", icon: AcademicCapIcon },
            { href: "/admin/students", label: "Students", icon: UsersIcon },
            { href: "/admin/announcements", label: "Notices", icon: MegaphoneIcon },
            { href: "/admin/settings", label: "Settings", icon: Cog6ToothIcon },
        ],
        teacher: [
            { href: "/teacher", label: "Dashboard", icon: HomeIcon },
            { href: "/teacher/classes", label: "My Classes", icon: UsersIcon },
            { href: "/teacher/attendance", label: "Attendance", icon: CalendarIcon },
            { href: "/teacher/videos", label: "Lesson Gallery", icon: VideoCameraIcon },
            { href: "/teacher/profile", label: "My Profile", icon: UserCircleIcon },
        ],
        student: [
            { href: "/student", label: "Dashboard", icon: HomeIcon },
            { href: "/student/courses", label: "My Courses", icon: BookOpenIcon },
            { href: "/student/attendance", label: "Attendance", icon: CalendarIcon },
            { href: "/student/videos", label: "Video Library", icon: VideoCameraIcon },
            { href: "/student/profile", label: "My Profile", icon: UserCircleIcon },
        ],
    };

    const navLinks = links[role];

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shadow-xl z-50 flex flex-col">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-white/5 bg-slate-950/50">
                <div className="flex items-center gap-2 text-indigo-500">
                    <AcademicCapIcon className="w-8 h-8" />
                    <span className="font-bold text-xl text-white tracking-tight">OpenSchool</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-slate-950/30">
                <div
                    onClick={async () => {
                        await supabaseClient.auth.signOut();
                        window.location.href = "/auth/login";
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Sign Out</span>
                </div>
            </div>
        </aside>
    );
}
