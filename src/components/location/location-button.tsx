"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useLocationStore } from "@/store/location-store";
import { LocationModal } from "@/components/location/location-modal";

export function LocationButton() {
    const [ open, setOpen ] = useState( false );
    const { selected, sync } = useLocationStore();

    useEffect( () => {
        sync();
    }, [ sync ] );

    const label = selected
        ? `${ selected.area || selected.city }, ${ selected.city }`
        : "Select Location";

    return (
        <>
            <Button
                variant="ghost"
                className="p-0 h-auto text-sm font-medium flex items-center hover:text-primary"
                onClick={ () => setOpen( true ) }
            >
                <MapPin className="h-4 w-4 mr-1 text-primary" />
                { label }
            </Button>

            <LocationModal open={ open } onOpenChange={ setOpen } />
        </>
    );
}
