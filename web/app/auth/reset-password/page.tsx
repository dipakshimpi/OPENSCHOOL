"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AcademicCapIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

/**
 * Reset Password page — No longer needed since Keycloak handles password resets.
 * This page is kept as a friendly redirect.
 */
export default function ResetPasswordPage() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md z-10 shadow-xl border-white/40 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                        <AcademicCapIcon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Password Reset
                    </CardTitle>
                    <CardDescription>
                        Password resets are now handled through our secure identity provider (Keycloak).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                            To reset your password, use the &quot;Forgot Password?&quot; link on the login page.
                            You&apos;ll receive an email with instructions to set a new password.
                        </p>
                    </div>

                    <Link href="/auth/login">
                        <Button className="w-full bg-primary hover:bg-primary/90 shadow-lg h-11">
                            Go to Login
                        </Button>
                    </Link>

                    <div className="flex justify-center pt-2">
                        <Link href="/auth/forgot-password" className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                            Reset password
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
