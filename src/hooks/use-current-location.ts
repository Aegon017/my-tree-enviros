import { useState } from "react";

export function useCurrentLocation() {
    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState<string | null>( null );

    async function getCurrentLocation() {
        setLoading( true );
        setError( null );
        return new Promise<any>( ( resolve ) => {
            navigator.geolocation.getCurrentPosition(
                async ( pos ) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${ lat }&lon=${ lng }&format=json&addressdetails=1&accept-language=en`
                    );
                    const data = await res.json();

                    resolve( { lat, lng, data } );
                    setLoading( false );
                },
                ( err ) => {
                    setError( "Unable to fetch your location" );
                    setLoading( false );
                    resolve( null );
                }
            );
        } );
    }

    return { getCurrentLocation, loading, error };
}