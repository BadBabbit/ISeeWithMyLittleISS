export interface SatData {
    tle_line_1: string;
    tle_line_2: string;
    satrec: any; // type is not exported by satellite.js, but this is the object returned by twoline2satrec and used in propagate
    lat: number;
    lon: number;
    alt: number;
}