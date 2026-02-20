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

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState("student");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [schoolId, setSchoolId] = useState("");
    const [securityCode, setSecurityCode] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Security check for roles
        if (role === 'admin' && securityCode !== 'ADMIN123') {
            setError("Invalid Administrator Passcode.");
            setIsLoading(false);
            return;
        }
        if (role === 'teacher' && securityCode !== 'TEACHER123') {
            setError("Invalid Teacher Verification Code.");
            setIsLoading(false);
            return;
        }

        try {
            // Call our new registration API
            const response = await fetch("/api/auth/register-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                    role,
                    phone_number: phoneNumber,
                    school_id: schoolId || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create account.");
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push("/auth/login");
            }, 3000);
        } catch (err: any) {
            console.error("REGISTER_ERROR:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md z-10 shadow-card-hover border-white/40 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800 text-center">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <CardTitle className="text-2xl font-bold">Account Created!</CardTitle>
                        <CardDescription>
                            Your account has been successfully registered with OpenSchool.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            You are being redirected to the login page. Please sign in with your new credentials.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md z-10 shadow-card-hover border-white/40 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800 transition-all duration-300">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                        <AcademicCapIcon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Join OpenSchool
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                        Create your account today
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="student" onValueChange={setRole} className="w-full mb-6">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-100/50 dark:bg-slate-800/50 p-1">
                            <TabsTrigger value="admin">Admin</TabsTrigger>
                            <TabsTrigger value="teacher">Teacher</TabsTrigger>
                            <TabsTrigger value="student">Student</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm font-medium animate-in fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    required
                                    className="bg-white/50 border-slate-200"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    required
                                    className="bg-white/50 border-slate-200"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                className="bg-white/50 border-slate-200"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {role !== 'student' && (
                            <div className="space-y-2 animate-in slide-in-from-top-1">
                                <Label htmlFor="securityCode" className="text-indigo-600 font-bold">
                                    {role === 'admin' ? 'Administrator Passcode' : 'Teacher Verification Code'}
                                </Label>
                                <Input
                                    id="securityCode"
                                    type="password"
                                    placeholder="Enter authorization code"
                                    required
                                    className="border-indigo-200 bg-indigo-50/30"
                                    value={securityCode}
                                    onChange={(e) => setSecurityCode(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+91..."
                                    className="bg-white/50 border-slate-200"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="schoolId">School ID (Optional)</Label>
                                <Input
                                    id="schoolId"
                                    placeholder="UUID"
                                    className="bg-white/50 border-slate-200"
                                    value={schoolId}
                                    onChange={(e) => setSchoolId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="bg-white/50 border-slate-200"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Sign Up"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-6">
                    <p className="text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
