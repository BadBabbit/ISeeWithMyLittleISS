import React, { useRef } from 'react';
import { fetchIssData } from '../../api/iss/api';
import { IssData } from '../../api/iss/types';
import { useSatellites } from './satellites';
import Globe from 'react-globe.gl';
import styles from './Globe.module.css';
import earthImage from '../../assets/images/earth_daymap.jpg';

const GlobeComponent = () => {
    const globeEl = useRef<any>(null);
    const [issData, setIssData] = React.useState<IssData | null>(null);
    const [coordinates, setCoordinates] = React.useState<{ lat: number; lon: number } | null>(null);

    React.useEffect(() => {
        let isMounted = true;
        async function getData() {
            try {
                console.log("Fetching ISS data...");
                const data = await fetchIssData();
                if (isMounted) setIssData(data);
            } catch (error) {
                console.error("Error fetching ISS data:", error);
            }
        }
        getData();
        return () => {
            isMounted = false;
        };
    }, []);

    const particlesData = useSatellites(issData);

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
                onGlobeClick={(event: any) => {
                    const { lat, lng } = event;
                    setCoordinates({ lat, lon: lng });
                }}
            />
        </div>
    );
};

export default GlobeComponent;