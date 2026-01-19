"use client";

import { CheckCircle2, Globe, Layout, Palette, Smartphone, Zap } from "lucide-react";

const features = [
    {
        name: "Responsive Design",
        description: "Your invitations look perfect on any device, from mobile phones to desktops.",
        icon: Smartphone,
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
    {
        name: "Premium Templates",
        description: "Choose from our curated collection of professionally designed templates.",
        icon: Layout,
        color: "text-purple-600",
        bg: "bg-purple-100",
    },
    {
        name: "Instant Sharing",
        description: "Share your invitations instantly via WhatsApp, Email, or Social Media with a custom link.",
        icon: Globe,
        color: "text-green-600",
        bg: "bg-green-100",
    },
    {
        name: "Customizable Themes",
        description: "Easily customize fonts, colors, and layout to match your event's theme.",
        icon: Palette,
        color: "text-pink-600",
        bg: "bg-pink-100",
    },
    {
        name: "RSVP Management",
        description: "Track guests and manage RSVPs effortlessly in real-time.",
        icon: CheckCircle2,
        color: "text-orange-600",
        bg: "bg-orange-100",
    },
    {
        name: "Fast Performance",
        description: "Built on modern tech for lightning-fast loading times everywhere.",
        icon: Zap,
        color: "text-yellow-600",
        bg: "bg-yellow-100",
    },
];

export interface FeaturesProps {
    title?: string;
    description?: string;
}

export function Features({
    title = "Everything you need for perfect invites",
    description = "We provide all the tools you need to create, manage, and share your digital invitations."
}: FeaturesProps) {
    return (
        <section id="features" className="py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-base font-semibold text-purple-600 uppercase tracking-wide">features</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        {title}
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <div key={feature.name} className="relative group bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                            <div className={`${feature.bg} ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.name}</h3>
                            <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
