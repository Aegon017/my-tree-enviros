"use client";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MapPin, Crosshair } from "lucide-react";
import { useLocationStore } from "@/store/location-store";
import { useLocationSearch } from "@/hooks/use-location-search";
import { useCurrentLocation } from "@/hooks/use-current-location";

export function LocationModal( { open, onOpenChange }: { open: boolean; onOpenChange: ( v: boolean ) => void } ) {
    const [ selectedItem, setSelectedItem ] = useState<any>( null );
    const { setLocation } = useLocationStore();
    const { query, results, loading, search } = useLocationSearch();
    const { getCurrentLocation, loading: geoLoading } = useCurrentLocation();

    async function useMyLocation() {
        const loc = await getCurrentLocation();
        if ( !loc ) return;

        setLocation( {
            address: loc.data.display_name,
            area: loc.data.address.suburb || loc.data.address.neighbourhood || "",
            city: loc.data.address.city || loc.data.address.town || loc.data.address.village || "",
            lat: loc.lat,
            lng: loc.lng,
        } );

        onOpenChange( false );
    }

    function confirm() {
        if ( !selectedItem ) return;
        setLocation( {
            address: selectedItem.display_name,
            area: selectedItem.address?.suburb || selectedItem.address?.neighbourhood || "",
            city: selectedItem.address?.city || selectedItem.address?.town || selectedItem.address?.village || "",
            lat: Number( selectedItem.lat ),
            lng: Number( selectedItem.lon ),
        } );
        onOpenChange( false );
    }

    return (
        <Dialog open={ open } onOpenChange={ onOpenChange }>
            <DialogContent className="max-w-xl p-0 rounded-2xl overflow-hidden">
                <DialogHeader className="p-4 border-b bg-muted/40">
                    <DialogTitle className="text-lg">Select Your Location</DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-4">
                    <Button
                        variant="secondary"
                        className="w-full flex items-center gap-2"
                        onClick={ useMyLocation }
                        disabled={ geoLoading }
                    >
                        <Crosshair className="h-4 w-4" />
                        { geoLoading ? "Detecting..." : "Use My Current Location" }
                    </Button>

                    <Input
                        placeholder="Search for area, street, landmark..."
                        value={ query }
                        onChange={ ( e ) => search( e.target.value ) }
                        className="w-full"
                    />
                </div>

                <ScrollArea className="h-80 px-4 pb-4">
                    { loading && (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin h-6 w-6" />
                        </div>
                    ) }

                    { !loading && results.length === 0 && query && (
                        <p className="text-center text-muted-foreground py-10">No results found</p>
                    ) }

                    <div className="space-y-3">
                        { results.map( ( place ) => (
                            <button
                                key={ place.place_id }
                                className={ `w-full flex items-center gap-3 p-3 rounded-xl border text-left transition hover:bg-accent ${ selectedItem?.place_id === place.place_id ? "border-primary bg-primary/5" : "border-muted"
                                    }` }
                                onClick={ () => setSelectedItem( place ) }
                            >
                                <MapPin className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium text-sm">{ place.display_name }</p>
                                </div>
                            </button>
                        ) ) }
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-muted/40 flex justify-end">
                    <Button onClick={ confirm } disabled={ !selectedItem }>
                        Confirm Location
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}