import Link from 'next/link'
import '@/app/(main)/globals.css'
import NotFound404 from '@/components/experiments/404-not-found/404NotFound'

export default function NotFound() {
    return (
        <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 99999, overflow: 'hidden' }}>
            <NotFound404 />
            <div className="absolute top-6 left-6 z-[100] flex items-center justify-center p-2 rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-95">
                <Link href="/" className="px-4 py-2 bg-black/5 backdrop-blur-sm border border-black/10 rounded-full font-medium text-sm text-black/60 hover:text-black/90 hover:bg-black/10 transition-colors">
                    Return to Experiments
                </Link>
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none select-none overflow-hidden">
                <span className="text-[45vw] font-black text-black/[0.03] tracking-tighter leading-none translate-y-[-5%]">
                    404
                </span>
            </div>
        </div>
    )
}
