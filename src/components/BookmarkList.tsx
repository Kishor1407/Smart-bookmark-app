'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2, ExternalLink, Hash, Bookmark as BookmarkIconSimple } from 'lucide-react'
import { Database } from '@/lib/database.types'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']

export default function BookmarkList() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchBookmarks = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('FETCH ERROR:', error)
            } else {
                setBookmarks(data || [])
            }
            setLoading(false)
        }

        fetchBookmarks()

        const channel = supabase
            .channel('realtime bookmarks')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setBookmarks((prev) => [payload.new as Bookmark, ...prev])
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
                    } else if (payload.eventType === 'UPDATE') {
                        setBookmarks((prev) =>
                            prev.map((b) => (b.id === payload.new.id ? (payload.new as Bookmark) : b))
                        )
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const handleDelete = async (id: string) => {
        const originalBookmarks = [...bookmarks]
        setBookmarks(bookmarks.filter((b) => b.id !== id))

        const { error } = await supabase.from('bookmarks').delete().eq('id', id)

        if (error) {
            setBookmarks(originalBookmarks)
            alert('Failed to delete bookmark')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
            </div>
        )
    }

    if (bookmarks.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <Hash className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-1">Your vault is empty</h3>
                <p className="text-slate-500">New bookmarks will appear here instantly.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bookmark) => (
                <div
                    key={bookmark.id}
                    className="fade-up group bg-white p-6 rounded-3xl card-shadow transition-all hover:border-indigo-500 hover:ring-4 hover:ring-indigo-50 flex flex-col justify-between"
                >
                    <div className="mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                                <BookmarkIconSimple className="h-6 w-6" />
                            </div>
                            <button
                                onClick={() => handleDelete(bookmark.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 line-clamp-2 mb-2">
                            {bookmark.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 truncate">
                            {new URL(bookmark.url).hostname}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(bookmark.created_at).toLocaleDateString()}
                        </span>
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-900 hover:bg-indigo-600 text-white p-3 rounded-2xl transition-all hover:scale-105"
                        >
                            <ExternalLink className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            ))}
        </div>
    )
}
