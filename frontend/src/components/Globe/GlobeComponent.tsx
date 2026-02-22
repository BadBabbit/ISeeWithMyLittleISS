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

    // useEffect hook binds the fetchIssData function to the component lifecycle, so that it runs once when the component mounts. It updates
    // the issData state with the retrieved data, which can then be used to update the globe visualisation
    React.useEffect(() => {
        async function getData() {
            try {
                console.log("Fetching ISS data...");
                const data = await fetchIssData();
                setIssData(data);
            } catch (error) {
                console.error("Error fetching ISS data:", error);
            }
        }
        getData();
    }, []);

    const EARTH_RADIUS_KM = 6371;
    const TIMESTEP = 1; // real-time update every second

    // memo hook lets us effectively cache the issSatData object so we only recompute it when the issData changes (very helpful because the satellite.js
    // computations can be expensive and TLE changes very infrequently)
    const issSatMemo: SatData | null = React.useMemo(() => {
        if (!issData) return null;
        const satrec = twoline2satrec(issData.tle_line_1, issData.tle_line_2);
        return {
            tle_line_1: issData.tle_line_1,
            tle_line_2: issData.tle_line_2,
            satrec,
            lat: NaN,
            lon: NaN,
            alt: NaN
        };
    }, [issData]);

    let time = new Date();
    const updateIssPosition = () => {
        requestAnimationFrame(updateIssPosition);
        time = new Date(+time + TIMESTEP);
        const gmst = gstime(time);
        const eci = propagate(issSatData.satrec, time);
        if (eci?.position) {
            const gdPos = eciToGeodetic(eci.position, gmst);
            issSatData.lat = radiansToDegrees(gdPos.latitude);
            issSatData.lon = radiansToDegrees(gdPos.longitude);
            issSatData.alt = gdPos.height / EARTH_RADIUS_KM;
        }
    };
    React.useEffect(() => {
        const interval = setInterval(updateIssPosition, TIMESTEP);
        return () => clearInterval(interval);
    }, [issSatMemo]);

    if (!issSatMemo) {
        return <div>Loading...</div>;
    }
    const issSatData = issSatMemo;

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
                particlesData={[[issSatData]]}
                particleLat="lat"
                particleLng="lon"
                particleAltitude="alt"
            />
        </div>
    )
}

export default GlobeComponent;