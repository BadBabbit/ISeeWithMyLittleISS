import { IssData } from "./types";

export async function fetchIssData(): Promise<IssData> {
    const response = await fetch("/api/iss/")
    if (!response.ok) {
        throw new Error(`ISS API error: ${response.status}`);
    }
    const data: IssData = await response.json();
    return data;
}