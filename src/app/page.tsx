import { createClient } from '@/utils/supabase/server'
import AddBookmark from '@/components/AddBookmark'
import BookmarkList from '@/components/BookmarkList'
import AuthButton from '@/components/AuthButton'
import { redirect } from 'next/navigation'
import { Bookmark } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* High Contrast Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Bookmark className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black premium-gradient-text tracking-tighter">
              SMARTMARKS
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Session</span>
              <span className="text-sm font-bold text-slate-900">{user.email}</span>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-32 pb-24">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* Welcome Section */}
          <section className="fade-up text-center">
            <h2 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tight mb-4">
              Elevate your <span className="premium-gradient-text">digital world.</span>
            </h2>
            <p className="text-xl text-slate-600 font-medium">
              A meticulously crafted space for your most valuable discoveries.
            </p>
          </section>

          {/* Add Form Section */}
          <section className="fade-up" style={{ animationDelay: '100ms' }}>
            <AddBookmark />
          </section>

          {/* List Section */}
          <section className="fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Your Vault</h3>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            <BookmarkList />
          </section>
        </div>
      </main>

      {/* Brand Bar */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
    </div>
  )
}
