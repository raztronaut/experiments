"use client";

import { useState, useEffect } from 'react';

export interface TransitTrip {
    id: string;
    trainNumber: string;
    destination: string;
    arrivalTime: string;
    status: 'ON TIME' | 'DELAYED' | 'BOARDING' | 'DEPARTED';
    gate: string;
}

const CALTRAIN_MOCK: TransitTrip[] = [
    { id: 'c1', trainNumber: '305', destination: 'SAN JOSE', arrivalTime: '18:15', status: 'ON TIME', gate: '1' },
    { id: 'c2', trainNumber: '307', destination: 'TAMIEN', arrivalTime: '18:45', status: 'DELAYED', gate: '2' },
    { id: 'c3', trainNumber: '401', destination: 'SAN JOSE', arrivalTime: '19:05', status: 'BOARDING', gate: '1' },
    { id: 'c4', trainNumber: '403', destination: 'TAMIEN', arrivalTime: '19:35', status: 'ON TIME', gate: '3' },
    { id: 'c5', trainNumber: '102', destination: 'SAN FRANCISCO', arrivalTime: '18:22', status: 'DEPARTED', gate: '4' },
];

const TTC_MOCK: TransitTrip[] = [
    { id: 't1', trainNumber: 'L1', destination: 'FINCH', arrivalTime: '22:18', status: 'ON TIME', gate: 'S' },
    { id: 't2', trainNumber: '504', destination: 'BROADVIEW', arrivalTime: '22:20', status: 'BOARDING', gate: 'W' },
    { id: 't3', trainNumber: 'L1', destination: 'VAUGHAN', arrivalTime: '22:22', status: 'ON TIME', gate: 'N' },
    { id: 't4', trainNumber: '510', destination: 'UNION', arrivalTime: '22:25', status: 'DELAYED', gate: 'E' },
    { id: 't5', trainNumber: 'L2', destination: 'KIPLING', arrivalTime: '22:28', status: 'ON TIME', gate: 'W' },
];

export function useTransitData(agency: string = 'caltrain') {
    const [data, setData] = useState<TransitTrip[]>([]);
    const [loading, setLoading] = useState(true);
    const [prevAgency, setPrevAgency] = useState(agency);

    if (agency !== prevAgency) {
        setPrevAgency(agency);
        setLoading(true);
    }

    useEffect(() => {
        // Simulate initial fetch with a slight delay
        const timer = setTimeout(() => {
            setData(agency === 'ttc' ? TTC_MOCK : CALTRAIN_MOCK);
            setLoading(false);
        }, 800);

        // Simulate occasional updates or status changes
        const interval = setInterval(() => {
            setData(current =>
                current.map(trip => {
                    if (Math.random() > 0.85) {
                        const statuses: TransitTrip['status'][] = ['ON TIME', 'DELAYED', 'BOARDING', 'DEPARTED'];
                        return { ...trip, status: statuses[Math.floor(Math.random() * statuses.length)] };
                    }
                    return trip;
                })
            );
        }, 12000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [agency]);

    return { data, loading };
}
