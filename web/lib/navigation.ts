import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  User,
  GraduationCap,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export type UserRole = "admin" | "teacher" | "student";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const navigation: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Courses", path: "/admin/courses", icon: BookOpen },
    { label: "Attendance", path: "/admin/attendance", icon: Calendar },
  ],

  teacher: [
    { label: "Dashboard", path: "/teacher/dashboard", icon: LayoutDashboard },
    { label: "Classes", path: "/teacher/classes", icon: Calendar },
    { label: "Courses", path: "/teacher/courses", icon: BookOpen },
    { label: "Attendance", path: "/teacher/attendance", icon: Calendar },
    { label: "Profile", path: "/teacher/profile", icon: User },
  ],

  student: [
    { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { label: "Classes", path: "/student/classes", icon: Calendar },
    { label: "Courses", path: "/student/courses", icon: GraduationCap },
    { label: "Attendance", path: "/student/attendance", icon: Calendar },
    { label: "Profile", path: "/student/profile", icon: User },
  ],
};
