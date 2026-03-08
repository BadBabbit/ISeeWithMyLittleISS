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

    const particlesData: SatData[][] = React.useMemo(() => {
        if (!issData || !satrec || !issPosition) {
            return [];
        }

        return [[{
            tle_line_1: issData.tle_line_1,
            tle_line_2: issData.tle_line_2,
            satrec,
            lat: issPosition.lat,
            lon: issPosition.lon,
            alt: issPosition.alt
        }]];
    }, [issData, satrec, issPosition]);

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
                particlesSize={1.8}
                particleLat="lat"
                particleLng="lon"
                particleAltitude="alt"
            />
        </div>
    )
}

export default GlobeComponent;