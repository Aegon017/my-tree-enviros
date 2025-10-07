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
import { use, useMemo, useState } from "react";
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
import AddToCartButton from "@/components/add-to-cart-button";

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

  const {
    data: response,
    error,
    isLoading,
  } = useSWR(id ? `/api/tree/${id}` : null, fetcher, {
    revalidateOnFocus: false,
  });

  const tree: Tree = response?.data;

  const allImages = useMemo(
    () =>
      tree
        ? [
            tree.main_image_url,
            ...(tree.images?.map((img) => img.image_url) || []),
          ]
        : [],
    [tree],
  );

  const maxAvailableDuration = useMemo(() => {
    if (!tree?.price) return 1;
    return Math.max(...tree.price.map((p) => p.duration));
  }, [tree?.price]);

  const mainImage = allImages[selectedImage] || "/placeholder.jpg";

  const averageRating = useMemo(
    () =>
      tree?.reviews?.length
        ? tree.reviews.reduce((sum, r) => sum + r.rating, 0) /
          tree.reviews.length
        : 0,
    [tree?.reviews],
  );

  const priceOption = useMemo(
    () => tree?.price?.find((p) => p.duration === selectedYears),
    [tree?.price, selectedYears],
  );

  const totalPrice = useMemo(
    () => (priceOption ? priceOption.price * quantity : 0),
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

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
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
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      {tree.price_info}
                    </span>
                  </div>
                  {tree.city && tree.state && (
                    <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-semibold">
                          {tree.city.name}, {tree.state.name}
                        </p>
                      </div>
                    </div>
                  )}
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

                    {tree.price && tree.price.length > 0 && (
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

                        <div className="flex gap-3">
                          <AddToCartButton
                            productId={tree.id}
                            quantity={quantity}
                            selectedYears={selectedYears}
                            priceOptionId={priceOption?.id}
                            productType={1}
                            cartType={1}
                            totalPrice={totalPrice}
                            disabled={!priceOption}
                          />
                          <RazorpayButton
                            type={1}
                            productType={1}
                            cartType={2}
                            shippingAddressId={0}
                            label="Sponsor Now"
                            productId={tree.id}
                            amount={Number(totalPrice)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
