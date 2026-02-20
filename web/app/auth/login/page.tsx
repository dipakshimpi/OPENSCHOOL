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
import { signIn } from "next-auth/react";

// Google Icon Component
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState("student");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            document.cookie = `intended_role=${role}; path=/; max-age=3600; SameSite=Lax`;
            await signIn("keycloak-google", { callbackUrl: `/?intendedRole=${role}` });
        } catch (error) {
            console.error("Google Login Error:", error);
            setError("Failed to initialize Google login.");
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Call our custom Credentials provider
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl: `/?intendedRole=${role}`,
            });

            if (result?.error) {
                setError("Invalid email or password.");
                setIsLoading(false);
                return;
            }

            // Success! Set cookie for role and redirect
            document.cookie = `intended_role=${role}; path=/; max-age=3600; SameSite=Lax`;
            router.push(`/?intendedRole=${role}`);
        } catch (authError) {
            console.error("[Login] Auth Error:", authError);
            setError("An unexpected error occurred.");
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
                        Sign in to OpenSchool
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                        Access your academic dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="student"
                        onValueChange={(val) => setRole(val)}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100/50 dark:bg-slate-800/50 p-1">
                            <TabsTrigger value="admin">Admin</TabsTrigger>
                            <TabsTrigger value="teacher">Teacher</TabsTrigger>
                            <TabsTrigger value="student">Student</TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-lg animate-in fade-in">
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
                                    placeholder="your@email.com"
                                    className="bg-white/50 dark:bg-slate-950/50 border-slate-200"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/50 dark:bg-slate-950/50 border-slate-200"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-slate-200 hover:bg-slate-50"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                            >
                                <GoogleIcon />
                                Sign in with Google
                            </Button>
                        </form>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-6">
                    <p className="text-sm text-slate-500">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="text-primary font-medium hover:underline">
                            Create account
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
