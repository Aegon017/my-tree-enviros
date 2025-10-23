"use client";
import api from "@/lib/axios";
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
  User,
  MapPin,
  Edit,
  Plus,
  ShoppingCart,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";

// Type definitions (streamlined)
interface UserProfile {
  id: number;
  name: string;
  email: string;
  mobile: string;
  mobile_prefix: string;
  profile_image_url: string;
  referral_code: string;
}

interface OrderLog {
  id: number;
  tree_name: string;
  quantity: number;
  price: string;
  tree: {
    id: number;
    name: string;
    main_image_url: string;
  };
}

interface AdoptedTree {
  id: number;
  adopted_tree: {
    id: number;
    name: string;
    main_image_url: string;
    age: string;
  };
  subscription_start: string;
  subscription_end: string;
  status: string;
}

interface PaymentDetails {
  id: number;
  razorpay_payment_id: string;
  method: string;
  bank?: string;
  status: string;
  amount: string;
  currency: string;
  fee?: string;
  tax?: string;
}

interface Order {
  id: number;
  order_ref: string;
  amount: string;
  order_status: string;
  payment_status: string;
  created_at: string;
  order_logs?: OrderLog[];
}

interface OrderDetail extends Order {
  user: UserProfile;
  payment_details: PaymentDetails;
  adopted_trees?: AdoptedTree[];
}

interface Address {
  id: number;
  name: string;
  address: string;
  city: string;
  area: string;
  pincode: string;
  mobile_number: string;
  default: number;
}

type AddressFormData = Omit<
  Address,
  "id" | "user_id" | "created_at" | "updated_at"
>;

// API base URL
const API_BASE_URL = "https://arboraid.co/beta/public/api";

// Optimized Status Badge
const OrderStatusBadge = ({ status }: { status: string }) => {
  const config = useMemo(
    () =>
      ({
        paid: { variant: "default" as const, icon: CheckCircle, text: "Paid" },
        processing: {
          variant: "secondary" as const,
          icon: Clock,
          text: "Processing",
        },
        cancelled: {
          variant: "destructive" as const,
          icon: X,
          text: "Cancelled",
        },
        delivered: {
          variant: "default" as const,
          icon: CheckCircle,
          text: "Delivered",
        },
      })[status] || {
        variant: "secondary" as const,
        icon: Clock,
        text: status,
      },
    [status],
  );

  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
};

// Optimized Order Item
const OrderItem = ({
  order,
  onViewDetails,
}: {
  order: Order;
  onViewDetails: (order: Order) => void;
}) => {
  const totalItems = useMemo(
    () => order.order_logs?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    [order.order_logs],
  );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{order.order_ref}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            {new Date(order.created_at).toLocaleDateString()}
          </div>
          {order.order_logs?.length ? (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {order.order_logs[0].tree_name}
              {totalItems > 1 && ` + ${totalItems - 1} more`}
            </p>
          ) : null}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-semibold">₹{parseFloat(order.amount).toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">
          {totalItems} item{totalItems !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <OrderStatusBadge status={order.order_status} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(order)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
      </div>
    </div>
  );
};

