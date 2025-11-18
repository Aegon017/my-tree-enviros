import { useEffect, useState } from "react";
import { authStorage } from "@/lib/auth-storage";

export function useOtpTimer( initial = 60 ) {
    const [ remaining, setRemaining ] = useState( 0 );

    useEffect( () => {
        const saved = authStorage.getResendTime();
        const now = Date.now();
        if ( saved && saved > now ) setRemaining( Math.floor( ( saved - now ) / 1000 ) );
    }, [] );

    useEffect( () => {
        if ( remaining <= 0 ) return;
        const interval = setInterval( () => setRemaining( ( r ) => ( r > 1 ? r - 1 : 0 ) ), 1000 );
        return () => clearInterval( interval );
    }, [ remaining ] );

    const start = () => {
        const until = Date.now() + initial * 1000;
        authStorage.setResendTime( until );
        setRemaining( initial );
    };

    return { remaining, start };
}