"use client";

import { MouseEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
    const scrollToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">D</span>
                    </div>
                    <span className="font-bold text-xl text-gray-900">DigiInvite</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-8">
                    <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
                        Features
                    </a>
                    <a href="#templates" onClick={(e) => scrollToSection(e, "templates")} className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
                        Templates
                    </a>
                    <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
                        Todo Feature
                    </Link>
                </nav>

                <div className="flex items-center space-x-4">
                    <Link href="/dashboard" className="hidden sm:block">
                        <Button variant="ghost" className="text-gray-600 hover:text-purple-600 hover:bg-purple-50">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button className="rounded-full bg-gray-900 hover:bg-gray-800 text-white px-6">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
