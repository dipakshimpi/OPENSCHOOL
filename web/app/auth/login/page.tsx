"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { auth } from "@/lib/firebase/client";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState("student");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showResend, setShowResend] = useState(false);
    const [resendStatus, setResendStatus] = useState<string | null>(null);

    useEffect(() => {
        // Clear any broken sessions when hitting the login page
        const cleanup = async () => {
            if (auth.currentUser) {
                console.log("[Login] Clearing existing session for fresh login...");
                await auth.signOut();
            }
        };
        cleanup();
    }, []);

    const handleResendEmail = async () => {
        try {
            if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
                setResendStatus("Verification email sent! Please check your inbox.");
                setShowResend(false);
            }
        } catch {
            setError("Failed to resend email. Please try again later.");
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setShowResend(false);
        setResendStatus(null);

        try {
            console.log("[Login] Attempting sign-in for:", email, "with role:", role);
            // 1. Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("[Login] Firebase sign-in successful, UID:", user.uid);

            // 2. Security Check: Email Verification
            if (!user.emailVerified) {
                console.warn("[Login] Email not verified for UID:", user.uid);
                setError("Please verify your email before logging in.");
                setShowResend(true);
                setIsLoading(false);
                return;
            }

            // 3. Get the profile data from Supabase via our secure API
            console.log("[Login] Fetching profile for UID:", user.uid);
            const token = await user.getIdToken();
            const profileResponse = await fetch(`/api/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!profileResponse.ok) {
                console.error("[Login] Profile fetch failed, status:", profileResponse.status);
                setError("Could not retrieve your profile. Please contact support.");
                setIsLoading(false);
                return;
            }

            const profile = await profileResponse.json();
            const actualRole = profile?.role;
            console.log("[Login] Profile retrieved, role in DB:", actualRole, "matching against selected:", role);

            // 4. Security Check: Enforce Role Match
            if (actualRole && actualRole !== role) {
                console.warn("[Login] Role mismatch. Expected:", role, "Actual:", actualRole);
                await auth.signOut();
                setError("Unauthorized access for this role.");
                setIsLoading(false);
                return;
            }

            // 5. Approval Checks
            console.log("[Login] Performing approval checks for:", actualRole);
            if (actualRole === 'student') {
                if (!profile?.is_admin_approved) {
                    console.log("[Login] Student pending admin approval");
                    router.push("/auth/pending?step=admin");
                    setIsLoading(false);
                    return;
                }
                if (!profile?.is_teacher_approved) {
                    console.log("[Login] Student pending teacher approval");
                    router.push("/auth/pending?step=teacher");
                    setIsLoading(false);
                    return;
                }
            }

            if (actualRole === 'teacher' && !profile?.is_approved) {
                console.log("[Login] Teacher pending approval");
                router.push("/auth/pending?step=admin");
                setIsLoading(false);
                return;
            }

            console.log("[Login] All checks passed, performing hard redirect to:", actualRole);
            window.location.href = `/${actualRole}`;
        } catch (authError: unknown) {
            console.error("[Login] Auth Error:", authError);
            setError("Invalid email or password.");
        } finally {
            setIsLoading(false);
        }
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
                                <div className="p-3 text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-lg flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
                                    <div className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center font-bold text-[10px]">!</span>
                                        {error}
                                    </div>
                                    {showResend && (
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="text-xs text-rose-600 font-bold p-0 h-auto justify-start"
                                            onClick={handleResendEmail}
                                        >
                                            Didn&apos;t receive email? Click here to resend verification.
                                        </Button>
                                    )}
                                </div>
                            )}

                            {resendStatus && (
                                <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg animate-in fade-in">
                                    {resendStatus}
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
