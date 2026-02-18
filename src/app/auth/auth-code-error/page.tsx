import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthCodeError() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
                <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <AlertCircle className="h-10 w-10 text-red-600" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">
                    Auth Error
                </h1>

                <div className="space-y-4 text-slate-600 mb-10">
                    <p className="font-medium">
                        Something went wrong during the sign-in process.
                    </p>
                    <div className="bg-slate-50 rounded-2xl p-6 text-sm text-left border border-slate-100 italic">
                        "Authentication code exchange failed or the session could not be established."
                    </div>
                </div>

                <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-8 rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                    <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    Back to Login
                </Link>

                <div className="mt-10 pt-8 border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        Tip: Ensure you are using the <br /> Correct Google account
                    </p>
                </div>
            </div>
        </div>
    )
}
