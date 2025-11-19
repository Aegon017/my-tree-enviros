"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { updateUser as updateAuthUser } from "@/store/auth-slice";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  ChevronRight,
  Edit,
  Eye,
  MapPin,
  Plus,
  ShoppingCart,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import {
  userService,
  type ShippingAddress,
  type CreateShippingAddressPayload,
  type User as UserProfile,
} from "@/services/user.services";
import { orderService } from "@/services/order.services";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const addressSchema = z.object({
  name: z.string().min(1, "Full name is required."),
  phone: z.string().min(1, "Phone number is required."),
  address_line1: z.string().min(1, "Address line 1 is required."),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  pincode: z.string().min(1, "PIN code is required."),
  country: z.string().min(1, "Country is required."),
  is_default: z.boolean().default(false),
});
type AddressFormValues = z.infer<typeof addressSchema>;


type OrderLite = {
  id: number;
  order_number?: string;
  created_at?: string;
  status?: string;
  status_label?: string;
  formatted_total?: string;
  total_amount?: number;
};

type OrderDetails = {
  id: number;
  order_number?: string;
  created_at?: string;
  status?: string;
  status_label?: string;
  total_amount?: number;
  formatted_total?: string;
  items?: Array<{
    id: number;
    quantity: number;
    formatted_price?: string;
    formatted_subtotal?: string;
    item?: {
      type?: "tree" | "product" | "campaign";
      name?: string;
      sku?: string | null;
      image?: string | null;
      color?: string | null;
      size?: string | null;
      plan?: {
        name?: string | null;
        type?: string | null;
        duration?: number | null;
      } | null;
      location?: unknown;
    };
  }>;
  shipping_address?: {
    id: number;
    name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  } | null;
  coupon?: {
    id: number;
    code: string;
    type: string;
    value: number | string;
  } | null;
};

const formatCurrency = (val?: number | string) => {
  if (val == null) return "₹0.00";
  if (typeof val === "string") return val;
  return `₹${Number(val).toFixed(2)}`;
};

const formatDate = (date?: string) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
};

const OrderStatusBadge = ({
  status,
  label,
}: {
  status?: string;
  label?: string;
}) => {
  const text = label || status || "Unknown";
  const variant = useMemo(() => {
    const s = (status || "").toLowerCase();
    if (["completed", "delivered"].includes(s)) return "default" as const;
    if (["cancelled", "canceled"].includes(s)) return "destructive" as const;
    if (["pending", "processing", "shipped"].includes(s))
      return "secondary" as const;
    return "secondary" as const;
  }, [status]);
  return <Badge variant={variant}>{text}</Badge>;
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="text-center py-10">
    <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    {action}
  </div>
);

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: ShippingAddress;
  onEdit: (addr: ShippingAddress) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
}) => {
  return (
    <Card className={address.is_default ? "border-primary" : ""}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="truncate">{address.name}</span>
              {address.is_default ? (
                <Badge variant="default" className="text-xs">
                  Default
                </Badge>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onSetDefault(address.id)}
                >
                  Set as Default
                </Button>
              )}
            </CardTitle>
            <CardDescription>Shipping Address</CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(address)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(address.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="break-words">
          {[address.address_line1, address.address_line2]
            .filter(Boolean)
            .join(", ")}
        </p>
        <p>
          {address.city}, {address.state} - {address.pincode}, {address.country}
        </p>
        <p>Phone: {address.phone}</p>
      </CardContent>
    </Card>
  );
};

