import { StatusResponse } from "./types";

export async function fetchStatus(): Promise<StatusResponse> {
    const response = await fetch("/api/status")
    if (!response.ok) {
        throw new Error(`ISS API error: ${response.status}`);
    }
    const data: StatusResponse = await response.json();
    return data;
}