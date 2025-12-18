"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Initiative,
  InitiativeSite,
  initiativeService,
} from "@/services/initiative.service";

interface InitiativeSiteSelectorProps {
  onSelect: (site: InitiativeSite | null) => void;
  selectedSiteId?: number | null;
}

export function InitiativeSiteSelector({
  onSelect,
  selectedSiteId,
}: InitiativeSiteSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [initiatives, setInitiatives] = React.useState<Initiative[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const loadInitiatives = async () => {
      setLoading(true);
      try {
        const res = await initiativeService.getAll();
        if (res.success) {
          setInitiatives(res.data?.initiatives ?? []);
        }
      } catch (error) {
        console.error("Failed to load initiatives", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitiatives();
  }, []);

  const selectedSite = React.useMemo(() => {
    if (!selectedSiteId) return null;
    for (const initiative of initiatives) {
      const site = initiative.sites.find((s) => s.id === selectedSiteId);
      if (site) return site;
    }
    return null;
  }, [initiatives, selectedSiteId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading sites...</span>
            </div>
          ) : selectedSite ? (
            selectedSite.label
          ) : (
            "Select a planting site..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search site..." />
          <CommandList>
            <CommandEmpty>No site found.</CommandEmpty>
            <CommandGroup>
              {initiatives.map((initiative) => (
                <React.Fragment key={initiative.id}>
                  {initiative.sites.map((site) => (
                    <CommandItem
                      key={site.id}
                      value={`${initiative.name} - ${site.label}`}
                      onSelect={() => {
                        onSelect(site);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedSiteId === site.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{site.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {initiative.name}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </React.Fragment>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
