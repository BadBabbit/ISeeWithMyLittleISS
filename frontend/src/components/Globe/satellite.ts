export interface SatData {
    tle_line_1: string;
    tle_line_2: string;
    satrec: any; // type is not exported by satellite.js
    lat: number;
    lon: number;
    alt: number;
}