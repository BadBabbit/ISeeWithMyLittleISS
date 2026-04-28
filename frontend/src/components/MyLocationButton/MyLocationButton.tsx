"use client";

import React, { useState } from 'react';
import GeolocationError from '../../errors/geolocation.error';

export default function MyLocationButton() {
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lon: longitude });
                    console.log("User location: ", { lat: latitude, lon: longitude });
                },
                (error) => {
                    console.error("Error get user location: ", error);
                    throw new GeolocationError("Error getting user location", error.code.toString());
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser");
            throw new GeolocationError("Geolocation is not supported by this browser");
        } 
    };

    

    return (
        <button onClick={getUserLocation} className="my-location-button">Get My Location</button>
    );
}