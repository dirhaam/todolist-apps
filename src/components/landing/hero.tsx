"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-white pt-16 pb-32 md:pt-24 md:pb-48">
            <div className="container mx-auto px-4 text-center relative z-10">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-purple-600 mb-8 bg-purple-50 border-purple-100">
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>The Future of Digital Invitations</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 pb-2">
                    Create Unforgettable <br />
                    <span className="text-purple-600">Digital Moments</span>
                </h1>
                <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Craft beautiful, responsive digital invitations for weddings, birthdays,
                    and corporate events in minutes. Share the joy with style.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/dashboard">
                        <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 rounded-full bg-purple-600 hover:bg-purple-700">
                            Create Invitation
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="#templates">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12 px-8 rounded-full border-gray-300">
                            View Templates
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Abstract Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 select-none pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200 blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200 blur-3xl animate-pulse delay-1000" />
            </div>
        </section>
    );
}
