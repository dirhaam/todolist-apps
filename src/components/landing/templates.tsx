"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const templates = [
    {
        id: "wedding-classic",
        title: "Classic Floral Wedding",
        category: "Wedding",
        image: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", // Placeholder gradient
        color: "from-pink-100 to-rose-100",
    },
    {
        id: "birthday-modern",
        title: "Modern Birthday Bash",
        category: "Birthday",
        image: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        color: "from-purple-100 to-pink-100",
    },
    {
        id: "corporate-event",
        title: "Corporate Summit 2026",
        category: "Corporate",
        image: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
        color: "from-blue-100 to-cyan-100",
    },
    {
        id: "baby-shower",
        title: "Sweet Baby Shower",
        category: "Baby Shower",
        image: "linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)",
        color: "from-yellow-100 to-orange-100",
    },
];

export function Templates() {
    return (
        <section id="templates" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                            Stunning Templates
                        </h2>
                        <p className="text-lg text-gray-500">
                            Start with a professionally designed template and customize it to make it yours.
                        </p>
                    </div>
                    <Link href="/dashboard" className="hidden md:block">
                        <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 group">
                            View all templates <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map((template) => (
                        <Card key={template.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-gray-200">
                            <div className={`h-64 bg-gradient-to-br ${template.color} relative overflow-hidden`}>
                                {/* Abstract pattern placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-50 font-bold text-3xl text-gray-400 mix-blend-multiply transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                                    PREVIEW
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <div className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                                    {template.category}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                    {template.title}
                                </h3>
                                <Link href={`/dashboard/templates/${template.id}`} className="mt-4 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                                    Preview Template <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link href="/dashboard">
                        <Button variant="outline" className="w-full">
                            View all templates
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
