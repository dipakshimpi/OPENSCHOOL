"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, ShieldCheck, GraduationCap, Users } from "lucide-react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CosmicParallaxBg } from "@/components/parallax-cosmic-background";

// Google Icon Component
const GoogleIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
            setError("Sync failed.");
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl: `/?intendedRole=${role}`,
            });

            if (result?.error) {
                setError("Credential Mismatch");
                setIsLoading(false);
                return;
            }

            document.cookie = `intended_role=${role}; path=/; max-age=3600; SameSite=Lax`;
            router.push(`/?intendedRole=${role}`);
        } catch {
            setError("System Error");
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center p-6 relative overflow-hidden font-sans">

            {/* 🌌 Cosmic Parallax Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <CosmicParallaxBg
                    loop={true}
                    className="w-full h-full"
                />
            </div>

            {/* 🪪 MAIN LOGIN CARD - Ultra-Compact Minimal Square */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[360px] group transition-transform duration-500 hover:scale-[1.02]"
            >
                <div className="bg-background/40 backdrop-blur-2xl text-card-foreground rounded-[2.5rem] shadow-[0_60px_120px_rgba(0,0,0,0.5)] border-2 border-primary/10 p-8 flex flex-col items-center ring-1 ring-white/10">
                    
                    {/* 🛡️ Brand Logo (OpenSchool) */}
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 mb-4 group ring-4 ring-secondary">
                             <GraduationCap className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-black text-foreground tracking-tighter uppercase italic">OpenSchool</h1>
                    </div>

                    {/* 🎛️ Tabs Grid (Google / Email) */}
                    <Tabs defaultValue="google" className="w-full">
                        <TabsList className="grid grid-cols-2 w-full h-11 p-1 bg-white/5 backdrop-blur-md rounded-xl mb-6 border border-white/10">
                            <TabsTrigger value="google" className="rounded-lg font-bold text-[9px] data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all uppercase tracking-widest">
                                <GoogleIcon /> login
                            </TabsTrigger>
                            <TabsTrigger value="email" className="rounded-lg font-bold text-[9px] data-[state=active]:bg-primary/20 data-[state=active]:shadow-sm transition-all text-muted-foreground data-[state=active]:text-primary uppercase tracking-widest">
                                <Mail className="w-3.5 h-3.5 mr-2" /> Email
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="google" className="animate-in fade-in zoom-in-95 duration-500">
                            <Button 
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full h-12 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-xl font-black text-[10px] shadow-sm transition-all flex items-center justify-center gap-2 hover:shadow-lg active:scale-95 uppercase tracking-widest backdrop-blur-sm"
                            >
                                <GoogleIcon />
                                Institutional Authenticate
                            </Button>
                        </TabsContent>

                        <TabsContent value="email" className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Identity</Label>
                                    <Input
                                        type="email"
                                        placeholder="user@domain.edu"
                                        className="h-11 rounded-xl bg-white/5 border border-white/10 focus-visible:ring-2 focus-visible:ring-primary/50 font-bold text-xs px-4 backdrop-blur-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-11 rounded-xl bg-white/5 border border-white/10 focus-visible:ring-2 focus-visible:ring-primary/50 font-bold text-xs px-4 backdrop-blur-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <p className="text-[8px] font-black text-destructive text-center uppercase tracking-widest">{error}</p>
                                )}

                                <Button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black text-[10px] transition-all shadow-xl active:scale-95 uppercase tracking-widest"
                                >
                                    Proceed
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* 🛡️ Combined Access Selectors - Compact & Hierarchical */}
                    <div className="mt-8 pt-6 border-t border-border w-full flex flex-col items-center">
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Protocol Role</p>
                        <div className="flex gap-1.5 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            {[
                                { id: "admin", icon: ShieldCheck },
                                { id: "teacher", icon: GraduationCap },
                                { id: "student", icon: Users }
                            ].map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setRole(r.id)}
                                    className={cn(
                                        "px-2.5 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                        role === r.id 
                                        ? "bg-primary/20 text-primary shadow-md ring-1 ring-primary/30" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5 text-[9px]"
                                    )}
                                >
                                    <r.icon className="w-3 h-3" />
                                    {r.id === "admin" ? "Admin" : r.id === "teacher" ? "Teacher" : "Student"}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                <p className="mt-8 text-center text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
                    Institutional Hub Hub v2.5
                </p>
            </motion.div>

        </div>
    );
}
