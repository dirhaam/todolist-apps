"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitRsvpAction } from "@/modules/pages/actions/rsvp.actions";

interface RsvpFormProps {
    title: string;
    description: string;
    pageId: number;
}

export function RsvpForm({ title, description, pageId }: RsvpFormProps) {
    const [isPending, startTransition] = useTransition();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            try {
                await submitRsvpAction(formData, pageId);
                setIsSubmitted(true);
                toast.success("Thank you for your RSVP!");
            } catch (error) {
                toast.error("Something went wrong. Please try again.");
                console.error(error);
            }
        });
    };

    if (isSubmitted) {
        return (
            <div className="p-8 bg-green-50 rounded-2xl border border-green-200 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    🎉
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Thank You!</h3>
                <p className="text-green-700">Your RSVP has been received.</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto">
            <div className="text-center mb-6">
                <h3 className="font-bold text-2xl text-gray-900 mb-2 serif-font">{title}</h3>
                <p className="text-gray-500 text-sm">{description}</p>
            </div>

            <form action={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="E.g. John Doe & Partner" required className="bg-white" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Will you attend?</Label>
                    <div className="relative">
                        <select
                            id="status"
                            name="status"
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            <option value="attending">Yes, I will attend</option>
                            <option value="not_attending">Sorry, I can't come</option>
                            <option value="maybe">Maybe / Unsure</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea id="message" name="message" placeholder="Wishes for the couple..." className="bg-white resize-none" rows={3} />
                </div>

                <Button type="submit" className="w-full h-11 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02]" disabled={isPending}>
                    {isPending ? "Sending..." : "Send Confirmation"}
                </Button>
            </form>
        </div>
    );
}
