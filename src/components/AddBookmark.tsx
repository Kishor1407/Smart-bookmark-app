'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Loader2, Link as LinkIcon, Type } from 'lucide-react'

export default function AddBookmark() {
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url || !title) return

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase.from('bookmarks').insert({
                title,
                url,
                user_id: user.id,
            })

            if (error) {
                alert('Error adding bookmark: ' + error.message)
            } else {
                setUrl('')
                setTitle('')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 card-shadow shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                New Bookmark
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
                <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Bookmark Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-medium"
                        required
                    />
                </div>

                <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="url"
                        placeholder="https://..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-medium"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-slate-950 text-white font-bold px-10 py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Collect</span>}
                </button>
            </div>
        </form>
    )
}
