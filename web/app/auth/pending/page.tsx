'use client'

import { motion } from 'framer-motion'
import { Clock, ShieldCheck, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PendingApproval() {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1e293b] border border-slate-700/50 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -ml-16 -mb-16" />

                    <div className="flex flex-col items-center text-center relative z-10">
                        {/* Status Icon */}
                        <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-blue-500/30">
                            <Clock className="w-10 h-10 text-blue-400 animate-pulse" />
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-3">Pending Approval</h1>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Your teacher account has been created successfully! To maintain school security, an administrator needs to verify and approve your account.
                        </p>

                        {/* Steps Section */}
                        <div className="w-full space-y-4 mb-8">
                            <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-left">
                                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-white">Identity Verification</p>
                                    <p className="text-xs text-slate-400">Admin is reviewing your credentials</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-left">
                                <Mail className="w-5 h-5 text-sky-400 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-white">Email Notification</p>
                                    <p className="text-xs text-slate-400">You&apos;ll receive an email once approved</p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/auth/login"
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </motion.div>

                {/* Footer Info */}
                <p className="text-center mt-8 text-slate-500 text-sm">
                    Need help? Contact school administration at <span className="text-blue-400 underline cursor-pointer">support@openschool.edu</span>
                </p>
            </div>
        </div>
    )
}
