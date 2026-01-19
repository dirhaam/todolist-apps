"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface GalleryProps {
    images: string[];
}

export function Gallery({ images }: GalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const validImages = images.filter(url => url.trim().length > 0);

    if (validImages.length === 0) return null;

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {validImages.map((url, i) => (
                    <div
                        key={i}
                        className={`overflow-hidden rounded-xl cursor-pointer group relative shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-square'}`}
                        onClick={() => setSelectedImage(url)}
                    >
                        <img
                            src={url}
                            alt={`Gallery ${i}`}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Zoomed"
                        className="max-w-full max-h-[90vh] rounded shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
