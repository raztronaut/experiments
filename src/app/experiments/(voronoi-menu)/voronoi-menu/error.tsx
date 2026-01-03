'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
error,
reset,
}: {
error: Error & { digest?: string };
reset: () => void;
}) {
useEffect(() => {
console.error(error);
}, [error]);

return (
<div className="w-full h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
    <h2 className="text-xl font-bold text-red-600">Something went wrong!</h2>
    <p className="text-muted-foreground">{error.message}</p>
    <Button onClick={()=> reset()}>
        Try again
    </Button>
</div>
);
}