import React, { FC, useState, useEffect } from 'react'
import { StatusResponse } from "../../api/status/types"
import { fetchStatus } from "../../api/status/api"
import styles from './APIStatusLight.module.css'

const StatusLight = () => {
    const [apiStatus, setApiStatus] = useState<StatusResponse | null>(null);
    useEffect(() => {
        fetchStatus()
            .then(status => setApiStatus(status))
            .catch(error => {
                console.error("Failed to fetch API status:", error);
                setApiStatus(null);
            });
    }, [])
    console.log("API Status:", apiStatus);
    let statusStyle: string = "status-light." + (apiStatus?.status ? "green" : "red");
    console.log("statusStyle:", statusStyle)
    return (
        <>
            {/* assings class dynamically based on status response */}
            <div className={`${styles[statusStyle]}`}></div>
            <p>{apiStatus?.version || "uh oh!"}</p>
        </>
    )
}

export default StatusLight