import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { UrgentNotice } from "./UrgentNotice";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "teacher" | "student";
  title?: string;
}

export function DashboardLayout({ children, role, title = "Dashboard" }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
      <Sidebar role={role} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <UrgentNotice />
        <Header title={title} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
