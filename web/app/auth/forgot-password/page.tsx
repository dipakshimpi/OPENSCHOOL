"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AcademicCapIcon, ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            alert(error.message);
            setIsLoading(false);
            return;
        }

        setIsSubmitted(true);
        setIsLoading(false);
    };

    if (isSubmitted) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md z-10 shadow-xl border-white/40 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800 p-8 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                    <p className="text-slate-500 mb-6">We&apos;ve sent a password reset link to <span className="font-bold">{email}</span></p>
                    <Link href="/auth/login">
                        <Button variant="outline" className="w-full">Back to login</Button>
                    </Link>
                </Card>
            </div>
        );
    }

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
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetRequest} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="bg-white/50 dark:bg-slate-950/50"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg" disabled={isLoading}>
                            {isLoading ? "Sending link..." : "Send Reset Link"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-6">
                    <Link href="/auth/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
