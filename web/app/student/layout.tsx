import { getServerAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getServerAuth();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.role !== "student") {
    // If not a student, they shouldn't be here. 
    // Redirect to their respective dashboard or login.
    redirect(`/${profile.role}`);
  }

  // ENFORCE APPROVAL WORKFLOW
  if (!profile.is_admin_approved) {
    redirect("/auth/pending?step=admin");
  }

  if (!profile.is_teacher_approved) {
    redirect("/auth/pending?step=teacher");
  }

  return <>{children}</>;
}
