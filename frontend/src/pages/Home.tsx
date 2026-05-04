import GlobeComponent from "../components/Globe/GlobeComponent"
import MyLocationButton from "../components/MyLocationButton/MyLocationButton"

import React, { useState } from "react";

export default function Home () {

    const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lon: number } | null>(null);

    const handleLocationRetrieved = (coords: { lat: number; lon: number }) => {
        setUserCoordinates(coords);
        console.log("User coordinates in Home component: ", coords);
    };

    return (
        <>
            <p>Hello home!</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GlobeComponent onCoordinatesSelected={handleLocationRetrieved} />
            </div>
            <MyLocationButton />
        </>
    )
}