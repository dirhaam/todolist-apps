"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
    targetDate: string;
    color: string;
    bgColor: string;
}

export function Countdown({ targetDate, color, bgColor }: CountdownProps) {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    return (
        <div className="p-6 md:p-8 rounded-2xl text-center shadow-lg transform hover:scale-105 transition-transform duration-300" style={{ backgroundColor: bgColor, color: color }}>
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] mb-4 opacity-80">Counting Down</p>
            <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-sm mx-auto">
                <TimeBox value={timeLeft.days} label="DAYS" />
                <TimeBox value={timeLeft.hours} label="HRS" />
                <TimeBox value={timeLeft.minutes} label="MIN" />
                <TimeBox value={timeLeft.seconds} label="SEC" />
            </div>
        </div>
    );
}

function TimeBox({ value, label }: { value: number, label: string }) {
    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 flex flex-col justify-center items-center border border-white/20">
            <span className="text-xl md:text-3xl font-black font-mono leading-none">
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-[8px] md:text-[10px] mt-1 font-bold opacity-75">{label}</span>
        </div>
    );
}
