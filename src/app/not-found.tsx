import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-background font-sans antialiased text-foreground">
                <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                    <h2 className="text-4xl font-bold mb-4 tracking-tight">404</h2>
                    <p className="text-muted-foreground mb-8 max-w-md">
                        This experiment doesn&apos;t exist or has been removed.
                    </p>
                    <Button asChild>
                        <Link href="/">Back to Experiments</Link>
                    </Button>
                </div>
            </body>
        </html>
    )
}
