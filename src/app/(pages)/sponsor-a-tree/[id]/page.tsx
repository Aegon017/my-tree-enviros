"use client";

import { Markup } from "interweave";
import {
  Calendar,
  Leaf,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Trees,
} from "lucide-react";
import Image from "next/image";
import { use, useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lens } from "@/components/ui/lens";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/axios";
import type { Tree } from "@/types/tree";
import RazorpayButton from "@/components/razorpay-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SigninForm } from "@/components/sign-in-form";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { VerifyOtpForm } from "@/components/verify-otp-form";
import { cartService } from "@/services/cart.service";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: Props) {
  const { id } = use(params);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedYears, setSelectedYears] = useState(1);
  const [areaId, setAreaId] = useState<number | undefined>(undefined);
  const [personName, setPersonName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [specialMessage, setSpecialMessage] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [otpStep, setOtpStep] = useState<"signin" | "verify">("signin");
  const [otpCC, setOtpCC] = useState<string | undefined>(undefined);
  const [otpPhone, setOtpPhone] = useState<string | undefined>(undefined);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);

  type DetailsFormValues = {
    area_id: string;
    name: string;
    occasion: string;
    message: string;
  };

  const form = useForm<DetailsFormValues>({
    defaultValues: {
      area_id: areaId ? String(areaId) : "",
      name: personName,
      occasion,
      message: specialMessage,
    },
  });

  const {
    data: response,
    error,
    isLoading,
  } = useSWR(id ? `/trees/${id}` : null, fetcher, {
    revalidateOnFocus: false,
  });

  const tree = response?.data?.tree;

  const allImages = useMemo(
    () =>
      tree
        ? [
            ...(tree.images?.map(
              (img: { image_url: string }) => img.image_url,
            ) || []),
          ]
        : [],
    [tree],
  );

  const planOptions = useMemo(() => {
    const list =
      (tree?.plan_prices ?? []).map((pp: any) => {
        const duration = Number(pp?.plan?.duration ?? 0);

        const durationDisplay = String(
          pp?.plan?.duration_display ??
            (duration ? `${duration} Year${duration > 1 ? "s" : ""}` : ""),
        );

        const features = Array.isArray(pp?.plan?.features)
          ? pp.plan.features
          : [];

        const priceNumeric =
          typeof pp?.numeric_price === "number"
            ? pp.numeric_price
            : Number(String(pp?.price ?? "0").replace(/,/g, ""));

        return {
          id: Number(pp?.id ?? 0),
          duration,
          durationDisplay,
          features,
          priceNumeric,
        };
      }) || [];

    return list.filter((o: { duration: number }) => o.duration > 0);
  }, [tree?.plan_prices]);

  // Ensure a valid default duration is selected when 1-year is unavailable
  useEffect(() => {
    if (planOptions.length > 0) {
      const durations = planOptions.map(
        (p: { duration: number }) => p.duration,
      );
      if (!durations.includes(selectedYears)) {
        const defaultDuration = durations.includes(1)
          ? 1
          : Math.min(...durations);
        setSelectedYears(defaultDuration);
      }
    }
  }, [planOptions, selectedYears]);

  const maxAvailableDuration = useMemo(() => {
    if (planOptions.length === 0) return 1;
    return Math.max(
      ...planOptions.map((p: { duration: number }) => p.duration),
    );
  }, [planOptions]);

  const mainImage = allImages[selectedImage] || "/placeholder.jpg";

  const averageRating = useMemo(
    () =>
      tree?.reviews?.length
        ? tree.reviews.reduce(
            (sum: number, r: { rating: number }) => sum + r.rating,
            0,
          ) / tree.reviews.length
        : 0,
    [tree?.reviews],
  );

  const priceOption = useMemo(
    () =>
      planOptions.find(
        (p: { duration: number }) => p.duration === selectedYears,
      ),
    [planOptions, selectedYears],
  );

  const totalPrice = useMemo(
    () => (priceOption ? Number(priceOption.priceNumeric) * quantity : 0),
    [priceOption, quantity],
  );

  const handleQuantityChange = (value: number) => {
    if (tree && value >= 1 && value <= (tree.quantity || 999))
      setQuantity(value);
  };

  const handleYearsChange = (value: number) => {
    if (value >= 1 && value <= maxAvailableDuration) setSelectedYears(value);
  };

  const breadcrumbItems = useMemo(
    () => [
      { title: "Home", href: "/" },
      { title: "Sponsor A Tree", href: "/sponsor-a-tree" },
      { title: tree?.name || "Tree Details", href: "" },
    ],
    [tree?.name],
  );

  const handleAddToCart = async () => {
    if (!tree || !priceOption) return;

    setIsAddingToCart(true);
    try {
      const details = {
        area_id: areaId,
        name: personName,
        occasion,
        message: specialMessage,
        duration: selectedYears,
        quantity,
      };

      // Persist details locally keyed to tree id
      localStorage.setItem(`tree_details_${id}`, JSON.stringify(details));

      if (isAuthenticated) {
        // For authenticated users, add to cart via API
        await cartService.addTreeToCart({
          tree_id: tree.id,
          location_id: areaId,
          tree_plan_price_id: priceOption.id,
          name: personName || undefined,
          occasion: occasion || undefined,
          message: specialMessage || undefined,
          quantity: quantity,
        });
        toast.success("Tree added to cart successfully!");
      } else {
        // For unauthenticated users, add to local cart
        addToCart({
          id: tree.id,
          name: tree.name,
          type: "tree",
          price: Number(priceOption.priceNumeric),
          quantity,
          image: mainImage,
          metadata: {
            duration: selectedYears,
            occasion,
            message: specialMessage,
            location_id: areaId,
            plan_id: priceOption.id,
          },
        });
        toast.success("Tree added to cart!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add tree to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleSponsorNow = () => {
    if (!tree || !priceOption) return;

    const details = {
      area_id: areaId,
      name: personName,
      occasion,
      message: specialMessage,
      duration: selectedYears,
      quantity,
    };

    // Persist details locally
    localStorage.setItem(`tree_details_${id}`, JSON.stringify(details));

    if (isAuthenticated) {
      // For authenticated users, show Razorpay button
      setShowRazorpay(true);
    } else {
      // For unauthenticated users, open login dialog
      setLoginOpen(true);
    }
  };

  const handleLoginSuccess = async () => {
    setLoginOpen(false);

    // After successful login, show Razorpay button
    if (tree && priceOption) {
      setShowRazorpay(true);
    }

    setOtpStep("signin");
  };

  if (error) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh] bg-background">
        <Card className="w-full max-w-md border-destructive/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <Trees className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-destructive">
              Error Loading Tree
            </h2>
            <p className="text-muted-foreground">
              Sorry, we couldn't load the tree details. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-background">
      <BreadcrumbNav items={breadcrumbItems} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6 lg:sticky top-24 self-start">
          {isLoading ? (
            <Skeleton className="aspect-square rounded-2xl" />
          ) : tree ? (
            <>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/30 border">
                <Lens zoomFactor={2.5}>
                  <Image
                    src={mainImage}
                    alt={tree.name}
                    width={1080}
                    height={1080}
                    className="object-cover"
                    priority
                  />
                </Lens>
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((imageUrl, index) => (
                    <Button
                      variant="outline"
                      key={index}
                      className={`relative h-20 w-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-muted hover:border-muted-foreground/30"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${tree.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                        priority
                      />
                    </Button>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="space-y-8">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </>
          ) : tree ? (
            <>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="outline" className="px-3 py-1">
                    <Leaf className="h-3 w-3 mr-1" />
                    {tree.age} years old
                  </Badge>
                </div>

                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {tree.name}
                </h1>
              </div>
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Configure Your Sponsorship
                  </h3>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Trees className="h-4 w-4" />
                          Number of Trees
                        </Label>
                        <div className="flex items-center border rounded-lg bg-background justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-r-none"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={tree.quantity || 999}
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(Number(e.target.value))
                            }
                            className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= (tree.quantity || 999)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Duration (Years)
                        </Label>
                        <div className="flex items-center border rounded-lg bg-background justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-r-none"
                            onClick={() => handleYearsChange(selectedYears - 1)}
                            disabled={selectedYears <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={maxAvailableDuration}
                            value={selectedYears}
                            onChange={(e) =>
                              handleYearsChange(Number(e.target.value))
                            }
                            className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-l-none"
                            onClick={() => handleYearsChange(selectedYears + 1)}
                            disabled={selectedYears >= maxAvailableDuration}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {planOptions.length > 0 && (
                      <div className="space-y-4">
                        <div className="bg-primary/5 p-4 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-semibold">
                                Total Contribution
                              </span>
                              <p className="text-sm text-muted-foreground">
                                {quantity} tree{quantity > 1 ? "s" : ""} ×{" "}
                                {selectedYears} year
                                {selectedYears > 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <span className="text-3xl font-bold text-primary">
                                  ₹{totalPrice.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-primary mt-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6">
                    Add Your Details
                  </h3>
                  <Form {...form}>
                    <form
                      className="space-y-6"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="area_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={(val) => {
                                    field.onChange(val);
                                    setAreaId(val ? Number(val) : undefined);
                                  }}
                                >
                                  <SelectTrigger className="h-11 w-full">
                                    <SelectValue placeholder="Select area" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(tree as any)?.locations?.map(
                                      (loc: any) => (
                                        <SelectItem
                                          key={loc.id}
                                          value={String(loc.id)}
                                        >
                                          {loc.name}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  className="h-11 w-full"
                                  placeholder="Name on certificate"
                                  value={field.value}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    setPersonName(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="occasion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Occasion</FormLabel>
                              <FormControl>
                                <Input
                                  className="h-11 w-full"
                                  placeholder="e.g., Birthday, Anniversary"
                                  value={field.value}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    setOccasion(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Special Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  className="h-11 w-full resize-none"
                                  rows={3}
                                  placeholder="Write a message to be associated with this sponsorship"
                                  value={field.value}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    setSpecialMessage(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <p className="text-sm text-muted-foreground">
                        These details will be saved with your cart item and can
                        be edited in the cart before payment.
                      </p>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 w-full"
                  disabled={!priceOption || isAddingToCart}
                  onClick={handleAddToCart}
                >
                  {isAddingToCart ? "Adding..." : "Add To Cart"}
                </Button>

                {showRazorpay && isAuthenticated ? (
                  <RazorpayButton
                    type={1}
                    productType={1}
                    cartType={2}
                    shippingAddressId={0}
                    label="Sponsor Now"
                    productId={tree.id}
                    amount={Number(totalPrice)}
                    duration={selectedYears}
                    quantity={quantity}
                    area_id={areaId}
                    name={personName}
                    occasion={occasion}
                    message={specialMessage}
                    plan_id={priceOption.id}
                  />
                ) : (
                  <Button
                    className="flex-1 w-full"
                    onClick={handleSponsorNow}
                    disabled={!priceOption}
                  >
                    Sponsor Now
                  </Button>
                )}
              </div>

              <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogContent className="sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Login to continue</DialogTitle>
                  </DialogHeader>
                  {otpStep === "signin" ? (
                    <SigninForm
                      onOtpSent={({ country_code, phone }) => {
                        setOtpCC(country_code);
                        setOtpPhone(phone);
                        setOtpStep("verify");
                      }}
                    />
                  ) : (
                    <VerifyOtpForm
                      country_code={otpCC}
                      phone={otpPhone}
                      onSuccess={handleLoginSuccess}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </>
          ) : null}
        </div>
      </div>

      {!isLoading && tree && (
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-1 max-w-md mx-auto mb-8">
              <TabsTrigger
                value="description"
                className="flex items-center gap-2"
              >
                About This Tree
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-6">
              <Card className="bg-card">
                <CardContent className="p-8">
                  <div className="prose max-w-none dark:prose-invert">
                    <Markup content={tree.description} />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Plan Options</h3>
                    {planOptions.length > 0 ? (
                      <div className="space-y-3">
                        {planOptions.map(
                          (p: {
                            id: number;
                            duration: number;
                            durationDisplay: string;
                            features: string[];
                            priceNumeric: number;
                          }) => (
                            <div
                              key={p.id}
                              className="rounded-lg border bg-background px-4 py-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">
                                  {p.durationDisplay}
                                </div>
                                <div className="text-right font-semibold">
                                  ₹
                                  {Number(p.priceNumeric).toLocaleString(
                                    "en-IN",
                                  )}
                                </div>
                              </div>
                              {p.features && p.features.length > 0 && (
                                <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {p.features.map((f: string, idx: number) => (
                                    <li key={idx}>{f}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No plans available.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Available Locations
                    </h3>
                    {Array.isArray((tree as any).locations) &&
                    (tree as any).locations.length > 0 ? (
                      <ul className="space-y-2">
                        {(tree as any).locations.map((loc: any) => (
                          <li
                            key={loc.id}
                            className="flex items-center justify-between rounded-lg border bg-background px-4 py-2"
                          >
                            <span className="text-sm font-medium">
                              {loc.name}
                            </span>
                            <Badge variant="secondary">Active</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Location info not available.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
