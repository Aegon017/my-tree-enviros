"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reverseGeocode,
  getPostOffices,
  saveShippingAddress,
} from "@/lib/apiAddress";
import MapPicker from "./map-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLocationStore } from "@/store/location-store";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { Crosshair, Loader2 } from "lucide-react";

const AddressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(3),
  area: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  post_office_name: z.string().optional(),
  post_office_branch_type: z.string().optional(),
});

type AddressInputs = z.infer<typeof AddressSchema>;

export default function AddressForm({ onSaved }: { onSaved?: () => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [postOffices, setPostOffices] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const { setLocation } = useLocationStore();
  const { isAuthenticated } = useAuth();
  const { getCurrentLocation, loading: geoLoading } = useCurrentLocation();

  const form = useForm<AddressInputs>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      area: "",
      city: "",
      postal_code: "",
      post_office_name: "",
      post_office_branch_type: "",
    },
  });

  useEffect(() => {
    handleDetectLocation();
  }, []);

  async function handleDetectLocation() {
    const loc = await getCurrentLocation();
    if (loc) {
      setPosition([Number(loc.lat), Number(loc.lng)]);
    }
  }

  useEffect(() => {
    if (!position) return;
    const [lat, lng] = position;
    (async () => {
      try {
        const data = await reverseGeocode(lat, lng);
        form.setValue("area", data.area || "");
        form.setValue("city", data.city || "");
        form.setValue("postal_code", data.postal_code || "");
        form.setValue("address", data.street || ""); // Fill House/Street
        if (data.postal_code) {
          setLoadingPosts(true);
          const list = await getPostOffices(data.postal_code);
          setPostOffices(Array.isArray(list) ? list : []);
          setLoadingPosts(false);
          if (!list || list.length === 0)
            toast.error("No Post Offices found for this pincode.");
        }
      } catch {
        toast.error("Failed to reverse geocode location.");
      }
    })();
  }, [position]);

  async function onSubmit(values: AddressInputs) {
    if (!position) {
      toast.error("Please pick a location on the map.");
      return;
    }
    const selectedPO = postOffices.find(
      (p) => p.name === values.post_office_name,
    );
    const geo = {
      lat: position[0],
      lng: position[1],
      address: values.address,
      area: values.area || "",
      city: values.city || "",
      postal_code: values.postal_code || "",
      post_office_name: values.post_office_name || selectedPO?.name || "",
      post_office_branch_type:
        values.post_office_branch_type || selectedPO?.branch_type || "",
    };
    try {
      if (isAuthenticated) {
        await saveShippingAddress({
          name: values.name,
          phone: values.phone,
          address: values.address,
          area: geo.area,
          city: geo.city,
          postal_code: geo.postal_code,
          latitude: geo.lat,
          longitude: geo.lng,
          post_office_name: geo.post_office_name,
          post_office_branch_type: geo.post_office_branch_type,
          is_default: true,
        });
      }
      setLocation(geo);
      toast.success("Location saved");
      onSaved?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save address");
    }
  }

  return (
    <div className="space-y-4 p-4">
      <MapPicker position={position} onChange={setPosition} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>House / Street</FormLabel>
                <FormControl>
                  <Input placeholder="Flat No, Street" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl>
                    <Input readOnly {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input readOnly {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <Input readOnly {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="post_office_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Office</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Post Office" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingPosts && (
                      <SelectItem value="loading">Loading...</SelectItem>
                    )}
                    {!loadingPosts &&
                      postOffices
                        .filter((po) => po.name && po.name.trim() !== "")
                        .map((po) => (
                          <SelectItem key={po.name} value={po.name}>
                            {po.name} — {po.branch_type}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Location"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
