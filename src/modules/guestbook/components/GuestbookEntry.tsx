'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import{ GuestbookForm } from './GuestbookForm';
import { toast } from 'sonner';

interface GuestbookEntryProps {
    entry: any;
    pageId: number;
    depth?: number;
    onUpdate?: () => void;
}

export function GuestbookEntry({ entry, pageId, depth = 0, onUpdate }: GuestbookEntryProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(entry.likesCount || 0);
    const [isLiking, setIsLiking] = useState(false);

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);

        try {
            const response = await fetch(`/api/guestbook-like/${entry.id}`, {
                method: 'POST',
            });

            if (!response.ok) throw new Error('Failed to like');

            const data = await response.json() as { liked: boolean };
            setLiked(data.liked);
            setLikesCount((prev: number) => data.liked ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('Error liking:', error);
            toast.error('Failed to like message');
        } finally {
            setIsLiking(false);
        }
    };

    const formatDate = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}>
            <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <p className="font-semibold text-sm">{entry.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(entry.createdAt)}</p>
                    </div>
                </div>
                
                <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{entry.message}</p>
                
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                            liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                        <span>{likesCount}</span>
                    </button>
                    
                    {depth < 3 && (
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Reply</span>
                        </button>
                    )}
                </div>

                {showReplyForm && (
                    <div className="mt-4 pt-4 border-t">
                        <GuestbookForm
                            pageId={pageId}
                            parentId={entry.id}
                            placeholder="Write a reply..."
                            onSuccess={() => {
                                setShowReplyForm(false);
                                onUpdate?.();
                            }}
                            onCancel={() => setShowReplyForm(false)}
                        />
                    </div>
                )}
            </div>

            {/* Render nested replies */}
            {entry.replies && entry.replies.length > 0 && (
                <div>
                    {entry.replies.map((reply: any) => (
                        <GuestbookEntry
                            key={reply.id}
                            entry={reply}
                            pageId={pageId}
                            depth={depth + 1}
                            onUpdate={onUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
