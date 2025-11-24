// Cleaned component implementation as above
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Edit,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useShippingAddresses } from "@/hooks/useShippingAddresses";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ShippingAddress } from "@/types/shipping-address.types";
import { LocationPicker } from "@/components/location-picker";
import { postOfficeService, type PostOffice } from "@/services/postoffice.services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  city: z.string().min(2, "City must be at least 2 characters."),
  area: z.string().min(2, "Area must be at least 2 characters."),
  postal_code: z.string().regex(/^\d{5,6}$/, "Postal code must be 5-6 digits."),
  latitude: z.number(),
  longitude: z.number(),
  post_office_name: z.string().optional(),
  post_office_branch_type: z.string().optional(),
  is_default: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface ShippingAddressesProps {
  onSelect?: (shipping_address_id: number | null) => void;
  selectedAddressId?: number | null;
}

interface AddressCardProps {
  address: ShippingAddress;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onEdit: (address: ShippingAddress) => void;
  onDelete: (id: number) => void;
}

const AddressCard = memo(
  ({ address, isSelected, onSelect, onEdit, onDelete }: AddressCardProps) => (
    <Card
      className={`cursor-pointer transition-all gap-0 ${isSelected ? "border-primary border-2" : "hover:border-primary/50"}`}
      onClick={() => onSelect(address.id)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          {address.name}
          {isSelected && (
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {address.is_default && (
            <span className="inline-flex items-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
              Default
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6">
        <div className="flex items-start space-x-2 text-sm mb-3 sm:mb-4">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="wrap-break-words">{address.address}</p>
            <p className="wrap-break-words">
              {address.city}, {address.area} {address.postal_code}
            </p>
            <p>{address.phone}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(address);
            }}
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(address.id);
            }}
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  ),
);

const AddressForm = ({
  open,
  onOpenChange,
  editingAddress,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAddress: ShippingAddress | null;
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting: boolean;
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      city: "",
      area: "",
      postal_code: "",
      latitude: 0,
      longitude: 0,
      post_office_name: "",
      post_office_branch_type: "",
      is_default: false,
    },
  });

  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);
  const [isLoadingPostOffices, setIsLoadingPostOffices] = useState(false);

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
    if (address) {
      const parts = address.split(", ");
      if (parts.length >= 2) {
        form.setValue("city", parts[parts.length - 2] || "");
        form.setValue("area", parts[parts.length - 1] || "");
      }
    }
  };

  const handlePostalCodeChange = async (postalCode: string) => {
    if (postalCode.length === 6) {
      setIsLoadingPostOffices(true);
      try {
        const response = await postOfficeService.searchByPincode(postalCode);
        if (response.Status === "Success" && response.PostOffice) {
          setPostOffices(response.PostOffice);
          if (response.PostOffice.length > 0) {
            const firstPO = response.PostOffice[0];
            form.setValue("post_office_name", firstPO.Name);
            form.setValue("post_office_branch_type", firstPO.BranchType);
            form.setValue("city", firstPO.District);
            form.setValue("area", firstPO.State);
          }
        } else {
          setPostOffices([]);
          toast.error("No post offices found for this postal code");
        }
      } catch (error) {
        console.error("Error fetching post offices:", error);
        toast.error("Failed to fetch post office data");
      } finally {
        setIsLoadingPostOffices(false);
      }
    } else {
      setPostOffices([]);
    }
  };

  useEffect(() => {
    if (open) {
      if (editingAddress) {
        form.reset({
          name: editingAddress.name,
          phone: editingAddress.phone,
          address: editingAddress.address,
          city: editingAddress.city,
          area: editingAddress.area,
          postal_code: editingAddress.postal_code,
          latitude: editingAddress.latitude,
          longitude: editingAddress.longitude,
          post_office_name: editingAddress.post_office_name || "",
          post_office_branch_type: editingAddress.post_office_branch_type || "",
          is_default: editingAddress.is_default,
        });
      } else {
        form.reset({
          name: "",
          phone: "",
          address: "",
          city: "",
          area: "",
          postal_code: "",
          latitude: 0,
          longitude: 0,
          post_office_name: "",
          post_office_branch_type: "",
          is_default: false,
        });
      }
    }
  }, [editingAddress, form, open]);

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values);
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
          <DialogDescription>
            {editingAddress
              ? "Update your shipping address details."
              : "Add a new shipping address for delivery."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area/State</FormLabel>
                    <FormControl>
                      <Input placeholder="Area or State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Location Picker */}
            <div className="space-y-2">
              <LocationPicker
                latitude={form.watch("latitude")}
                longitude={form.watch("longitude")}
                onLocationChange={handleLocationChange}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Postal Code"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handlePostalCodeChange(e.target.value);
                        }}
                      />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="10-digit mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Post Office Selection */}
            {postOffices.length > 0 && (
              <FormField
                control={form.control}
                name="post_office_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Office</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const selected = postOffices.find((po) => po.Name === value);
                        if (selected) {
                          field.onChange(value);
                          form.setValue("post_office_branch_type", selected.BranchType);
                          form.setValue("city", selected.District);
                          form.setValue("area", selected.State);
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a post office" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {postOffices.map((po) => (
                          <SelectItem key={po.Name} value={po.Name}>
                            {po.Name} - {po.BranchType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="is_default"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set as default address</FormLabel>
                    <FormDescription>
                      This will be your primary shipping address for orders.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="mt-2 sm:mt-0">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAddress ? "Update Address" : "Add Address"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default function ShippingAddresses({
  onSelect,
  selectedAddressId: externalSelectedId,
}: ShippingAddressesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalSelectedId, setInternalSelectedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const selectedAddressId =
    externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;

  const { addresses, isLoading, error, create, update, remove, setDefault, refresh } = useShippingAddresses();

  // set initial selected address
  useEffect(() => {
    if (addresses.length === 1 && selectedAddressId === null) {
      const single = addresses[0];
      setInternalSelectedId(single.id);
      onSelect?.(single.id);
    }
  }, [addresses, selectedAddressId, onSelect]);

  useEffect(() => {
    if (addresses.length >= 2 && selectedAddressId === null) {
      const def = addresses.find((a) => a.is_default);
      if (def) {
        setInternalSelectedId(def.id);
        onSelect?.(def.id);
      }
    }
  }, [addresses, selectedAddressId, onSelect]);

  const handleSelectAddress = useCallback(
    (id: number) => {
      setInternalSelectedId(id);
      onSelect?.(id);
    },
    [onSelect],
  );

  const handleEdit = useCallback((address: ShippingAddress) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await remove(id);
        toast.success("Address deleted successfully.");
        if (selectedAddressId === id) {
          setInternalSelectedId(null);
          onSelect?.(null);
        }
      } catch (error) {
        toast.error("Failed to delete address.");
      } finally {
        setDeleteId(null);
      }
    },
    [remove, selectedAddressId, onSelect],
  );

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const payload = { ...values };
    try {
      if (editingAddress) {
        await update(editingAddress.id, payload);
        toast.success("Address updated successfully.");
      } else {
        await create(payload);
        toast.success("Address added successfully.");
      }
      setIsDialogOpen(false);
      setEditingAddress(null);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setEditingAddress(null);
    }
    setIsDialogOpen(open);
  }, []);

  const handleAddNewAddress = useCallback(() => {
    setEditingAddress(null);
    setIsDialogOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Shipping Addresses</h1>
        <Button onClick={handleAddNewAddress} className="w-full sm:w-auto" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add New Address
        </Button>
      </div>

      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddressId === address.id}
              onSelect={handleSelectAddress}
              onEdit={handleEdit}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No shipping addresses</CardTitle>
            <CardDescription>
              You haven't added any shipping addresses yet.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <AddressForm
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        editingAddress={editingAddress}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
