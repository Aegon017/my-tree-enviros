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
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { z } from "zod";
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
import api from "@/lib/axios";
import type { ShippingAddress } from "@/types/shipping-address";
import { fetcher } from "@/lib/fetcher";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  city: z.string().min(2, "City must be at least 2 characters."),
  area: z.string().min(2, "Area must be at least 2 characters."),
  pincode: z.string().regex(/^\d{5,6}$/, "Pincode must be 5-6 digits."),
  mobile_number: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits."),
  default: z.boolean(),
});

type FormValues = z.infer<typeof formSchema> & { default: boolean };

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
          {address.default === 1 && (
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
              {address.city}, {address.area} {address.pincode}
            </p>
            <p>{address.mobile_number}</p>
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
      address: "",
      city: "",
      area: "",
      pincode: "",
      mobile_number: "",
      default: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingAddress) {
        form.reset({
          name: editingAddress.name,
          address: editingAddress.address,
          city: editingAddress.city,
          area: editingAddress.area,
          pincode: editingAddress.pincode,
          mobile_number: editingAddress.mobile_number,
          default: editingAddress.default === 1,
        });
      } else {
        form.reset({
          name: "",
          address: "",
          city: "",
          area: "",
          pincode: "",
          mobile_number: "",
          default: false,
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
          <DialogTitle>
            {editingAddress ? "Edit Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription>
            {editingAddress
              ? "Update your shipping address details."
              : "Add a new shipping address for delivery."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="Pincode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="10-digit mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="default"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
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
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="mt-2 sm:mt-0"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
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
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalSelectedId, setInternalSelectedId] = useState<number | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const selectedAddressId =
    externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;

  const key = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/shipping-addresses`;
  const { data, error, isLoading } = useSWR<{
    status: boolean;
    message: string;
    data: ShippingAddress[];
  }>( key, fetcher );

  const addresses = useMemo( () => data?.data || [], [ data?.data ] );

  useEffect(() => {
    if (addresses.length === 1 && selectedAddressId === null) {
      const singleAddress = addresses[0];
      setInternalSelectedId(singleAddress.id);
      onSelect?.(singleAddress.id);
    }
  }, [addresses, selectedAddressId, onSelect]);

  useEffect(() => {
    if (addresses.length >= 2 && selectedAddressId === null) {
      const defaultAddress = addresses.find((a) => a.default === 1);
      if (defaultAddress) {
        setInternalSelectedId(defaultAddress.id);
        onSelect?.(defaultAddress.id);
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
      if (!data) return;

      const optimistic = {
        ...data,
        data: data.data.filter((a) => a.id !== id),
      };

      try {
        await mutate(
          key,
          async (current: typeof data | undefined) => {
            if (!current) return current;

            await api.delete(`/shipping-addresses/${id}`);

            return {
              ...current,
              data: current.data.filter((a) => a.id !== id),
            };
          },
          {
            optimisticData: optimistic,
            rollbackOnError: true,
            populateCache: true,
            revalidate: false,
          },
        );

        toast.success("Address deleted successfully.");
        if (selectedAddressId === id) {
          const newSelectedId = null;
          setInternalSelectedId(newSelectedId);
          onSelect?.(newSelectedId);
        }
      } catch (error) {
        toast.error("Failed to delete address.");
      } finally {
        setDeleteId(null);
      }
    },
    [data, selectedAddressId, onSelect, key],
  );

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const payload = { ...values, default: values.default ? 1 : 0 };

    try {
      const url = editingAddress
        ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/v1/shipping-address/${editingAddress.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/v1/shipping-address`;
      const method = editingAddress ? "PUT" : "POST";

      if (editingAddress && data) {
        const optimisticAddress = {
          ...editingAddress,
          ...values,
          default: payload.default,
        };
        const optimistic = {
          ...data,
          data: data.data.map((a) =>
            a.id === editingAddress.id ? optimisticAddress : a,
          ),
        };

        await mutate(
          key,
          async (current: typeof data | undefined) => {
            if (!current) return current;

            const response = await fetch(url, {
              method,
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.message || "Operation failed");
            }

            return {
              ...current,
              data: current.data.map((a) =>
                a.id === editingAddress.id ? result.data : a,
              ),
            };
          },
          {
            optimisticData: optimistic,
            rollbackOnError: true,
            populateCache: true,
            revalidate: false,
          },
        );

        toast.success("Address updated successfully.");
      } else {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
          toast.success("Address added successfully.");
          mutate(
            key,
            (current: typeof data | undefined) => {
              if (!current) return current;
              return { ...current, data: [...current.data, result.data] };
            },
            { revalidate: false },
          );
        } else {
          throw new Error(result.message || "Operation failed");
        }
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
        <p className="text-destructive">
          Failed to load addresses. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Shipping Addresses</h1>
        <Button
          onClick={handleAddNewAddress}
          className="w-full sm:w-auto"
          size="sm"
        >
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
              This action cannot be undone. This will permanently delete this
              address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
