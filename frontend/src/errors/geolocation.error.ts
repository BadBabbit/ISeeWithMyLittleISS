// for errors related to geolocation retrieval and permissions
export default class GeolocationError extends Error {
    constructor(message: string, public field?: string) {
        super(message);
        this.name = "GeolocationError";
        Object.setPrototypeOf(this, GeolocationError.prototype);
    }
}