const AddressModal = ({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreateShippingAddressPayload, id?: number) => Promise<void>;
  initial?: ShippingAddress | null;
}) => {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      is_default: false,
    },
  });

  useEffect(() => {
    if (initial) {
      form.reset({
        name: initial.name,
        phone: initial.phone,
        address_line1: initial.address_line1,
        address_line2: initial.address_line2 ?? "",
        city: initial.city,
        state: initial.state,
        pincode: initial.pincode,
        country: initial.country,
        is_default: initial.is_default,
      });
    } else {
      form.reset({
        name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        is_default: false,
      });
    }
  }, [initial, form]);

  const handleSubmit = async (values: AddressFormValues) => {
    await onSave(values, initial?.id);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-md max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>
                  {initial ? "Edit Address" : "Add Address"}
                </CardTitle>
                <CardDescription>
                  {initial
                    ? "Update your delivery address"
                    : "Enter your delivery address"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_line1"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address_line2"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address Line 2 (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIN Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="is_default"
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
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting
                      ? "Saving..."
                      : initial
                        ? "Update Address"
                        : "Save Address"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const OrderDetailsModal = ({
  open,
  onClose,
  order,
}: {
  open: boolean;
  onClose: () => void;
  order: OrderDetails | null;
}) => {
  if (!open || !order) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-md max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Order {order.order_number || order.id}</CardTitle>
                <CardDescription>
                  Placed on {formatDate(order.created_at)}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <strong>Status: </strong>
                  <OrderStatusBadge
                    status={order.status}
                    label={order.status_label}
                  />
                </p>
                <p>
                  <strong>Total: </strong>
                  {order.formatted_total || formatCurrency(order.total_amount)}
                </p>
              </div>
              {order.shipping_address && (
                <div className="space-y-1">
                  <p className="font-medium">Shipping Address</p>
                  <p>{order.shipping_address.name}</p>
                  <p>{order.shipping_address.phone}</p>
                  <p>
                    {[
                      order.shipping_address.address_line_1,
                      order.shipping_address.address_line_2,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state} -{" "}
                    {order.shipping_address.postal_code},{" "}
                    {order.shipping_address.country}
                  </p>
                </div>
              )}
            </div>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Items</h3>
              {!order.items || order.items.length === 0 ? (
                <p className="text-muted-foreground">
                  No items found for this order.
                </p>
              ) : (
                order.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-4 p-3 border rounded-md"
                  >
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {it.item?.image ? (
                        
                        <img
                          src={it.item?.image}
                          alt={it.item?.name || "Item"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {it.item?.name || "Item"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {it.quantity}{" "}
                        {it.item?.sku ? ` • SKU: ${it.item.sku}` : ""}
                        {it.item?.color ? ` • Color: ${it.item.color}` : ""}
                        {it.item?.size ? ` • Size: ${it.item.size}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {it.formatted_subtotal || it.formatted_price || "—"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function AccountPage() {
  const dispatch = useDispatch();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  
  const [tab, setTab] = useState<"profile" | "orders" | "addresses">("profile");

  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setEditing] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
  });

  
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  
  const [addrLoading, setAddrLoading] = useState(false);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(
    null,
  );

  const initials = useMemo(() => {
    const sourceName = profile?.name || authUser?.name || "User";
    return sourceName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, [profile?.name, authUser?.name]);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await userService.getCurrentUser();
      if (res.success && res.data?.user) {
        setProfile(res.data.user);
        profileForm.reset({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
        });
        
        dispatch(
          updateAuthUser({
            name: res.data.user.name,
            email: res.data.user.email,
            phone: (res.data.user as any).mobile || (authUser?.phone ?? ""),
          }),
        );
      }
    } finally {
      setProfileLoading(false);
    }
  }, [dispatch, authUser?.phone, profileForm]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await orderService.getOrders();
      const list = res.data?.orders ?? [];
      setOrders(
        list.map((o: any) => ({
          id: o.id,
          order_number: o.order_number ?? o.order_ref ?? String(o.id),
          created_at: o.created_at,
          status: o.status,
          status_label: o.status_label ?? o.order_status,
          formatted_total:
            o.formatted_total ??
            (o.amount ? formatCurrency(o.amount) : undefined),
          total_amount: o.total_amount ?? o.amount,
        })),
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const openOrderDetails = useCallback(async (id: number) => {
    try {
      const res = await orderService.getOrderById(id);
      const o = res.data?.order as any;
      setOrderDetails({
        id: o.id,
        order_number: o.order_number ?? String(o.id),
        created_at: o.created_at,
        status: o.status,
        status_label: o.status_label,
        total_amount: o.total_amount,
        formatted_total: o.formatted_total,
        items: o.items,
        shipping_address: o.shipping_address ?? null,
        coupon: o.coupon ?? null,
      });
      setDetailsOpen(true);
    } catch {
      
    }
  }, []);

  const closeOrderDetails = useCallback(() => {
    setDetailsOpen(false);
    setOrderDetails(null);
  }, []);

  const loadAddresses = useCallback(async () => {
    setAddrLoading(true);
    try {
      const res = await userService.getShippingAddresses();
      setAddresses(res.data ?? []);
    } finally {
      setAddrLoading(false);
    }
  }, []);

  const saveAddress = useCallback(
    async (payload: CreateShippingAddressPayload, id?: number) => {
      if (id) {
        await userService.updateShippingAddress(id, payload);
      } else {
        await userService.createShippingAddress(payload);
      }
      await loadAddresses();
    },
    [loadAddresses],
  );

  const deleteAddress = useCallback(
    async (id: number) => {
      await userService.deleteShippingAddress(id);
      await loadAddresses();
    },
    [loadAddresses],
  );

  const setDefaultAddress = useCallback(
    async (id: number) => {
      await userService.setDefaultAddress(id);
      await loadAddresses();
    },
    [loadAddresses],
  );

  const toggleEdit = useCallback(() => {
    if (!isEditing && profile) {
      profileForm.reset({
        name: profile.name || "",
        email: profile.email || "",
      });
    }
    setEditing((prev) => !prev);
  }, [isEditing, profile, profileForm]);

  const onSaveProfile = useCallback(
    async (values: ProfileFormValues) => {
      await userService.updateCurrentUser(values);
      await loadProfile();
      setEditing(false);
    },
    [loadProfile],
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    loadProfile();
    loadOrders();
    loadAddresses();
  }, [isAuthenticated, loadProfile, loadOrders, loadAddresses]);

  if (!isAuthenticated) {
    return (
      <Section>
        <EmptyState
          icon={UserIcon}
          title="Please sign in"
          description="You need to be signed in to access your account."
          action={
            <Button asChild>
              <a href="/sign-in">Go to Sign In</a>
            </Button>
          }
        />
      </Section>
    );
  }

  if (profileLoading && !profile) {
    return (
      <Section>
        <div className="flex justify-center items-center min-h-64">
          <p>Loading...</p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle
        title="My Account"
        align="center"
        subtitle="Manage your profile, orders, and shipping addresses."
      />
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Account</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs
                  value={tab}
                  onValueChange={(v) => setTab(v as any)}
                  className="w-full"
                >
                  <TabsList className="flex flex-col h-auto p-2 bg-background">
                    <TabsTrigger
                      value="profile"
                      className="flex items-center gap-3 justify-start p-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-colors"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>Profile</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="orders"
                      className="flex items-center gap-3 justify-start p-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Orders</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="addresses"
                      className="flex items-center gap-3 justify-start p-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Addresses</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <Tabs value={tab} className="w-full">
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onSaveProfile)}>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                              Update your personal details
                            </CardDescription>
                          </div>
                          <Button
                            type="button"
                            variant={isEditing ? "outline" : "default"}
                            onClick={toggleEdit}
                          >
                            {isEditing ? "Cancel" : "Edit Profile"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage
                              src={(profile as any)?.avatar_url || ""}
                              alt={profile?.name}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 flex-1 text-center sm:text-left">
                            <h3 className="text-lg font-medium">
                              {profile?.name || authUser?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {profile?.email ?? authUser?.email ?? "No email"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(profile as any)?.mobile ||
                                authUser?.phone ||
                                ""}
                            </p>
                          </div>
                          <Button variant="outline" disabled>
                            <Edit className="h-4 w-4 mr-2" />
                            Change Avatar
                          </Button>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={!isEditing} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    {...field}
                                    disabled={!isEditing}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {isEditing && (
                          <div className="flex justify-end gap-2 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={toggleEdit}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={profileForm.formState.isSubmitting}
                            >
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </form>
                  </Form>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>
                          View your recent orders
                        </CardDescription>
                      </div>
                      <Button variant="outline" onClick={loadOrders}>
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <p>Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <EmptyState
                        icon={ShoppingCart}
                        title="No orders yet"
                        description="You haven't placed any orders yet."
                        action={
                          <Button asChild>
                            <a href="/store">Start Shopping</a>
                          </Button>
                        }
                      />
                    ) : (
                      <div className="space-y-3">
                        {orders.map((o) => (
                          <div
                            key={o.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md hover:bg-accent/50 transition-colors gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-3 rounded-md">
                                <ShoppingCart className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  Order #{o.order_number || o.id}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(o.created_at)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 ml-auto">
                              <div className="text-right">
                                <p className="font-semibold">
                                  {o.formatted_total ||
                                    formatCurrency(o.total_amount)}
                                </p>
                              </div>
                              <OrderStatusBadge
                                status={o.status}
                                label={o.status_label}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openOrderDetails(o.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Saved Addresses</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your delivery addresses
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingAddress(null);
                      setAddrModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </div>
                {addrLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <p>Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <EmptyState
                    icon={MapPin}
                    title="No addresses yet"
                    description="You haven't added any addresses yet."
                    action={
                      <Button onClick={() => setAddrModalOpen(true)}>
                        Add your first address
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        onEdit={(a) => {
                          setEditingAddress(a);
                          setAddrModalOpen(true);
                        }}
                        onDelete={deleteAddress}
                        onSetDefault={setDefaultAddress}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <OrderDetailsModal
        open={detailsOpen}
        onClose={closeOrderDetails}
        order={orderDetails}
      />

      <AddressModal
        open={addrModalOpen}
        onClose={() => {
          setAddrModalOpen(false);
          setEditingAddress(null);
        }}
        initial={editingAddress}
        onSave={saveAddress}
      />
    </Section>
  );
}
