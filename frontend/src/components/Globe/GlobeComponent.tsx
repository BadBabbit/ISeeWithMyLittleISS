import React, { useRef } from 'react';
import Globe from 'react-globe.gl';
import styles from './Globe.module.css';
import earthImage from '../../assets/images/earth_daymap.jpg';

const GlobeComponent = () => {
    const globeEl = useRef<any>(null);

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
            />
        </div>
    )
}

export default GlobeComponent;