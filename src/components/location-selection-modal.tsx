"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "@/hooks/use-location-search";
import AddressForm from "@/components/address-form";

export function LocationSelectionModal() {
  const { selectedLocation, syncFromStorage } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  useEffect(() => {
    if (!selectedLocation) {
      setOpen(true);
    }
  }, [selectedLocation]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-location-modal", handler);
    return () => window.removeEventListener("open-location-modal", handler);
  }, []);

  const handleSaved = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="
          max-w-lg 
          w-full 
          p-0 
          rounded-xl 
          flex 
          flex-col 
          max-h-[90vh]
          overflow-hidden
        "
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <ScrollArea className="w-full h-dvh overflow-hidden p-4">
          <AddressForm onSaved={handleSaved} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
