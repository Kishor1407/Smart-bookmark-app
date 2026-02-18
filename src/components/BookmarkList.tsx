'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2, ExternalLink, Hash, Bookmark as BookmarkIconSimple } from 'lucide-react'
import { Database } from '@/lib/database.types'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']

export default function BookmarkList() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
    const [refreshing, setRefreshing] = useState(false)

    // Memoize client to prevent redundant effect triggers
    const supabase = useMemo(() => createClient(), [])

    const fetchBookmarks = async (isManual = false) => {
        if (isManual) setRefreshing(true)
        else setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                setRefreshing(false)
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
        } catch (err) {
            console.error('CRITICAL FETCH ERROR:', err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        let channel: any;

        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            channel = supabase
                .channel(`realtime_bookmarks_${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'bookmarks',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload: { eventType: string; new: any; old: any }) => {
                        console.log('REALTIME EVENT RECEIVED:', payload)
                        if (payload.eventType === 'INSERT') {
                            const newBookmark = payload.new as Bookmark
                            setBookmarks((prev) => {
                                if (prev.some((b) => b.id === newBookmark.id)) return prev
                                return [newBookmark, ...prev]
                            })
                        } else if (payload.eventType === 'DELETE') {
                            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
                        } else if (payload.eventType === 'UPDATE') {
                            setBookmarks((prev) =>
                                prev.map((b) => (b.id === payload.new.id ? (payload.new as Bookmark) : b))
                            )
                        }
                    }
                )
                .subscribe((status: string) => {
                    console.log('SUBSCRIPTION STATUS:', status)
                    if (status === 'SUBSCRIBED') setStatus('connected')
                    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setStatus('error')
                })
        }

        fetchBookmarks()
        setupSubscription()

        return () => {
            if (channel) supabase.removeChannel(channel)
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

    const getSafeHostname = (url: string) => {
        try {
            return new URL(url).hostname
        } catch {
            return 'Invalid URL'
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${status === 'connected' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                        <div className={`h-2 w-2 rounded-full ${status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{status === 'connected' ? 'Real-time Live' : 'Connecting...'}</span>
                    </div>
                    <button
                        onClick={() => fetchBookmarks(true)}
                        disabled={refreshing}
                        className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                    >
                        <svg className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
                        {refreshing ? 'Syncing...' : 'Force Sync'}
                    </button>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {bookmarks.length} {bookmarks.length === 1 ? 'Bookmark' : 'Bookmarks'}
                </span>
            </div>

            {bookmarks.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Hash className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Your vault is empty</h3>
                    <p className="text-slate-500 font-medium">New bookmarks will appear here instantly.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {bookmarks.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-indigo-100 transition-all hover:-translate-y-1 flex flex-col justify-between"
                        >
                            <div className="mb-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100 transition-transform group-hover:scale-110">
                                        <BookmarkIconSimple className="h-6 w-6" />
                                    </div>
                                    <button
                                        onClick={() => handleDelete(bookmark.id)}
                                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 line-clamp-2 mb-2 leading-tight">
                                    {bookmark.title}
                                </h3>
                                <div className="bg-slate-50 inline-block px-3 py-1 rounded-lg">
                                    <p className="text-xs font-bold text-slate-400 truncate">
                                        {getSafeHostname(bookmark.url)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
                                    {new Date(bookmark.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <a
                                    href={bookmark.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-slate-900 hover:bg-indigo-600 text-white p-3.5 rounded-2xl transition-all hover:scale-110 active:scale-90 shadow-lg shadow-slate-200 group-hover:shadow-indigo-100"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
