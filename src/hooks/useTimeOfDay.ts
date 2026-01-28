import { useState, useEffect } from "react";

export function useTimeOfDay() {
    // Initialize with current time, but only update every minute
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Sync to the next minute start for cleaner updates
        const now = new Date();
        const secondsUntilNextMinute = 60 - now.getSeconds();

        // Initial timeout to align with minute boundary
        const timeoutId = setTimeout(() => {
            setTime(new Date());

            // Then set interval for subsequent minutes
            const intervalId = setInterval(() => {
                setTime(new Date());
            }, 60000); // Update every minute

            return () => clearInterval(intervalId);
        }, secondsUntilNextMinute * 1000);

        return () => clearTimeout(timeoutId);
    }, []);

    const hour = time.getHours();
    const isNight = hour >= 18 || hour < 6;

    return {
        time,
        hour,
        isNight
    };
}
