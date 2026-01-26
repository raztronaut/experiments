'use client';

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

function ThemeReset() {
    const { setTheme } = useTheme()
    const mountedRef = React.useRef(false)

    React.useEffect(() => {
        // Only reset to system on the very first mount of the session (refresh)
        if (!mountedRef.current) {
            setTheme("system")
            mountedRef.current = true
        }
    }, [setTheme])

    return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider {...props}>
            <ThemeReset />
            {children}
        </NextThemesProvider>
    )
}
