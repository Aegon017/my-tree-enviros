"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLocation } from "@/hooks/use-location";
import AddressForm from "./address-form";

type Props = {
    open: boolean;
    onOpenChange: ( v: boolean ) => void;
};

export default function LocationModal( { open, onOpenChange }: Props ) {
    const { selectedLocation } = useLocation();

    return (
        <Sheet open={ open } onOpenChange={ onOpenChange }>
            <SheetContent side="bottom" className="max-h-[85vh] pb-6">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>{ selectedLocation ? "Update location" : "Set your location" }</SheetTitle>
                </SheetHeader>
                <div className="p-4 overflow-y-auto">
                    <AddressForm onSaved={ () => onOpenChange( false ) } />
                </div>
            </SheetContent>
        </Sheet>
    );
}