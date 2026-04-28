import React, { useRef } from 'react';
import { twoline2satrec, radiansToDegrees, eciToGeodetic, gstime, propagate } from 'satellite.js';
import { SatData } from './satellite';
import { fetchIssData } from '../../api/iss/api';
import { IssData } from '../../api/iss/types';
import Globe from 'react-globe.gl';
import styles from './Globe.module.css';
import earthImage from '../../assets/images/earth_daymap.jpg';

const GlobeComponent = () => {
    const globeEl = useRef<any>(null);

    const [issData, setIssData] = React.useState<IssData | null>(null);
    const [issPosition, setIssPosition] = React.useState<{ lat: number; lon: number; alt: number } | null>(null);

    // useEffect hook binds the fetchIssData function to the component lifecycle, so that it runs once when the component mounts. It updates
    // the issData state with the retrieved data, which can then be used to update the globe visualisation
    React.useEffect(() => {
        let isMounted = true;

        async function getData() {
            try {
                console.log("Fetching ISS data...");
                const data = await fetchIssData();
                if (isMounted) {
                    setIssData(data);
                }
            } catch (error) {
                console.error("Error fetching ISS data:", error);
            }
        }

        getData();

        return () => {
            isMounted = false;
        };
    }, []);

    const EARTH_RADIUS_KM = 6371;
    const TIMESTEP_MS = 1000;

    // memo hook lets us effectively cache the issSatData object so we only recompute it when the issData changes (very helpful because the satellite.js
    // computations can be expensive and the TLE from the iss api changes very infrequently)
    const satrec = React.useMemo(() => {
        if (!issData) return null;

        return twoline2satrec(issData.tle_line_1, issData.tle_line_2);
    }, [issData]);

    // useEffect hook sets up a real-time update loop that calls the updateIssPosition function every second, which updates the position of the ISS on the
    // globe based on the current time and the satellite's TLE data. The requestAnimationFrame ensures that the updates are smooth
    React.useEffect(() => {
        if (!satrec) {
            return;
        }

        const updateIssPosition = () => {
            const time = new Date();
            const gmst = gstime(time);
            const eci = propagate(satrec, time);

            if (eci?.position) {
                const gdPos = eciToGeodetic(eci.position, gmst);
                setIssPosition({
                    lat: radiansToDegrees(gdPos.latitude),
                    lon: radiansToDegrees(gdPos.longitude),
                    alt: gdPos.height / EARTH_RADIUS_KM
                });
            }
        };

        updateIssPosition();
        const interval = setInterval(updateIssPosition, TIMESTEP_MS);

        return () => clearInterval(interval);
    }, [satrec]);




    // Ghost satellites: use a virtual time that advances at GHOST_SPEED_MULTIPLIER
    const GHOST_SPEED_MULTIPLIER = 100;
    const GHOST_INTERVAL_SEC = 10; // distance between each ghost
    const GHOST_WINDOW_SEC = 900; // ghost line length
    const NUM_GHOSTS = Math.floor((2 * GHOST_WINDOW_SEC) / GHOST_INTERVAL_SEC);

    // Persistent ghost offsets (in seconds)
    const [ghostOffsets, setGhostOffsets] = React.useState<number[]>(() => {
        // Evenly space ghosts from -GHOST_WINDOW_SEC to +GHOST_WINDOW_SEC (exclusive)
        return Array.from({ length: NUM_GHOSTS }, (_, i) => -GHOST_WINDOW_SEC + i * GHOST_INTERVAL_SEC);
    });

    // Animation: update ghost offsets each frame
    React.useEffect(() => {
        let animationFrame: number;
        let lastRealTime = Date.now();
        const animate = () => {
            const now = Date.now();
            const deltaReal = (now - lastRealTime) / 1000; // seconds
            lastRealTime = now;
            setGhostOffsets(prevOffsets => prevOffsets.map(offset => {
                let newOffset = offset + deltaReal * GHOST_SPEED_MULTIPLIER;
                // Wrap around if out of window
                if (newOffset > GHOST_WINDOW_SEC) newOffset -= 2 * GHOST_WINDOW_SEC;
                if (newOffset < -GHOST_WINDOW_SEC) newOffset += 2 * GHOST_WINDOW_SEC;
                return newOffset;
            }));
            animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    // Reset ghost offsets when TLE changes
    React.useEffect(() => {
        setGhostOffsets(Array.from({ length: NUM_GHOSTS }, (_, i) => -GHOST_WINDOW_SEC + i * GHOST_INTERVAL_SEC));
    }, [issData, satrec]);

    // particlesSize/particlesColor accessors receive the group (sub-array), not individual particles,
    // so size/colour are attached to the group arrays via Object.assign.
    const particlesData = React.useMemo(() => {
        if (!issData || !satrec || !issPosition) {
            return [];
        }

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

    return (
        <div className={styles.globeContainer}>
            <Globe
                ref={globeEl}
                height={800}
                width={1200}
                backgroundColor="#000011"
                showAtmosphere={true}
                atmosphereColor="lightskyblue"
                globeImageUrl={earthImage}
                particlesData={particlesData}
                particlesSize={(d: any) => d.size}
                particlesColor={(d: any) => d.color}
                particleLat="lat"
                particleLng="lon"
                particleAltitude="alt"
            />
        </div>
    )
}

export default GlobeComponent;