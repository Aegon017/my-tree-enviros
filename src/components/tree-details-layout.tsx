"use client";

import { Markup } from "interweave";
import { Calendar, Leaf, Minus, Plus, Trees, User, Users } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import BreadcrumbNav from "@/components/breadcrumb-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lens } from "@/components/ui/lens";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { Tree } from "@/types/tree";

const sponsorshipDetailsSchema = z.object({
  area_id: z.string().min(1, "Please select an area."),
  name: z.string().min(1, "Name is required."),
  occasion: z.string().min(1, "Occasion is required."),
  message: z.string().min(1, "Message is required."),
});

type SponsorshipDetailsValues = z.infer<typeof sponsorshipDetailsSchema>;

interface TreeDetailsLayoutProps {
  tree: Tree | undefined;
  isLoading: boolean;
  pageType: "sponsor" | "adopt";
}

export default function
  TreeDetailsLayout( { tree, isLoading, pageType }: TreeDetailsLayoutProps ) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedYears, setSelectedYears] = useState(1);
  const [loginOpen, setLoginOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [otpStep, setOtpStep] = useState<"signin" | "verify">("signin");
  const [otpCC, setOtpCC] = useState<string | undefined>(undefined);
  const [otpPhone, setOtpPhone] = useState<string | undefined>(undefined);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);

  const form = useForm<SponsorshipDetailsValues>({
    resolver: zodResolver(sponsorshipDetailsSchema),
    defaultValues: {
      area_id: "",
      name: "",
      occasion: "",
      message: "",
    },
  });

  const allImages = useMemo(
    () => (tree ? [tree.main_image_url, ...(tree.images?.map((img: { image_url: string }) => img.image_url) || [])].filter(Boolean) : []),
    [tree]
  );

  const planOptions = useMemo(() => {
    const list = ((tree as any)?.plan_prices ?? []).map((pp: any) => {
        const duration = Number(pp?.plan?.duration ?? 0);
        const durationDisplay = String(pp?.plan?.duration_display ?? (duration ? `${duration} Year${duration > 1 ? "s" : ""}` : ""));
        const features = Array.isArray(pp?.plan?.features) ? pp.plan.features : [];
        const priceNumeric = typeof pp?.numeric_price === "number" ? pp.numeric_price : Number(String(pp?.price ?? "0").replace(/,/g, ""));
        return { id: Number(pp?.id ?? 0), duration, durationDisplay, features, priceNumeric };
      }) || [];
    return list.filter((o: { duration: number }) => o.duration > 0);
  }, [(tree as any)?.plan_prices]);

  useEffect(() => {
    if (planOptions.length > 0) {
      const durations = planOptions.map((p: { duration: number }) => p.duration);
      if (!durations.includes(selectedYears)) {
        const defaultDuration = durations.includes(1) ? 1 : Math.min(...durations);
        setSelectedYears(defaultDuration);
      }
    }
  }, [planOptions, selectedYears]);

  const maxAvailableDuration = useMemo(() => {
    if (planOptions.length === 0) return 1;
    return Math.max(...planOptions.map((p: { duration: number }) => p.duration));
  }, [planOptions]);

  const mainImage = allImages[selectedImage] || "/placeholder.jpg";

  const priceOption = useMemo(() => planOptions.find((p: { duration: number }) => p.duration === selectedYears), [planOptions, selectedYears]);

  const totalPrice = useMemo(() => (priceOption ? Number(priceOption.priceNumeric) * quantity : 0), [priceOption, quantity]);

  const handleQuantityChange = (value: number) => {
    if (tree && value >= 1 && value <= (tree.quantity || 999)) setQuantity(value);
  };

  const handleYearsChange = (value: number) => {
    if (value >= 1 && value <= maxAvailableDuration) setSelectedYears(value);
  };

  const pageTitle = pageType === 'sponsor' ? "Sponsor A Tree" : "Adopt A Tree";
  const breadcrumbItems = useMemo(() => [
      { title: "Home", href: "/" },
      { title: pageTitle, href: `/${pageType}-a-tree` },
      { title: tree?.name || "Tree Details", href: "" },
    ], [tree?.name, pageTitle, pageType]);

  const onAddToCart = async (values: SponsorshipDetailsValues) => {
    if (!tree || !priceOption) return;
    setIsAddingToCart(true);
    try {
      const details = { ...values, duration: selectedYears, quantity };
      localStorage.setItem(`tree_details_${tree.id}`, JSON.stringify(details));
      if (isAuthenticated) {
        await cartService.addTreeToCart({
          tree_id: tree.id,
          location_id: Number(values.area_id),
          tree_plan_price_id: priceOption.id,
          name: values.name || undefined,
          occasion: values.occasion || undefined,
          message: values.message || undefined,
          quantity: quantity,
        });
        toast.success("Tree added to cart successfully!");
      } else {
        addToCart({
          id: tree.id,
          name: tree.name,
          type: "tree",
          price: Number(priceOption.priceNumeric),
          quantity,
          image: mainImage,
          metadata: {
            duration: selectedYears,
            occasion: values.occasion,
            message: values.message,
            location_id: Number(values.area_id),
            plan_id: priceOption.id,
          },
        } as any);
        toast.success("Tree added to cart!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add tree to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const onSponsorNow = (values: SponsorshipDetailsValues) => {
    if (!tree || !priceOption) return;
    const details = { ...values, duration: selectedYears, quantity };
    localStorage.setItem(`tree_details_${tree.id}`, JSON.stringify(details));
    if (isAuthenticated) {
      setShowRazorpay(true);
    } else {
      setLoginOpen(true);
    }
  };

  const handleLoginSuccess = async () => {
    setLoginOpen(false);
    if (tree && priceOption) {
      setShowRazorpay(true);
    }
    setOtpStep("signin");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-background">
      <BreadcrumbNav items={breadcrumbItems} className="mb-8" />
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6 lg:sticky top-24 self-start">
            {isLoading ? (
              <Skeleton className="aspect-square rounded-2xl" />
            ) : tree ? (
              <>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/30 border">
                  <Lens zoomFactor={2.5}>
                    <Image src={mainImage} alt={tree.name} width={1080} height={1080} className="object-cover" priority />
                  </Lens>
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {allImages.map((imageUrl, index) => (
                      <Button variant="outline" key={index} type="button" className={`relative h-20 w-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImage === index ? "border-primary ring-2 ring-primary/20" : "border-muted hover:border-muted-foreground/30"}`} onClick={() => setSelectedImage(index)}>
                        <Image src={imageUrl} alt={`${tree.name} view ${index + 1}`} fill className="object-cover" sizes="80px" priority />
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
                    <Badge variant="outline" className="px-3 py-1"><Leaf className="h-3 w-3 mr-1" />{tree.age} years old</Badge>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight from-foreground to-foreground/80 bg-clip-text text-transparent">{tree.name}</h1>
                </div>
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Configure Your {pageType === 'sponsor' ? 'Sponsorship' : 'Adoption'}</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-2"><Trees className="h-4 w-4" />Number of Trees</Label>
                          <div className="flex items-center border rounded-lg bg-background justify-between">
                            <Button variant="ghost" size="icon" type="button" className="h-10 w-10 rounded-r-none" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" min="1" max={tree.quantity || 999} value={quantity} onChange={(e) => handleQuantityChange(Number(e.target.value))} className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            <Button variant="ghost" size="icon" type="button" className="h-10 w-10 rounded-l-none" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= (tree.quantity || 999)}><Plus className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-2"><Calendar className="h-4 w-4" />Duration (Years)</Label>
                          <div className="flex items-center border rounded-lg bg-background justify-between">
                            <Button variant="ghost" size="icon" type="button" className="h-10 w-10 rounded-r-none" onClick={() => handleYearsChange(selectedYears - 1)} disabled={selectedYears <= 1}><Minus className="h-4 w-4" /></Button>
                            <Input type="number" min="1" max={maxAvailableDuration} value={selectedYears} onChange={(e) => handleYearsChange(Number(e.target.value))} className="w-16 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            <Button variant="ghost" size="icon" type="button" className="h-10 w-10 rounded-l-none" onClick={() => handleYearsChange(selectedYears + 1)} disabled={selectedYears >= maxAvailableDuration}><Plus className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                      {planOptions.length > 0 && (
                        <div className="space-y-4">
                          <div className="bg-primary/5 p-4 rounded-lg border">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-semibold">Total Contribution</span>
                                <p className="text-sm text-muted-foreground">{quantity} tree{quantity > 1 ? "s" : ""} × {selectedYears} year{selectedYears > 1 ? "s" : ""}</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1"><span className="text-3xl font-bold text-primary">₹{totalPrice.toLocaleString("en-IN")}</span></div>
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
                    <h3 className="text-xl font-semibold mb-6">Add Your Details</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="area_id" render={({ field }) => (<FormItem><FormLabel>Area</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-11 w-full"><SelectValue placeholder="Select area" /></SelectTrigger></FormControl><SelectContent>{(tree as any)?.locations?.map((loc: any) => (<SelectItem key={loc.id} value={String(loc.id)}>{loc.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input className="h-11 w-full" placeholder="Name on certificate" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="occasion" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Occasion</FormLabel><FormControl><Input className="h-11 w-full" placeholder="e.g., Birthday, Anniversary" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="message" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Special Message</FormLabel><FormControl><Textarea className="w-full resize-none" rows={3} placeholder="A message for the certificate" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 w-full" disabled={!priceOption || isAddingToCart} onClick={form.handleSubmit(onAddToCart)}>{isAddingToCart ? "Adding..." : "Add To Cart"}</Button>
                  {showRazorpay && isAuthenticated ? (
                    <RazorpayButton type={1} productType={1} cartType={2} label={`${pageType === 'sponsor' ? 'Sponsor' : 'Adopt'} Now`} productId={tree.id} amount={Number(totalPrice)} duration={selectedYears} quantity={quantity} area_id={Number(form.getValues("area_id"))} name={form.getValues("name")} occasion={form.getValues("occasion")} message={form.getValues("message")} tree_instance_id={tree.id} plan_id={priceOption.id} />
                  ) : (
                    <Button type="button" className="flex-1 w-full" onClick={form.handleSubmit(onSponsorNow)} disabled={!priceOption}>{`${pageType === 'sponsor' ? 'Sponsor' : 'Adopt'} Now`}</Button>
                  )}
                </div>
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                  <DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>Login to continue</DialogTitle></DialogHeader>{otpStep === "signin" ? <SigninForm onOtpSent={({ country_code, phone }) => { setOtpCC(country_code); setOtpPhone(phone); setOtpStep("verify"); }} /> : <VerifyOtpForm country_code={otpCC} phone={otpPhone} onSuccess={handleLoginSuccess} />}</DialogContent>
                </Dialog>
              </>
            ) : null}
          </div>
        </form>
      </Form>

      {!isLoading && tree && (
        <div className="mt-16">
            {((tree as any)?.sponsors ?? []).length > 0 && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Recent Sponsors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {((tree as any).sponsors ?? []).map((sponsor: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted rounded-full p-2"><User className="h-5 w-5 text-muted-foreground" /></div>
                                        <div>
                                            <p className="font-semibold">{sponsor.name}</p>
                                            <p className="text-sm text-muted-foreground">{sponsor.duration} year{sponsor.duration > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-1 max-w-md mx-auto mb-8">
              <TabsTrigger value="description" className="flex items-center gap-2">About This Tree</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-6">
              <Card className="bg-card"><CardContent className="p-8"><Markup className="prose max-w-none dark:prose-invert" content={tree.description} /></CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
