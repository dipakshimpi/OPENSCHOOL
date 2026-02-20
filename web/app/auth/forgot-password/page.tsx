"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AcademicCapIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

/**
 * Forgot Password page.
 * Since we use Keycloak, password reset is handled by Keycloak's built-in flow.
 * This page directs users to Keycloak's login page where they can click "Forgot Password".
 */
export default function ForgotPasswordPage() {
    const keycloakIssuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER || "";

    // Build Keycloak's account page URL (for password reset)
    // Keycloak login page has a "Forgot Password?" link built in
    const handleResetRedirect = () => {
        // Redirect to Keycloak login page — user can click "Forgot Password?" there
        window.location.href = `${keycloakIssuer}/protocol/openid-connect/auth?client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}&response_type=code&scope=openid&redirect_uri=${encodeURIComponent(window.location.origin + "/api/auth/callback/keycloak")}&kc_action=UPDATE_PASSWORD`;
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md z-10 shadow-xl border-white/40 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800 transition-all duration-300">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                        <AcademicCapIcon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Reset password
                    </CardTitle>
                    <CardDescription>
                        Password management is handled securely through our identity provider.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            You will be redirected to our secure login page where you can reset your password.
                            If you signed in with Google, your password is managed by Google.
                        </p>
                    </div>

                    <Button
                        onClick={handleResetRedirect}
                        className="w-full bg-primary hover:bg-primary/90 shadow-lg h-11"
                    >
                        Reset My Password
                    </Button>

                    <div className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-4">
                        <Link href="/auth/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                            Back to login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
