'use client';

import { useState, useEffect } from 'react';
import { GuestbookForm } from './GuestbookForm';
import { GuestbookEntry } from './GuestbookEntry';

interface GuestbookProps {
    pageId: number;
    title?: string;
    description?: string;
}

export function Guestbook({ pageId, title, description }: GuestbookProps) {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEntries = async () => {
        try {
            const response = await fetch(`/api/guestbook/${pageId}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json() as any[];
            setEntries(data);
        } catch (error) {
            console.error('Error fetching guestbook entries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [pageId]);

    return (
        <div className="w-full max-w-3xl mx-auto p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">{title || 'Guestbook'}</h2>
                {description && (
                    <p className="text-gray-600">{description}</p>
                )}
            </div>

            <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Leave a message</h3>
                <GuestbookForm
                    pageId={pageId}
                    onSuccess={fetchEntries}
                />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">
                    Messages ({entries.length})
                </h3>
                
                {loading ? (
                    <p className="text-center text-gray-500 py-8">Loading...</p>
                ) : entries.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        No messages yet. Be the first to leave a message!
                    </p>
                ) : (
                    <div className="space-y-4">
                        {entries.map((entry) => (
                            <GuestbookEntry
                                key={entry.id}
                                entry={entry}
                                pageId={pageId}
                                onUpdate={fetchEntries}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
