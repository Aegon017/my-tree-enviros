"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
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
import { Separator } from "@/components/ui/separator";
import {
    ChevronRight,
    Edit,
    MapPin,
    Plus,
    Trash2,
    User as UserIcon,
    X,
} from "lucide-react";
import {
    userService,
    type User as UserProfile,
} from "@/services/user.services";
import {
    type ShippingAddress,
    type CreateShippingAddressPayload,
} from "@/services/shipping-address.services";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(
    FilePondPluginImagePreview,
);

const profileSchema = z.object({
    name: z.string().min(1, "Name is required."),
    email: z.string().email("Invalid email address."),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const addressSchema = z.object({
    name: z.string().min(1, "Full name is required."),
    phone: z.string().min(1, "Phone number is required."),
    address: z.string().min(1, "Address is required."),
    area: z.string().min(1, "Area is required."),
    city: z.string().min(1, "City is required."),
    postal_code: z.string().min(1, "Postal code is required."),
    latitude: z.number().default(0),
    longitude: z.number().default(0),
    post_office_name: z.string().optional(),
    post_office_branch_type: z.string().optional(),
    is_default: z.boolean().default(false),
});
type AddressFormValues = z.infer<typeof addressSchema>;

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
                <p className="wrap-break-word">{address.address}</p>
                <p>
                    {address.area}, {address.city} - {address.postal_code}
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
            address: "",
            area: "",
            city: "",
            postal_code: "",
            latitude: 0,
            longitude: 0,
            post_office_name: "",
            post_office_branch_type: "",
            is_default: false,
        },
    });

    useEffect(() => {
        if (initial) {
            form.reset({
                name: initial.name,
                phone: initial.phone,
                address: initial.address,
                area: initial.area,
                city: initial.city,
                postal_code: initial.postal_code,
                latitude: initial.latitude,
                longitude: initial.longitude,
                post_office_name: initial.post_office_name ?? "",
                post_office_branch_type: initial.post_office_branch_type ?? "",
                is_default: initial.is_default,
            });
        } else {
            form.reset({
                name: "",
                phone: "",
                address: "",
                area: "",
                city: "",
                postal_code: "",
                latitude: 0,
                longitude: 0,
                post_office_name: "",
                post_office_branch_type: "",
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
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
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
                                                <FormLabel>Area</FormLabel>
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
                                        name="postal_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Postal Code</FormLabel>
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

export default function ProfilePage() {
    const { user: authUser, token } = useAuthStore();
    const isAuthenticated = !!token;

    const [tab, setTab] = useState<"profile" | "addresses">("profile");

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isEditing, setEditing] = useState(false);
    const [files, setFiles] = useState<any[]>([]);

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: "", email: "" },
    });

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
            .map((n: string) => n[0])
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
                // Reset files if needed, or set initial file if you want to show existing avatar in FilePond
                // But typically FilePond is for *new* uploads. We show existing avatar separately.
                setFiles([]);
            }
        } finally {
            setProfileLoading(false);
        }
    }, [profileForm]);

    const loadAddresses = useCallback(async () => {
        setAddrLoading(true);
        try {
            const res = await userService.getShippingAddresses();
            setAddresses(res.data?.addresses ?? []);
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
            setFiles([]);
        }
        setEditing((prev) => !prev);
    }, [isEditing, profile, profileForm]);

    const onSaveProfile = useCallback(
        async (values: ProfileFormValues) => {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("email", values.email);
            if (files.length > 0) {
                formData.append("avatar", files[0].file);
            }

            await userService.updateCurrentUser(formData);
            await loadProfile();
            setEditing(false);
        },
        [loadProfile, files],
    );

    useEffect(() => {
        if (!isAuthenticated) return;
        loadProfile();
        loadAddresses();
    }, [isAuthenticated, loadProfile, loadAddresses]);

    if (!isAuthenticated) {
        return (
            <Section>
                <EmptyState
                    icon={UserIcon}
                    title="Please sign in"
                    description="You need to be signed in to access your profile."
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
                title="My Profile"
                align="center"
                subtitle="Manage your personal information and addresses."
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
                                                    {!isEditing ? (
                                                        <Avatar className="h-20 w-20">
                                                            <AvatarImage
                                                                src={(profile as any)?.avatar_url || ""}
                                                                alt={profile?.name ?? "User"}
                                                            />
                                                            <AvatarFallback>{initials}</AvatarFallback>
                                                        </Avatar>
                                                    ) : (
                                                        <div className="w-40">
                                                            <FilePond
                                                                files={files}
                                                                onupdatefiles={setFiles}
                                                                allowMultiple={false}
                                                                maxFiles={1}
                                                                name="avatar"
                                                                labelIdle='Drag & Drop your avatar or <span class="filepond--label-action">Browse</span>'
                                                                acceptedFileTypes={["image/*"]}
                                                                stylePanelLayout="compact circle"
                                                                styleLoadIndicatorPosition="center bottom"
                                                                styleProgressIndicatorPosition="right bottom"
                                                                styleButtonRemoveItemPosition="left bottom"
                                                                styleButtonProcessItemPosition="right bottom"
                                                            />
                                                        </div>
                                                    )}

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
