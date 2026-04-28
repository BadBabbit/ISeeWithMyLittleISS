import React, { useRef } from 'react';
import { fetchIssData } from '../../api/iss/api';
import { IssData } from '../../api/iss/types';
import { useSatellites } from './satellites';
import Globe from 'react-globe.gl';
import styles from './Globe.module.css';
import earthImage from '../../assets/images/earth_daymap.jpg';

interface GlobeComponentProps {
    onCoordinatesSelected?: (coords: { lat: number; lon: number }) => void;
}

const GlobeComponent = ({ onCoordinatesSelected }: GlobeComponentProps) => {
    const globeEl = useRef<any>(null);
    const [issData, setIssData] = React.useState<IssData | null>(null);

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

    const [hoverCoords, setHoverCoords] = React.useState<{ lat: number; lng: number } | null>(null);

    const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!globeEl.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const coords = globeEl.current.toGlobeCoords(e.clientX - rect.left, e.clientY - rect.top);
        setHoverCoords(coords ?? null);
    }, []);

    const hoverRingData = React.useMemo(() => hoverCoords ? [hoverCoords] : [], [hoverCoords]);

    return (
        <div
            className={styles.globeContainer}
            style={{ cursor: hoverCoords ? 'crosshair' : 'default' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverCoords(null)}
        >
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
                ringsData={hoverRingData}
                ringLat="lat"
                ringLng="lng"
                ringColor={() => 'rgba(120, 220, 255, 0.7)'}
                ringMaxRadius={3}
                ringPropagationSpeed={2}
                ringRepeatPeriod={700}
                onGlobeClick={(event: any) => {
                    const { lat, lng } = event;
                    onCoordinatesSelected?.({ lat, lon: lng });
                }}
            />
        </div>
    );
};

export default GlobeComponent;