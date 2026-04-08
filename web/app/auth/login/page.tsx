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
            await signIn("google", { callbackUrl: `/?intendedRole=${role}` });
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

            {/* 🛡️ MAIN LOGIN CARD - Cosmic Glass Aesthetic */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[400px] group transition-all duration-700"
            >
                {/* Glow layer behind card */}
                <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full scale-110 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
                
                <div className="relative bg-[#0c0c14]/40 backdrop-blur-[40px] text-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 p-10 flex flex-col items-center ring-1 ring-white/5 overflow-hidden">
                    {/* Subtle top light effect */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                    
                    {/* 🛡️ Brand Logo (OpenSchool) */}
                    <div className="mb-10 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)] mb-4 ring-2 ring-indigo-400/20 group-hover:scale-110 transition-transform duration-500">
                             <GraduationCap className="w-8 h-8 text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">OpenSchool</h1>
                        <p className="text-[10px] font-bold text-indigo-300/60 uppercase tracking-[0.3em] mt-2">Next Gen Learning Protocol</p>
                    </div>

                    <Tabs defaultValue="google" className="w-full">
                        <TabsList className="grid grid-cols-2 w-full h-12 p-1 bg-white/5 backdrop-blur-md rounded-xl mb-8 border border-white/10">
                            <TabsTrigger value="google" className="rounded-lg font-bold text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all uppercase tracking-widest gap-2">
                                <GoogleIcon /> login
                            </TabsTrigger>
                            <TabsTrigger value="email" className="rounded-lg font-bold text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all text-indigo-300 data-[state=active]:shadow-sm uppercase tracking-widest gap-2">
                                <Mail className="w-3.5 h-3.5" /> Email
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="google" className="animate-in fade-in zoom-in-95 duration-500">
                            <Button 
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-[10px] shadow-sm transition-all flex items-center justify-center gap-3 hover:shadow-indigo-500/10 active:scale-95 uppercase tracking-widest backdrop-blur-sm"
                            >
                                <GoogleIcon />
                                Institutional Authenticate
                            </Button>
                        </TabsContent>

                        <TabsContent value="email" className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300/60 ml-1">Identity</Label>
                                    <Input
                                        type="email"
                                        placeholder="user@domain.edu"
                                        className="h-12 rounded-xl bg-white/5 border border-white/10 focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-bold text-xs px-4 backdrop-blur-sm text-white placeholder:text-white/20"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300/60 ml-1">Secret Key</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-12 rounded-xl bg-white/5 border border-white/10 focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-bold text-xs px-4 backdrop-blur-sm text-white placeholder:text-white/20"
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
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] transition-all shadow-xl shadow-indigo-500/20 active:scale-95 uppercase tracking-widest"
                                >
                                    Proceed into Void
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-10 pt-8 border-t border-white/10 w-full flex flex-col items-center">
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-indigo-300/60 mb-5">Interface Protocol</p>
                        <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            {[
                                { id: "admin", icon: ShieldCheck },
                                { id: "teacher", icon: GraduationCap },
                                { id: "student", icon: Users }
                            ].map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setRole(r.id)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all speed-500 flex items-center gap-2",
                                        role === r.id 
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20" 
                                        : "text-indigo-300/70 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <r.icon className="w-3.5 h-3.5" />
                                    {r.id.charAt(0).toUpperCase() + r.id.slice(1)}
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
