"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { supabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState("student");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { data, error: authError } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError("Invalid email or password.");
            setIsLoading(false);
            return;
        }

        // Get the role from profile to verify access
        const { data: profile } = await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

        const actualRole = profile?.role;

        // Security Check: Enforce Role Match
        // We use a generic error message here to prevent role enumeration attacks
        if (actualRole && actualRole !== role) {
            await supabaseClient.auth.signOut();
            setError("Invalid email or password."); // GENERIC ERROR for security
            setIsLoading(false);
            return;
        }

        router.push(`/${actualRole}`);
        setIsLoading(false);
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md z-10 shadow-card-hover border-white/40 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800 transition-all duration-300">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                        <AcademicCapIcon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                        Sign in to access your OpenSchool dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="student"
                        onValueChange={(val) => {
                            setRole(val);
                            setEmail("");
                            setPassword("");
                            setError(null);
                        }}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100/50 dark:bg-slate-800/50 p-1">
                            <TabsTrigger value="admin" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all">Admin</TabsTrigger>
                            <TabsTrigger value="teacher" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all">Teacher</TabsTrigger>
                            <TabsTrigger value="student" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all">Student</TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                    <span className="h-4 w-4 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center font-bold text-[10px]">!</span>
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={role === "admin" ? "admin@openschool.com" : role === "teacher" ? "teacher@openschool.com" : "student@openschool.com"}
                                    className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/auth/forgot-password" className="text-xs text-primary hover:text-primary/80 font-medium">Forgot password?</Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                                />
                            </div>

                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Don&apos;t have an account?{" "}
                        <a href="/auth/register" className="text-primary font-medium hover:underline">
                            Create account
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
