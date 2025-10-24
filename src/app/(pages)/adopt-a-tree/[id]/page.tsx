"use client";

import {
  Calendar,
  MapPin,
  ShieldCheck,
  Trees,
  Leaf,
  Minus,
  Plus,
  Star,
} from "lucide-react";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tree } from "@/types/tree";
import { use, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Markup } from "interweave";
import { Lens } from "@/components/ui/lens";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import api from "@/lib/axios";
import { authStorage } from "@/lib/auth-storage";

const fetcher = (url: string, _token: string | null) =>
  api.get(url).then((res) => res.data);

async function cartMutation(
  [url, action]: [string, string],
  { arg }: { arg: { token: string; body: any } },
) {
  const { body } = arg;
  const res = await api.post(url, body);

  // Axios throws on non-2xx; if we get here, it's OK
  return res.data;
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: Props) {
  const { id } = use(params);
  const token = "";
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedYears, setSelectedYears] = useState(1);
  const [areaId, setAreaId] = useState<number | undefined>(undefined);
  const [personName, setPersonName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [specialMessage, setSpecialMessage] = useState("");

  type DetailsFormValues = {
    area_id: string;
    name: string;
    occasion: string;
    message: string;
  };

  const form = useForm<DetailsFormValues>({
    defaultValues: {
      area_id: "",
      name: "",
      occasion: "",
      message: "",
    },
  });

  const {
    data: response,
    error,
    isLoading,
  } = useSWR(
    id
      ? [`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tree/${id}`, token]
      : null,
    ([url, token]) => fetcher(url, token),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const tree: Tree = response?.data;
  const mainImage =
    tree?.images?.[selectedImage]?.image_url || "/placeholder.jpg";
  const averageRating = tree?.reviews?.length
    ? tree.reviews.reduce((sum, r) => sum + r.rating, 0) / tree.reviews.length
    : 0;

  const { trigger: addTrigger, isMutating: isAdding } = useSWRMutation(
    [`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/cart/add/${id}`, "add"],
    cartMutation,
  );

  const { trigger: sponsorTrigger, isMutating: isSponsoring } = useSWRMutation(
    [`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/cart/add/${id}`, "sponsor"],
    cartMutation,
  );

  const handleQuantityChange = (value: number) => {
    if (tree && value >= 1 && value <= tree.quantity) setQuantity(value);
  };

  const handleYearsChange = (value: number) => {
    if (tree && value >= 1 && value <= 50) setSelectedYears(value);
  };

  const getPriceForDuration = (duration: number) => {
    const priceOption = tree?.price?.find((p) => p.duration === duration);
    return priceOption ? parseFloat(priceOption.price) : 0;
  };

  const handleAddToCart = async () => {
    if (!token) {
      toast.error("Please login to add to cart");
      return;
    }

    if (!tree || quantity === 0 || quantity > tree.quantity) return;

    const priceOption = tree.price.find((p) => p.duration === selectedYears);
    if (!priceOption) {
      toast.error("Invalid duration selected");
      return;
    }

    const body = {
      quantity: quantity,
      type: 1,
      product_type: 1,
      cart_type: 1,
      duration: selectedYears,
      price_option_id: priceOption.id,
      name: personName,
      occasion: occasion,
      message: specialMessage,
      location_id: areaId,
    };

    try {
      const result = await addTrigger({ token, body });

      if (result.status) {
        toast.success(
          `Added ${quantity} tree${quantity > 1 ? "s" : ""} to cart`,
        );
      } else {
        throw new Error(result.message || "Failed to add to cart");
      }
    } catch (err) {
      toast.error(
        `Failed to add to cart - ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleSponsorPlant = async () => {
    if (!token) {
      toast.error("Please login to sponsor trees");
      return;
    }

    if (!tree || quantity === 0 || quantity > tree.quantity) return;

    const priceOption = tree.price.find((p) => p.duration === selectedYears);
    if (!priceOption) {
      toast.error("Invalid duration selected");
      return;
    }

    const body = {
      quantity: quantity,
      type: 1,
      product_type: 2,
      cart_type: 2,
      duration: selectedYears,
      price_option_id: priceOption.id,
      name: personName,
      occasion: occasion,
      message: specialMessage,
      location_id: areaId,
    };

    try {
      const result = await sponsorTrigger({ token, body });

      if (result.status) {
        toast.success(
          `Sponsored ${quantity} tree${quantity > 1 ? "s" : ""} for ${selectedYears} year${selectedYears > 1 ? "s" : ""}`,
        );
      } else {
        throw new Error(result.message || "Failed to sponsor tree");
      }
    } catch (err) {
      toast.error(
        `Failed to sponsor tree - ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/" },
    { title: "Adopt A Tree", href: "/adopt-a-tree" },
    { title: tree?.name || "Tree Details", href: "" },
  ];

  const priceOption = tree?.price?.find((p) => p.duration === selectedYears);

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
        <div className="space-y-6 sticky top-24 self-start">
          {isLoading ? (
            <Skeleton className="aspect-square rounded-2xl" />
          ) : tree ? (
            <>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/30 border">
                <Lens zoomFactor={2}>
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

              {tree.images && tree.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {(tree?.images || [])
                    .map((img) => img.image_url)
                    .map((imageUrl, index) => (
                      <Button
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

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    {tree.reviews?.length || 0} review
                    {tree.reviews?.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      {tree.price_info}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-semibold">
                          {tree.city?.name}, {tree.state?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                            max={tree.quantity}
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
                            disabled={quantity >= tree.quantity}
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
                            max="50"
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
                            disabled={selectedYears >= 50}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

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
                                ₹
                                {(
                                  getPriceForDuration(selectedYears) * quantity
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleAddToCart}
                          disabled={isAdding || !priceOption}
                        >
                          {isAdding ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-accent-foreground" />
                              Adding...
                            </>
                          ) : (
                            "Add To Cart"
                          )}
                        </Button>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleSponsorPlant}
                          disabled={isSponsoring || !priceOption}
                        >
                          {isSponsoring ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-accent-foreground" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Leaf className="mr-2 h-5 w-5" />
                              Sponsor Now
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>

      <Card className="border-l-4 border-l-primary mt-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6">Add Your Details</h3>
          <Form {...form}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                          <SelectContent>
                            {(tree as any)?.locations?.map((loc: any) => (
                              <SelectItem key={loc.id} value={String(loc.id)}>
                                {loc.name}
                              </SelectItem>
                            ))}
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
                          rows={3}
                          placeholder="Write a message to be associated with this adoption"
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
                These details will be saved with your cart item and can be
                edited in the cart before payment.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>

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
              <Card>
                <CardContent className="p-8">
                  <div className="max-w-none">
                    <Markup content={tree.description} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
