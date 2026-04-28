import React from 'react';
import { twoline2satrec, radiansToDegrees, eciToGeodetic, gstime, propagate } from 'satellite.js';
import { IssData } from '../../api/iss/types';
import { SatData } from './satellite.type';

const EARTH_RADIUS_KM = 6371;
const TIMESTEP_MS = 1000;
const GHOST_SPEED_MULTIPLIER = 100;
const GHOST_INTERVAL_SEC = 10;
const GHOST_WINDOW_SEC = 900;
const NUM_GHOSTS = Math.floor((2 * GHOST_WINDOW_SEC) / GHOST_INTERVAL_SEC);

export function useSatellites(issData: IssData | null) {
    const satrec = React.useMemo(() => {
        if (!issData) return null;
        return twoline2satrec(issData.tle_line_1, issData.tle_line_2);
    }, [issData]);

    const [issPosition, setIssPosition] = React.useState<{ lat: number; lon: number; alt: number } | null>(null);

    React.useEffect(() => {
        if (!satrec) return;

        const updateIssPosition = () => {
            const time = new Date();
            const gmst = gstime(time);
            const eci = propagate(satrec, time);
            if (eci?.position) {
                const gdPos = eciToGeodetic(eci.position, gmst);
                setIssPosition({
                    lat: radiansToDegrees(gdPos.latitude),
                    lon: radiansToDegrees(gdPos.longitude),
                    alt: gdPos.height / EARTH_RADIUS_KM,
                });
            }
        };

        updateIssPosition();
        const interval = setInterval(updateIssPosition, TIMESTEP_MS);
        return () => clearInterval(interval);
    }, [satrec]);

    const [ghostOffsets, setGhostOffsets] = React.useState<number[]>(() =>
        Array.from({ length: NUM_GHOSTS }, (_, i) => -GHOST_WINDOW_SEC + i * GHOST_INTERVAL_SEC)
    );

    React.useEffect(() => {
        let animationFrame: number;
        let lastRealTime = Date.now();
        const animate = () => {
            const now = Date.now();
            const deltaReal = (now - lastRealTime) / 1000;
            lastRealTime = now;
            setGhostOffsets(prev => prev.map(offset => {
                let next = offset + deltaReal * GHOST_SPEED_MULTIPLIER;
                if (next > GHOST_WINDOW_SEC) next -= 2 * GHOST_WINDOW_SEC;
                if (next < -GHOST_WINDOW_SEC) next += 2 * GHOST_WINDOW_SEC;
                return next;
            }));
            animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    // Reset ghost positions when TLE changes
    React.useEffect(() => {
        setGhostOffsets(Array.from({ length: NUM_GHOSTS }, (_, i) => -GHOST_WINDOW_SEC + i * GHOST_INTERVAL_SEC));
    }, [issData, satrec]);

    return React.useMemo(() => {
        if (!issData || !satrec || !issPosition) return [];

        const issGroup = Object.assign(
            [{
                tle_line_1: issData.tle_line_1,
                tle_line_2: issData.tle_line_2,
                satrec,
                lat: issPosition.lat,
                lon: issPosition.lon,
                alt: issPosition.alt,
            }],
            { size: 3.2, color: 'white' }
        );

        const ghostParticles: SatData[] = [];
        for (let i = 0; i < ghostOffsets.length; i++) {
            const offsetSec = ghostOffsets[i];
            const ghostTime = new Date(Date.now() + offsetSec * 1000);
            const gmst = gstime(ghostTime);
            const eci = propagate(satrec, ghostTime);
            if (eci?.position) {
                const gdPos = eciToGeodetic(eci.position, gmst);
                ghostParticles.push({
                    tle_line_1: issData.tle_line_1,
                    tle_line_2: issData.tle_line_2,
                    satrec,
                    lat: radiansToDegrees(gdPos.latitude),
                    lon: radiansToDegrees(gdPos.longitude),
                    alt: gdPos.height / EARTH_RADIUS_KM,
                });
            }
        }
        const ghostGroup = Object.assign(ghostParticles, { size: 1.1, color: 'yellow' });

        return [issGroup, ghostGroup];
    }, [issData, satrec, issPosition, ghostOffsets]);
}