// Order Details Modal (optimized with memoized sections)
const OrderDetailsModal = ({
  order,
  isOpen,
  onClose,
}: {
  order: OrderDetail | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !order) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Order Details - {order.order_ref}</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p>
                    <strong>Order Reference:</strong> {order.order_ref}
                  </p>
                  <p className="flex items-center gap-2">
                    <strong>Order Status:</strong>{" "}
                    <OrderStatusBadge status={order.order_status} />
                  </p>
                  <p className="flex items-center gap-2">
                    <strong>Payment Status:</strong>{" "}
                    <OrderStatusBadge status={order.payment_status} />
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    <strong>Total Amount:</strong> ₹
                    {parseFloat(order.amount).toFixed(2)}
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {order.payment_details?.method || "N/A"}
                  </p>
                  {order.payment_details?.bank && (
                    <p>
                      <strong>Bank:</strong> {order.payment_details.bank}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Separator />
            {order.order_logs?.length ? (
              <div>
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.order_logs.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <img
                        src={item.tree.main_image_url}
                        alt={item.tree.name}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.tree_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold flex-shrink-0">
                        ₹{parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {order.adopted_trees?.length ? (
              <div>
                <h3 className="text-lg font-semibold mb-3">Adopted Trees</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.adopted_trees.map((adoption) => (
                    <Card key={adoption.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={adoption.adopted_tree.main_image_url}
                            alt={adoption.adopted_tree.name}
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {adoption.adopted_tree.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Age: {adoption.adopted_tree.age} years
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Status:{" "}
                              <Badge
                                variant={
                                  adoption.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {adoption.status}
                              </Badge>
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 text-sm">
                          <p>
                            Subscription:{" "}
                            {new Date(
                              adoption.subscription_start,
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              adoption.subscription_end,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}
            {order.payment_details && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <p>
                      <strong>Payment ID:</strong>{" "}
                      {order.payment_details.razorpay_payment_id}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₹
                      {parseFloat(order.payment_details.amount).toFixed(2)}
                    </p>
                    <p>
                      <strong>Currency:</strong>{" "}
                      {order.payment_details.currency}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <strong>Method:</strong> {order.payment_details.method}
                    </p>
                    {order.payment_details.fee && (
                      <p>
                        <strong>Fee:</strong> ₹
                        {parseFloat(order.payment_details.fee).toFixed(2)}
                      </p>
                    )}
                    {order.payment_details.tax && (
                      <p>
                        <strong>Tax:</strong> ₹
                        {parseFloat(order.payment_details.tax).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Optimized Address Card
const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
}) => (
  <Card className={address.default ? "border-primary" : ""}>
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="truncate">{address.name}</span>
            {address.default ? (
              <Badge variant="default" className="text-xs flex-shrink-0">
                Default
              </Badge>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs flex-shrink-0"
                onClick={() => onSetDefault(address.id)}
              >
                Set as Default
              </Button>
            )}
          </CardTitle>
          <CardDescription>Shipping Address</CardDescription>
        </div>
        <div className="flex gap-1 flex-shrink-0">
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
      <p className="break-words">{address.address}</p>
      <p>
        {address.city}, {address.area} - {address.pincode}
      </p>
      <p>Mobile: {address.mobile_number}</p>
    </CardContent>
  </Card>
);

// Address Modal (with form validation)
const AddressModal = ({
  isOpen,
  onClose,
  address,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  address: Address | null;
  onSave: (data: AddressFormData) => void;
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    name: "",
    address: "",
    city: "",
    area: "",
    pincode: "",
    mobile_number: "",
    default: 0,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name,
        address: address.address,
        city: address.city,
        area: address.area,
        pincode: address.pincode,
        mobile_number: address.mobile_number,
        default: address.default,
      });
    } else {
      setFormData({
        name: "",
        address: "",
        city: "",
        area: "",
        pincode: "",
        mobile_number: "",
        default: 0,
      });
    }
  }, [address]);

  const handleChange =
    (key: keyof AddressFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, default: e.target.checked ? 1 : 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  {address ? "Edit Address" : "Add New Address"}
                </CardTitle>
                <CardDescription>
                  {address
                    ? "Update your delivery address"
                    : "Enter a new delivery address"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange("name")}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile_number">Mobile Number</Label>
                  <Input
                    id="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleChange("mobile_number")}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={handleChange("address")}
                    placeholder="Enter street address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={handleChange("city")}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">State/Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={handleChange("area")}
                    placeholder="Enter state or area"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={handleChange("pincode")}
                    placeholder="Enter PIN code"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="default"
                  checked={formData.default === 1}
                  onChange={handleCheckbox}
                  className="rounded"
                />
                <Label htmlFor="default" className="text-sm">
                  Set as default address
                </Label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {address ? "Update Address" : "Save Address"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// API hook (optimized with memoized headers)
const useApi = () => {
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("authToken");
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }, []);

  const handleApiError = useCallback((error: unknown, message: string) => {
    console.error(message, error);
    alert(message);
  }, []);

  return { getAuthHeaders, handleApiError };
};

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { getAuthHeaders, handleApiError } = useApi();

  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/user`);
      const data = res.data;
      if (data.status && data.data?.[0]) {
        const user = data.data[0];
        setUserProfile(user);
        setEditForm({ name: user.name, email: user.email });
      }
    } catch (err) {
      handleApiError(err, "Error fetching user profile");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, handleApiError]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.status && data.data.orders) setOrders(data.data.orders);
    } catch (err) {
      handleApiError(err, "Error fetching orders");
    } finally {
      setOrdersLoading(false);
    }
  }, [getAuthHeaders, handleApiError]);

  const fetchAddresses = useCallback(async () => {
    setAddressesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/shipping-addresses`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.status && data.data) setAddresses(data.data);
    } catch (err) {
      handleApiError(err, "Error fetching addresses");
    } finally {
      setAddressesLoading(false);
    }
  }, [getAuthHeaders, handleApiError]);

  const fetchOrderDetails = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`${API_BASE_URL}/order/${id}`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.status && data.data.order_details) {
          setSelectedOrder(data.data);
          setIsOrderModalOpen(true);
        }
      } catch (err) {
        handleApiError(err, "Error fetching order details");
      }
    },
    [getAuthHeaders, handleApiError],
  );

  const saveAddress = useCallback(
    async (data: AddressFormData) => {
      const url = editingAddress
        ? `${API_BASE_URL}/shipping-addresses/${editingAddress.id}`
        : `${API_BASE_URL}/shipping-addresses`;
      const method = editingAddress ? "PUT" : "POST";
      try {
        const res = await fetch(url, {
          method,
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        const resp = await res.json();
        if (resp.status) {
          fetchAddresses();
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        } else {
          alert(`Failed to save address: ${resp.message || "Unknown error"}`);
        }
      } catch (err) {
        handleApiError(err, "Error saving address");
      }
    },
    [editingAddress, getAuthHeaders, fetchAddresses, handleApiError],
  );

  const deleteAddress = useCallback(
    async (id: number) => {
      if (!confirm("Are you sure you want to delete this address?")) return;
      try {
        const res = await fetch(`${API_BASE_URL}/shipping-addresses/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.status) fetchAddresses();
        else
          alert(`Failed to delete address: ${data.message || "Unknown error"}`);
      } catch (err) {
        handleApiError(err, "Error deleting address");
      }
    },
    [getAuthHeaders, fetchAddresses, handleApiError],
  );

  const setDefaultAddress = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/shipping-addresses/${id}/set-default`,
          { method: "PUT", headers: getAuthHeaders() },
        );
        const data = await res.json();
        if (data.status) fetchAddresses();
        else alert(`Failed to set default: ${data.message || "Unknown error"}`);
      } catch (err) {
        handleApiError(err, "Error setting default address");
      }
    },
    [getAuthHeaders, fetchAddresses, handleApiError],
  );

  const updateUserProfile = useCallback(async () => {
    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("email", editForm.email);
    try {
      const res = await api.put(`/user`, formData, {
        headers: {
          Accept: "application/json",
        },
      });
      const data = res.data;
      if (data.status) {
        setUserProfile((prev) =>
          prev ? { ...prev, name: editForm.name, email: editForm.email } : null,
        );
        setIsEditing(false);
      } else {
        alert(`Failed to update profile: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      handleApiError(err, "Error updating profile");
    }
  }, [editForm, getAuthHeaders, handleApiError]);

  const handleEditToggle = useCallback(() => {
    if (isEditing && userProfile) {
      setEditForm({ name: userProfile.name, email: userProfile.email });
    }
    setIsEditing((prev) => !prev);
  }, [isEditing, userProfile]);

  const handleViewOrderDetails = useCallback(
    (order: Order) => fetchOrderDetails(order.id),
    [fetchOrderDetails],
  );

  const handleCloseOrderModal = useCallback(() => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleAddNewAddress = useCallback(() => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  }, []);

  const handleEditAddress = useCallback((addr: Address) => {
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  }, []);

  const handleCloseAddressModal = useCallback(() => {
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  }, []);

  const userInitials = useMemo(
    () =>
      userProfile?.name
        .split(" ")
        .map((n) => n[0])
        .join("") || "U",
    [userProfile],
  );

  useEffect(() => {
    fetchUserProfile();
    fetchOrders();
    fetchAddresses();
  }, [fetchUserProfile, fetchOrders, fetchAddresses]);

  if (isLoading) {
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
        subtitle="Manage your profile, settings, and account details."
      />
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="flex flex-col h-auto p-2 bg-background">
                    <TabsTrigger
                      value="profile"
                      className="flex items-center gap-3 justify-start p-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="orders"
                      className="flex items-center gap-3 justify-start p-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>My Orders</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="addresses"
                      className="flex items-center gap-3 justify-start p-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>My Addresses</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details and contact information
                        </CardDescription>
                      </div>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        onClick={handleEditToggle}
                        className="flex-shrink-0"
                      >
                        {isEditing ? "Cancel" : "Edit Profile"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <Avatar className="h-20 w-20 flex-shrink-0">
                        <AvatarImage
                          src={userProfile?.profile_image_url || ""}
                          alt={userProfile?.name || "User"}
                        />
                        <AvatarFallback className="text-lg">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-medium">
                          {userProfile?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {userProfile?.email}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="flex-shrink-0"
                        disabled={!isEditing}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Change Avatar
                      </Button>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, name: e.target.value }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              email: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={`${userProfile?.mobile_prefix || ""} ${userProfile?.mobile || ""}`}
                          readOnly
                        />
                      </div>
                      {userProfile?.referral_code && (
                        <div className="space-y-2">
                          <Label htmlFor="referral">Referral Code</Label>
                          <Input
                            id="referral"
                            value={userProfile.referral_code}
                            readOnly
                          />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={handleEditToggle}>
                          Cancel
                        </Button>
                        <Button onClick={updateUserProfile}>
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>
                          View your recent orders and their status
                        </CardDescription>
                      </div>
                      <Button
                        onClick={fetchOrders}
                        variant="outline"
                        className="flex-shrink-0"
                      >
                        Refresh Orders
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <p>Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          No orders yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't placed any orders yet.
                        </p>
                        <Button>Start Shopping</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <OrderItem
                            key={order.id}
                            order={order}
                            onViewDetails={handleViewOrderDetails}
                          />
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
                    onClick={handleAddNewAddress}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </div>
                {addressesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <p>Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No addresses yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't added any addresses yet.
                    </p>
                    <Button onClick={handleAddNewAddress}>
                      Add Your First Address
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        onEdit={handleEditAddress}
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
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
      />
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={handleCloseAddressModal}
        address={editingAddress}
        onSave={saveAddress}
      />
    </Section>
  );
};

export default AccountPage;
